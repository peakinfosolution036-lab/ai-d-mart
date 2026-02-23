/**
 * Script to create admin user with hardcoded credentials
 * Admin: admin123@gmail.com / Admin123
 * 
 * This script creates the admin in both Cognito and DynamoDB
 */

import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    ListUsersCommand,
    AttributeType,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
// Cognito region extracted from User Pool ID or env variable
const COGNITO_REGION = process.env.COGNITO_REGION || USER_POOL_ID?.split('_')[0] || 'ap-southeast-1';
// DynamoDB region
const DYNAMODB_REGION = process.env.APP_AWS_REGION || 'ap-south-1';
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'ai-d-mart-users';

// Admin credentials (hardcoded)
const ADMIN_EMAIL = 'admin123@gmail.com';
const ADMIN_PASSWORD = 'Admin123!'; // Include special character for password policy
const ADMIN_NAME = 'System Admin';

const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
    }
});

const ddbClient = new DynamoDBClient({
    region: DYNAMODB_REGION,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
    }
});

const docClient = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true
    }
});

async function checkAdminExists(): Promise<boolean> {
    try {
        const command = new ListUsersCommand({
            UserPoolId: USER_POOL_ID,
            Filter: `email = "${ADMIN_EMAIL}"`,
            Limit: 1,
        });
        const response = await cognitoClient.send(command);
        return (response.Users && response.Users.length > 0) || false;
    } catch (error) {
        console.log('Error checking if admin exists:', error);
        return false;
    }
}

async function createCognitoAdmin(): Promise<string | null> {
    try {
        // Check if admin already exists
        const exists = await checkAdminExists();
        if (exists) {
            console.log('Admin already exists in Cognito, skipping creation...');
            // Get the sub ID
            const command = new ListUsersCommand({
                UserPoolId: USER_POOL_ID,
                Filter: `email = "${ADMIN_EMAIL}"`,
                Limit: 1,
            });
            const response = await cognitoClient.send(command);
            const sub = response.Users?.[0]?.Attributes?.find((attr: AttributeType) => attr.Name === 'sub')?.Value;
            return sub || null;
        }

        console.log('Creating admin user in Cognito...');

        // Create the user with temporary password
        // Use a non-email username since pool uses email as alias
        const createCommand = new AdminCreateUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: 'admin123', // Use non-email username
            UserAttributes: [
                { Name: 'email', Value: ADMIN_EMAIL },
                { Name: 'name', Value: ADMIN_NAME },
                { Name: 'email_verified', Value: 'true' },
            ],
            TemporaryPassword: ADMIN_PASSWORD,
            MessageAction: 'SUPPRESS', // Don't send welcome email
        });

        const createResponse = await cognitoClient.send(createCommand);
        console.log('Admin user created in Cognito');

        // Set permanent password
        const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: USER_POOL_ID,
            Username: 'admin123', // Use same username as created
            Password: ADMIN_PASSWORD,
            Permanent: true,
        });

        await cognitoClient.send(setPasswordCommand);
        console.log('Admin password set to permanent');

        // Get the sub ID
        const sub = createResponse.User?.Attributes?.find((attr: AttributeType) => attr.Name === 'sub')?.Value;
        return sub || null;

    } catch (error: unknown) {
        const err = error as { name?: string };
        if (err.name === 'UsernameExistsException') {
            console.log('Admin user already exists in Cognito');
            // Get the sub ID
            const command = new ListUsersCommand({
                UserPoolId: USER_POOL_ID,
                Filter: `email = "${ADMIN_EMAIL}"`,
                Limit: 1,
            });
            const response = await cognitoClient.send(command);
            const sub = response.Users?.[0]?.Attributes?.find((attr: AttributeType) => attr.Name === 'sub')?.Value;
            return sub || null;
        }
        console.error('Error creating admin in Cognito:', error);
        return null;
    }
}

async function checkDynamoAdminExists(): Promise<boolean> {
    try {
        const command = new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :pk',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':pk': 'ROLE#ADMIN',
                ':email': ADMIN_EMAIL,
            },
        });
        const response = await docClient.send(command);
        return (response.Items && response.Items.length > 0) || false;
    } catch (error) {
        return false;
    }
}

async function createDynamoAdmin(cognitoSub: string): Promise<boolean> {
    try {
        // Check if admin already exists
        const exists = await checkDynamoAdminExists();
        if (exists) {
            console.log('Admin already exists in DynamoDB, skipping creation...');
            return true;
        }

        console.log('Creating admin user in DynamoDB...');

        const adminId = 'ADMIN-001';
        const now = new Date().toISOString();

        const item = {
            PK: `USER#${adminId}`,
            SK: 'PROFILE',
            GSI1PK: 'ROLE#ADMIN',
            GSI1SK: `STATUS#ACTIVE#${adminId}`,
            GSI2PK: `COGNITO#${cognitoSub}`,
            GSI2SK: 'PROFILE',
            id: adminId,
            cognitoSub: cognitoSub,
            clerkId: cognitoSub, // For backwards compatibility
            email: ADMIN_EMAIL,
            name: ADMIN_NAME,
            role: 'ADMIN',
            status: 'ACTIVE',
            walletBalance: 0,
            kycVerified: true,
            createdAt: now,
            updatedAt: now,
        };

        const command = new PutCommand({
            TableName: USERS_TABLE,
            Item: item,
        });

        await docClient.send(command);
        console.log('Admin user created in DynamoDB');
        return true;

    } catch (error) {
        console.error('Error creating admin in DynamoDB:', error);
        return false;
    }
}

async function main() {
    console.log('='.repeat(50));
    console.log('Creating Admin User');
    console.log('='.repeat(50));
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('='.repeat(50));

    // Create in Cognito
    const cognitoSub = await createCognitoAdmin();
    if (!cognitoSub) {
        console.error('Failed to create admin in Cognito');
        process.exit(1);
    }
    console.log(`Cognito sub: ${cognitoSub}`);

    // Create in DynamoDB
    const success = await createDynamoAdmin(cognitoSub);
    if (!success) {
        console.error('Failed to create admin in DynamoDB');
        process.exit(1);
    }

    console.log('='.repeat(50));
    console.log('Admin user created successfully!');
    console.log('='.repeat(50));
    console.log('You can now login with:');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('='.repeat(50));
}

main().catch(console.error);
