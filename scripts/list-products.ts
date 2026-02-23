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

export async function listAllProducts() {
    console.log('Listing all products in database...');
    
    try {
        const scanCommand = new ScanCommand({
            TableName: 'ai-d-mart-products'
        });

        const result = await docClient.send(scanCommand);
        const items = result.Items || [];

        console.log(`Found ${items.length} total items in database`);
        
        items.forEach((item, index) => {
            console.log(`\n${index + 1}. PK: ${item.PK}, SK: ${item.SK}`);
            if (item.name) console.log(`   Name: ${item.name}`);
            if (item.category) console.log(`   Category: ${item.category}`);
            if (item.status) console.log(`   Status: ${item.status}`);
            if (item.showOnHomepage !== undefined) console.log(`   Show on Homepage: ${item.showOnHomepage}`);
            if (item.homepageOrder) console.log(`   Homepage Order: ${item.homepageOrder}`);
        });

    } catch (error) {
        console.error('Error listing products:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    listAllProducts().catch(console.error);
}