import { DynamoDBClient, CreateTableCommand, ScalarAttributeType, KeyType, BillingMode } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
});

async function createEventTables() {
    const tables = [
        {
            TableName: 'exclusive-events',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' as KeyType }],
            AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' as ScalarAttributeType }],
            BillingMode: 'PAY_PER_REQUEST' as BillingMode
        },
        {
            TableName: 'event-registrations',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' as KeyType }],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' as ScalarAttributeType },
                { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType },
                { AttributeName: 'eventId', AttributeType: 'S' as ScalarAttributeType }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'user-events-index',
                    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' as KeyType }],
                    Projection: { ProjectionType: 'ALL' }
                },
                {
                    IndexName: 'event-users-index',
                    KeySchema: [{ AttributeName: 'eventId', KeyType: 'HASH' as KeyType }],
                    Projection: { ProjectionType: 'ALL' }
                }
            ],
            BillingMode: 'PAY_PER_REQUEST' as BillingMode
        },
        {
            TableName: 'event-passes',
            KeySchema: [{ AttributeName: 'passId', KeyType: 'HASH' as KeyType }],
            AttributeDefinitions: [
                { AttributeName: 'passId', AttributeType: 'S' as ScalarAttributeType },
                { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'user-passes-index',
                    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' as KeyType }],
                    Projection: { ProjectionType: 'ALL' }
                }
            ],
            BillingMode: 'PAY_PER_REQUEST' as BillingMode
        }
    ];

    for (const table of tables) {
        try {
            await client.send(new CreateTableCommand(table));
            console.log(`Created table: ${table.TableName}`);
        } catch (error: any) {
            if (error.name === 'ResourceInUseException') {
                console.log(`Table ${table.TableName} already exists`);
            } else {
                console.error(`Error creating table ${table.TableName}:`, error);
            }
        }
    }
}

createEventTables();