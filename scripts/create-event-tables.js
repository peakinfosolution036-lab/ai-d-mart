require('dotenv').config({ path: '.env.local' });
const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
    },
});

async function createEventTables() {
    const tables = [
        {
            TableName: 'exclusive-events',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
            BillingMode: 'PAY_PER_REQUEST'
        }
    ];

    for (const table of tables) {
        try {
            await client.send(new CreateTableCommand(table));
            console.log(`Created table: ${table.TableName}`);
        } catch (error) {
            if (error.name === 'ResourceInUseException') {
                console.log(`Table ${table.TableName} already exists`);
            } else {
                console.error(`Error creating table ${table.TableName}:`, error);
            }
        }
    }
}

createEventTables();