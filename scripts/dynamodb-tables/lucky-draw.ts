import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!
    }
});

async function createLuckyDrawTables() {
    const tables: any[] = [
        {
            TableName: 'LuckyDrawSubscriptions',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' },
                { AttributeName: 'userId', AttributeType: 'S' }
            ],
            GlobalSecondaryIndexes: [{
                IndexName: 'UserIndex',
                KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }],
            BillingMode: 'PAY_PER_REQUEST'
        },
        {
            TableName: 'LuckyDrawProducts',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
            BillingMode: 'PAY_PER_REQUEST'
        },
        {
            TableName: 'NumberBookings',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' },
                { AttributeName: 'productId', AttributeType: 'S' },
                { AttributeName: 'userId', AttributeType: 'S' }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'ProductIndex',
                    KeySchema: [{ AttributeName: 'productId', KeyType: 'HASH' }],
                    Projection: { ProjectionType: 'ALL' },
                    BillingMode: 'PAY_PER_REQUEST'
                },
                {
                    IndexName: 'UserIndex',
                    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
                    Projection: { ProjectionType: 'ALL' },
                    BillingMode: 'PAY_PER_REQUEST'
                }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        },
        {
            TableName: 'LuckyDrawWinners',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' },
                { AttributeName: 'productId', AttributeType: 'S' },
                { AttributeName: 'userId', AttributeType: 'S' }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'ProductIndex',
                    KeySchema: [{ AttributeName: 'productId', KeyType: 'HASH' }],
                    Projection: { ProjectionType: 'ALL' },
                    BillingMode: 'PAY_PER_REQUEST'
                },
                {
                    IndexName: 'UserIndex',
                    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
                    Projection: { ProjectionType: 'ALL' },
                    BillingMode: 'PAY_PER_REQUEST'
                }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        },
        {
            TableName: 'DrawResults',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' },
                { AttributeName: 'productId', AttributeType: 'S' }
            ],
            GlobalSecondaryIndexes: [{
                IndexName: 'ProductIndex',
                KeySchema: [{ AttributeName: 'productId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }],
            BillingMode: 'PAY_PER_REQUEST'
        },
        {
            TableName: 'LuckyDrawSeasons',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' },
                { AttributeName: 'status', AttributeType: 'S' }
            ],
            GlobalSecondaryIndexes: [{
                IndexName: 'StatusIndex',
                KeySchema: [{ AttributeName: 'status', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }],
            BillingMode: 'PAY_PER_REQUEST'
        },
        {
            TableName: 'LuckyDrawBookedNumbers',
            KeySchema: [
                { AttributeName: 'cycleId', KeyType: 'HASH' },
                { AttributeName: 'number', KeyType: 'RANGE' }
            ],
            AttributeDefinitions: [
                { AttributeName: 'cycleId', AttributeType: 'S' },
                { AttributeName: 'number', AttributeType: 'N' }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        },
        {
            TableName: 'LuckyDrawProfiles',
            KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
            AttributeDefinitions: [
                { AttributeName: 'userId', AttributeType: 'S' }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        }
    ];

    for (const table of tables) {
        try {
            await client.send(new CreateTableCommand(table));
            console.log(`✅ Created table: ${table.TableName}`);
        } catch (error: any) {
            if (error.name === 'ResourceInUseException') {
                console.log(`⚠️ Table ${table.TableName} already exists`);
            } else {
                console.error(`❌ Error creating ${table.TableName}:`, error);
            }
        }
    }
}

createLuckyDrawTables().catch(console.error);