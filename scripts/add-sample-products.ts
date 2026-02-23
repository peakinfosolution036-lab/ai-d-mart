import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const dynamoClient = new DynamoDBClient({
    region: process.env.APP_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

async function addSampleProducts() {
    const products = [
        {
            name: 'Wedding Decoration Package',
            category: 'Wedding',
            originalPrice: 25000,
            offerPrice: 20000,
            description: 'Complete wedding decoration package with flowers, lights, and stage setup',
            images: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600'],
            showOnHomepage: true,
            homepageOrder: 1,
            stock: 10
        },
        {
            name: 'Birthday Party Kit',
            category: 'Birthday',
            originalPrice: 5000,
            offerPrice: 4000,
            description: 'Fun birthday party decoration kit with balloons, banners, and cake table setup',
            images: ['https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600'],
            showOnHomepage: true,
            homepageOrder: 2,
            stock: 15
        },
        {
            name: 'Corporate Event Setup',
            category: 'Corporate',
            originalPrice: 15000,
            offerPrice: 12000,
            description: 'Professional corporate event setup with stage, lighting, and audio system',
            images: ['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=600'],
            showOnHomepage: true,
            homepageOrder: 3,
            stock: 8
        },
        {
            name: 'Photography Package',
            category: 'Photography',
            originalPrice: 8000,
            offerPrice: 6500,
            description: 'Professional photography service for events with edited photos',
            images: ['https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=600'],
            showOnHomepage: true,
            homepageOrder: 4,
            stock: 20
        }
    ];

    try {
        console.log('Adding sample products...');

        for (const product of products) {
            const productId = uuidv4();
            const now = new Date().toISOString();

            const productItem = {
                PK: `PRODUCT#${productId}`,
                SK: 'METADATA',
                id: productId,
                name: product.name,
                category: product.category,
                originalPrice: product.originalPrice,
                offerPrice: product.offerPrice,
                description: product.description,
                images: product.images,
                status: 'Active',
                showOnHomepage: product.showOnHomepage,
                homepageOrder: product.homepageOrder,
                stock: product.stock,
                createdAt: now,
                updatedAt: now
            };

            const putCommand = new PutCommand({
                TableName: 'ai-d-mart-products',
                Item: productItem
            });

            await docClient.send(putCommand);
            console.log(`✅ Added product: ${product.name}`);
        }

        console.log(`✅ Successfully added ${products.length} products to the shop!`);

    } catch (error) {
        console.error('❌ Error adding products:', error);
    }
}

addSampleProducts();