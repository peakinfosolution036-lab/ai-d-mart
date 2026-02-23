import { DynamoDBClient, CreateTableCommand, CreateTableCommandInput, ScalarAttributeType, KeyType, ProjectionType } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.APP_AWS_REGION || 'us-east-1' });

export async function createNotificationsTable() {
    const tableName = "ai-d-mart-notifications";

    const params: CreateTableCommandInput = {
        TableName: tableName,
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "createdAt", AttributeType: "S" }
        ],
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "UserNotificationsIndex",
                KeySchema: [
                    { AttributeName: "userId", KeyType: "HASH" },
                    { AttributeName: "createdAt", KeyType: "RANGE" }
                ],
                Projection: { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        const command = new CreateTableCommand(params);
        await client.send(command);
        console.log(`✅ Table "${tableName}" created successfully!`);
    } catch (error: any) {
        if (error.name === 'ResourceInUseException') {
            console.log(`ℹ️ Table "${tableName}" already exists.`);
        } else {
            console.error(`❌ Error creating table "${tableName}":`, error);
        }
    }
}
