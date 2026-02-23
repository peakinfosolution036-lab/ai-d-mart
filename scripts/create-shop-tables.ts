import { config } from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

// Load environment variables
config({ path: '.env.local' });

const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
});

export async function createShopTables() {
    const tableName = 'ai-d-mart-products';
    
    // Check if table already exists
    try {
        await client.send(new DescribeTableCommand({ TableName: tableName }));
        console.log(`Table ${tableName} already exists`);
        return;
    } catch (error) {
        // Table doesn't exist, create it
        console.log(`Creating table ${tableName}...`);
    }

    // Shop Products Table
    const shopProductsTable = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'showOnHomepage', AttributeType: 'S' },
            { AttributeName: 'homepageOrder', AttributeType: 'N' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'homepage-products-index',
                KeySchema: [
                    { AttributeName: 'showOnHomepage', KeyType: 'HASH' },
                    { AttributeName: 'homepageOrder', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' },
                BillingMode: 'PAY_PER_REQUEST'
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    };

    try {
        await client.send(new CreateTableCommand(shopProductsTable));
        console.log(`Table ${tableName} created successfully`);
        
        // Wait for table to be active
        console.log('Waiting for table to be active...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } catch (error) {
        console.error('Error creating table:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    createShopTables().catch(console.error);
}