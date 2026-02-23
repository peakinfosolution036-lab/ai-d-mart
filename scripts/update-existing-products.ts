import { config } from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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

export async function updateExistingProducts() {
    console.log('Updating existing products for homepage display...');
    
    try {
        // First, scan all products
        const scanCommand = new ScanCommand({
            TableName: 'ai-d-mart-products',
            FilterExpression: 'SK = :sk',
            ExpressionAttributeValues: {
                ':sk': 'METADATA'
            }
        });

        const result = await docClient.send(scanCommand);
        const products = result.Items || [];

        console.log(`Found ${products.length} products to update`);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            
            // Update each product with homepage settings
            const updateCommand = new UpdateCommand({
                TableName: 'ai-d-mart-products',
                Key: {
                    PK: product.PK,
                    SK: product.SK
                },
                UpdateExpression: `SET 
                    showOnHomepage = :showOnHomepage,
                    homepageOrder = :homepageOrder,
                    featured = :featured,
                    limitedOffer = :limitedOffer,
                    GSI1PK = :gsi1pk,
                    GSI1SK = :gsi1sk,
                    updatedAt = :updatedAt`,
                ExpressionAttributeValues: {
                    ':showOnHomepage': true, // Show all products on homepage by default
                    ':homepageOrder': i + 1, // Set order based on current position
                    ':featured': false,
                    ':limitedOffer': false,
                    ':gsi1pk': 'HOMEPAGE#true',
                    ':gsi1sk': `ORDER#${String(i + 1).padStart(3, '0')}`,
                    ':updatedAt': new Date().toISOString()
                }
            });

            await docClient.send(updateCommand);
            console.log(`Updated product: ${product.name || product.PK}`);
        }

        console.log('All products updated successfully!');
    } catch (error) {
        console.error('Error updating products:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    updateExistingProducts().catch(console.error);
}