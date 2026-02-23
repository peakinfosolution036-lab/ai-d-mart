import { DynamoDBClient, CreateTableCommand, CreateTableCommandInput, ScalarAttributeType, KeyType, ProjectionType } from "@aws-sdk/client-dynamodb";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!
    }
});

export async function createReferralTables() {
    const tables = [
        {
            TableName: 'referrals',
            KeySchema: [
                { AttributeName: 'id', KeyType: "HASH" as KeyType }
            ],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: "S" as ScalarAttributeType },
                { AttributeName: 'referrerId', AttributeType: "S" as ScalarAttributeType }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'referrer-index',
                    KeySchema: [
                        { AttributeName: 'referrerId', KeyType: "HASH" as KeyType }
                    ],
                    Projection: { ProjectionType: "ALL" as ProjectionType }
                }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        },
        {
            TableName: 'user-points',
            KeySchema: [
                { AttributeName: 'userId', KeyType: "HASH" as KeyType }
            ],
            AttributeDefinitions: [
                { AttributeName: 'userId', AttributeType: "S" as ScalarAttributeType }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        },
        {
            TableName: 'point-transactions',
            KeySchema: [
                { AttributeName: 'id', KeyType: "HASH" as KeyType }
            ],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: "S" as ScalarAttributeType },
                { AttributeName: 'userId', AttributeType: "S" as ScalarAttributeType }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'user-transactions-index',
                    KeySchema: [
                        { AttributeName: 'userId', KeyType: "HASH" as KeyType }
                    ],
                    Projection: { ProjectionType: "ALL" as ProjectionType }
                }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        },
        {
            TableName: 'ai-d-mart-data',
            KeySchema: [
                { AttributeName: 'PK', KeyType: "HASH" as KeyType },
                { AttributeName: 'SK', KeyType: "RANGE" as KeyType }
            ],
            AttributeDefinitions: [
                { AttributeName: 'PK', AttributeType: "S" as ScalarAttributeType },
                { AttributeName: 'SK', AttributeType: "S" as ScalarAttributeType }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        }
    ];

    for (const table of tables) {
        try {
            await client.send(new CreateTableCommand(table as CreateTableCommandInput));
            console.log(`✅ Table ${table.TableName} created successfully`);
        } catch (error: any) {
            if (error.name === 'ResourceInUseException') {
                console.log(`ℹ️ Table ${table.TableName} already exists`);
            } else {
                console.error(`❌ Error creating ${table.TableName}:`, error);
            }
        }
    }
}

// Allow running directly if main module
if (require.main === module) {
    createReferralTables().catch(console.error);
}
