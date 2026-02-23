import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const dynamoClient = new DynamoDBClient({
    region: process.env.APP_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
});

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.COGNITO_REGION!,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

async function createCustomer() {
    const email = 'arunachalamk015@gmail.com';
    const password = 'Test1234@#';
    const name = 'Arun Achalam';
    
    try {
        console.log('Creating customer in Cognito...');
        
        // Create user in Cognito
        const username = `customer_${Date.now()}`; // Use a unique username
        const createUserCommand = new AdminCreateUserCommand({
            UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
            Username: username,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'email_verified', Value: 'true' },
                { Name: 'name', Value: name }
            ],
            MessageAction: 'SUPPRESS', // Don't send welcome email
            TemporaryPassword: password
        });

        const cognitoUser = await cognitoClient.send(createUserCommand);
        console.log('Cognito user created:', cognitoUser.User?.Username);

        // Set permanent password
        const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
            Username: username,
            Password: password,
            Permanent: true
        });

        await cognitoClient.send(setPasswordCommand);
        console.log('Password set as permanent');

        // Create user in DynamoDB
        const userId = uuidv4();
        const now = new Date().toISOString();

        const userItem = {
            PK: `USER#${userId}`,
            SK: 'PROFILE',
            id: userId,
            cognitoSub: cognitoUser.User?.Username || username,
            email: email,
            name: name,
            role: 'CUSTOMER',
            status: 'ACTIVE',
            walletBalance: 0,
            rewardPoints: 0,
            kycVerified: false,
            createdAt: now,
            updatedAt: now
        };

        const putCommand = new PutCommand({
            TableName: 'ai-d-mart-users',
            Item: userItem
        });

        await docClient.send(putCommand);
        console.log('Customer created in DynamoDB:', userId);

        console.log('✅ Customer created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role: CUSTOMER');

    } catch (error) {
        console.error('❌ Error creating customer:', error);
    }
}

createCustomer();