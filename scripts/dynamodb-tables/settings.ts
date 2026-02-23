import { DynamoDBClient, CreateTableCommand, CreateTableCommandInput, ScalarAttributeType, KeyType, ProjectionType } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.APP_AWS_REGION || 'ap-south-1' });

export async function createSettingsTable() {
    const params: CreateTableCommandInput = {
        TableName: 'ai-d-mart-settings',
        KeySchema: [
            { AttributeName: 'PK', KeyType: "HASH" as KeyType },
            { AttributeName: 'SK', KeyType: "RANGE" as KeyType }
        ],
        AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: "S" as ScalarAttributeType },
            { AttributeName: 'SK', AttributeType: "S" as ScalarAttributeType }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    try {
        await client.send(new CreateTableCommand(params));
        console.log('✅ Settings table created successfully');
    } catch (error: any) {
        if (error.name === 'ResourceInUseException') {
            console.log('ℹ️ Settings table already exists');
        } else {
            console.error('❌ Error creating settings table:', error);
        }
    }
}
