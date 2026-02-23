import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
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

async function fixCustomerCognitoSub() {
    const email = 'arunachalamk015@gmail.com';
    
    try {
        console.log('Finding customer in DynamoDB...');
        
        // Find customer in DynamoDB
        const scanCommand = new ScanCommand({
            TableName: 'ai-d-mart-users',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        });

        const result = await docClient.send(scanCommand);
        const customer = result.Items?.[0];

        if (!customer) {
            console.log('❌ Customer not found in DynamoDB');
            return;
        }

        console.log('✅ Found customer in DynamoDB:', customer.id);

        // Try to find user in Cognito by email
        console.log('Looking for user in Cognito...');
        
        try {
            const getUserCommand = new AdminGetUserCommand({
                UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
                Username: email
            });

            const cognitoUser = await cognitoClient.send(getUserCommand);
            console.log('✅ Found user in Cognito');
            console.log('Cognito Username:', cognitoUser.Username);
            console.log('Cognito UserSub:', cognitoUser.UserAttributes?.find(attr => attr.Name === 'sub')?.Value);

            const cognitoSub = cognitoUser.UserAttributes?.find(attr => attr.Name === 'sub')?.Value;

            if (cognitoSub && cognitoSub !== customer.cognitoSub) {
                console.log('Updating DynamoDB with correct Cognito sub...');
                
                const updateCommand = new UpdateCommand({
                    TableName: 'ai-d-mart-users',
                    Key: {
                        PK: customer.PK,
                        SK: customer.SK
                    },
                    UpdateExpression: 'SET cognitoSub = :sub, updatedAt = :now',
                    ExpressionAttributeValues: {
                        ':sub': cognitoSub,
                        ':now': new Date().toISOString()
                    }
                });

                await docClient.send(updateCommand);
                console.log('✅ Updated customer with correct Cognito sub');
            } else {
                console.log('✅ Cognito sub already matches');
            }

        } catch (cognitoError: any) {
            if (cognitoError.name === 'UserNotFoundException') {
                console.log('❌ User not found in Cognito. They need to register first.');
            } else {
                console.error('❌ Error finding user in Cognito:', cognitoError.message);
            }
        }

        console.log('\n=== Customer Login Details ===');
        console.log('Email:', email);
        console.log('Password: Test1234@#');
        console.log('Role: CUSTOMER');
        console.log('Status:', customer.status);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixCustomerCognitoSub();