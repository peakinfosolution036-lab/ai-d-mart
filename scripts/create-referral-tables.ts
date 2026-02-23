import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
});

export async function createReferralTables() {
    // Referrals Table
    const referralsTable = {
        TableName: 'referrals',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'referrerId', AttributeType: 'S' },
            { AttributeName: 'referredUserId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'referrer-index',
                KeySchema: [
                    { AttributeName: 'referrerId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            },
            {
                IndexName: 'referred-user-index',
                KeySchema: [
                    { AttributeName: 'referredUserId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    // Points Table
    const pointsTable = {
        TableName: 'user-points',
        KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    // Point Transactions Table
    const transactionsTable = {
        TableName: 'point-transactions',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'user-transactions-index',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    try {
        await client.send(new CreateTableCommand(referralsTable));
        await client.send(new CreateTableCommand(pointsTable));
        await client.send(new CreateTableCommand(transactionsTable));
        console.log('Referral tables created successfully');
    } catch (error) {
        console.error('Error creating referral tables:', error);
    }
}