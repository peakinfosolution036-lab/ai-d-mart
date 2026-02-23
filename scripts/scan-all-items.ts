import { config } from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Load environment variables
config({ path: '.env.local' });

const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
});

const docClient = DynamoDBDocumentClient.from(client);

export async function scanAllItems() {
    console.log('Scanning ALL items in ai-d-mart-products table...');
    
    try {
        const scanCommand = new ScanCommand({
            TableName: 'ai-d-mart-products'
        });

        const result = await docClient.send(scanCommand);
        const items = result.Items || [];

        console.log(`Found ${items.length} total items`);
        
        items.forEach((item, index) => {
            console.log(`\n--- Item ${index + 1} ---`);
            console.log(JSON.stringify(item, null, 2));
        });

    } catch (error) {
        console.error('Error scanning items:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    scanAllItems().catch(console.error);
}