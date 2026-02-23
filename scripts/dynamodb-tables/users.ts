import { DynamoDBClient, CreateTableCommand, CreateTableCommandInput, ScalarAttributeType, KeyType, ProjectionType } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.APP_AWS_REGION || 'ap-south-1' });

export async function createUsersTable() {
    const params: CreateTableCommandInput = {
        TableName: 'ai-d-mart-users',
        KeySchema: [
            { AttributeName: 'PK', KeyType: "HASH" as KeyType },
            { AttributeName: 'SK', KeyType: "RANGE" as KeyType }
        ],
        AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: "S" as ScalarAttributeType },
            { AttributeName: 'SK', AttributeType: "S" as ScalarAttributeType },
            { AttributeName: 'GSI1PK', AttributeType: "S" as ScalarAttributeType },
            { AttributeName: 'GSI1SK', AttributeType: "S" as ScalarAttributeType },
            { AttributeName: 'GSI2PK', AttributeType: "S" as ScalarAttributeType },
            { AttributeName: 'GSI2SK', AttributeType: "S" as ScalarAttributeType }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'GSI1',
                KeySchema: [
                    { AttributeName: 'GSI1PK', KeyType: "HASH" as KeyType },
                    { AttributeName: 'GSI1SK', KeyType: "RANGE" as KeyType }
                ],
                Projection: { ProjectionType: "ALL" as ProjectionType }
            },
            {
                IndexName: 'GSI2',
                KeySchema: [
                    { AttributeName: 'GSI2PK', KeyType: "HASH" as KeyType },
                    { AttributeName: 'GSI2SK', KeyType: "RANGE" as KeyType }
                ],
                Projection: { ProjectionType: "ALL" as ProjectionType }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    try {
        await client.send(new CreateTableCommand(params));
        console.log('✅ Users table created successfully');
    } catch (error: any) {
        if (error.name === 'ResourceInUseException') {
            console.log('ℹ️ Users table already exists');
        } else {
            console.error('❌ Error creating users table:', error);
        }
    }
}
