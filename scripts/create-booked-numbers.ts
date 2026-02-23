import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!
    }
});

async function createTable() {
    try {
        await client.send(new CreateTableCommand({
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
        }));
        console.log('✅ Created table: LuckyDrawBookedNumbers');
    } catch (e: any) {
        if (e.name === 'ResourceInUseException') {
            console.log('⚠️ Table LuckyDrawBookedNumbers already exists');
        } else {
            console.error('❌ Error creating table:', e);
        }
    }
}

createTable();
