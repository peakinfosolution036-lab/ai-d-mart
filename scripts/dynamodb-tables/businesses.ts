import { DynamoDBClient, CreateTableCommand, CreateTableCommandInput, ScalarAttributeType, KeyType, ProjectionType } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.APP_AWS_REGION || 'us-east-1' });

export async function createBusinessesTable() {
    const tableName = "ai-d-mart-businesses";

    const params: CreateTableCommandInput = {
        TableName: tableName,
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" as ScalarAttributeType },
            { AttributeName: "userId", AttributeType: "S" as ScalarAttributeType }
        ],
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" as KeyType }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "UserBusinessIndex",
                KeySchema: [
                    { AttributeName: "userId", KeyType: "HASH" as KeyType }
                ],
                Projection: { ProjectionType: "ALL" as ProjectionType },
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
