import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
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

const docClient = DynamoDBDocumentClient.from(dynamoClient);

async function addCustomerToDynamoDB() {
    const email = 'arunachalamk015@gmail.com';
    const name = 'Arun Achalam';
    
    try {
        console.log('Adding customer to DynamoDB...');

        // Create user in DynamoDB
        const userId = uuidv4();
        const now = new Date().toISOString();

        const userItem = {
            PK: `USER#${userId}`,
            SK: 'PROFILE',
            id: userId,
            cognitoSub: email, // Use email as cognito sub for now
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
        console.log('✅ Customer added to DynamoDB:', userId);

        console.log('Customer details:');
        console.log('Email:', email);
        console.log('Role: CUSTOMER');
        console.log('Status: ACTIVE');

    } catch (error) {
        console.error('❌ Error adding customer to DynamoDB:', error);
    }
}

addCustomerToDynamoDB();