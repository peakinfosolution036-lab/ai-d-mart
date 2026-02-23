import { DynamoDBClient, CreateTableCommand, CreateTableCommandInput, ScalarAttributeType, KeyType } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.APP_AWS_REGION || 'us-east-1' });

export async function createBookingsTable() {
    const tableName = "ai-d-mart-bookings";

    const params: CreateTableCommandInput = {
        TableName: tableName,
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" as ScalarAttributeType },
            { AttributeName: "businessId", AttributeType: "S" as ScalarAttributeType },
            { AttributeName: "customerId", AttributeType: "S" as ScalarAttributeType }
        ],
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" as KeyType }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "BusinessBookingIndex",
                KeySchema: [
                    { AttributeName: "businessId", KeyType: "HASH" as KeyType }
                ],
                Projection: { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            },
            {
                IndexName: "CustomerBookingIndex",
                KeySchema: [
                    { AttributeName: "customerId", KeyType: "HASH" as KeyType }
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
