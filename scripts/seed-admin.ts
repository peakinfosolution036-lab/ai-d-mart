/**
 * Seed Admin User Script
 * 
 * This script creates an admin user in Cognito and DynamoDB.
 * Run with: npx ts-node --esm scripts/seed-admin.ts
 * Or: node --loader ts-node/esm scripts/seed-admin.ts
 */

import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.APP_AWS_REGION || 'ap-south-1';
const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'ap-south-1_absrjXOdM';
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'ai-d-mart-users';

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });
const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

async function seedAdmin() {
    const email = 'admin@aidmart.com';
    const password = 'Admin@123';
    const name = 'Super Admin';
    const userId = 'ADM0001';

    console.log('Creating admin user in Cognito...');

    try {
        // Create user in Cognito
        const createCommand = new AdminCreateUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'email_verified', Value: 'true' },
                { Name: 'name', Value: name },
            ],
            MessageAction: 'SUPPRESS', // Don't send welcome email
        });

        const createResult = await cognitoClient.send(createCommand);
        console.log('User created:', createResult.User?.Username);

        // Set permanent password
        const passwordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            Password: password,
            Permanent: true,
        });

        await cognitoClient.send(passwordCommand);
        console.log('Password set');

        // Add to admins group
        const groupCommand = new AdminAddUserToGroupCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            GroupName: 'admins',
        });

        await cognitoClient.send(groupCommand);
        console.log('Added to admins group');

        // Get Cognito sub
        const sub = createResult.User?.Attributes?.find(a => a.Name === 'sub')?.Value || '';

        // Create admin profile in DynamoDB
        console.log('Creating admin profile in DynamoDB...');

        const putCommand = new PutCommand({
            TableName: USERS_TABLE,
            Item: {
                PK: `USER#${userId}`,
                SK: 'PROFILE',
                GSI1PK: 'ROLE#ADMIN',
                GSI1SK: `STATUS#ACTIVE#${userId}`,
                id: userId,
                cognitoSub: sub,
                email,
                name,
                role: 'ADMIN',
                status: 'ACTIVE',
                department: 'Super Admin',
                isSuperAdmin: true,
                permissions: ['SUPER_ADMIN'],
                walletBalance: 0,
                rewardPoints: 0,
                kycVerified: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        });

        await docClient.send(putCommand);
        console.log('Admin profile created in DynamoDB');

        console.log('\n✅ Admin user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('User ID:', userId);

    } catch (error: any) {
        if (error.name === 'UsernameExistsException') {
            console.log('Admin user already exists');
        } else {
            console.error('Error:', error);
        }
    }
}

seedAdmin();
