import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB client
const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION || 'ap-south-1',
});

const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'ai-d-mart-users';

async function createAdminUser() {
    const adminId = uuidv4();
    const email = 'admin@aidmart.com'; // Change this to match your Cognito admin email
    const cognitoSub = 'REPLACE_WITH_COGNITO_SUB'; // You need to get this from Cognito

    const adminUser = {
        PK: `USER#${adminId}`,
        SK: `PROFILE#${adminId}`,
        id: adminId,
        cognitoSub: cognitoSub, // This should match the sub from Cognito
        email: email,
        name: 'Admin User',
        role: 'ADMIN',
        status: 'active',
        phone: '+911234567890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // GSI1 for role-based queries
        GSI1PK: 'ROLE#ADMIN',
        GSI1SK: `STATUS#active#${adminId}`,

        // GSI2 for Cognito sub lookup
        GSI2PK: `COGNITO#${cognitoSub}`,
        GSI2SK: 'PROFILE',
    };

    try {
        const command = new PutCommand({
            TableName: USERS_TABLE,
            Item: adminUser,
        });

        await docClient.send(command);
        console.log('✅ Admin user created successfully!');
        console.log('User ID:', adminId);
        console.log('Email:', email);
        console.log('Role: ADMIN');
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        throw error;
    }
}

// Run the script
createAdminUser()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
