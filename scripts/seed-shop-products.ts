import { config } from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

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

const sampleProducts = [
    {
        PK: 'PRODUCT#1',
        SK: 'METADATA',
        id: 'product-1',
        name: "Premium Wedding Decoration Package",
        category: "Wedding Decor",
        description: "Complete wedding decoration package including flowers, lighting, and stage setup for your dream wedding.",
        images: ["/pngtree-elegant-wedding-stage-decoration-with-flowers-and-lights-in-a-festive-picture-image_16381242.jpg"],
        originalPrice: 50000,
        offerPrice: 45000,
        stock: 10,
        sku: "WED-001",
        status: "Active",
        showOnHomepage: true,
        homepageOrder: 1,
        featured: true,
        limitedOffer: true,
        GSI1PK: 'HOMEPAGE#true',
        GSI1SK: 'ORDER#001'
    },
    {
        PK: 'PRODUCT#2',
        SK: 'METADATA',
        id: 'product-2',
        name: "Corporate Event Management",
        category: "Corporate Events",
        description: "Professional corporate event management services including venue, catering, and technical support.",
        images: ["/images (2).jpg"],
        originalPrice: 75000,
        offerPrice: 70000,
        stock: 5,
        sku: "CORP-001",
        status: "Active",
        showOnHomepage: true,
        homepageOrder: 2,
        featured: true,
        limitedOffer: false,
        GSI1PK: 'HOMEPAGE#true',
        GSI1SK: 'ORDER#002'
    },
    {
        PK: 'PRODUCT#3',
        SK: 'METADATA',
        id: 'product-3',
        name: "Birthday Party Decoration",
        category: "Birthday Parties",
        description: "Colorful and fun birthday party decorations with balloons, banners, and themed setups.",
        images: ["/images (3).jpg"],
        originalPrice: 15000,
        offerPrice: 12000,
        stock: 20,
        sku: "BIRTH-001",
        status: "Active",
        showOnHomepage: true,
        homepageOrder: 3,
        featured: false,
        limitedOffer: true,
        GSI1PK: 'HOMEPAGE#true',
        GSI1SK: 'ORDER#003'
    },
    {
        PK: 'PRODUCT#4',
        SK: 'METADATA',
        id: 'product-4',
        name: "Photography Services",
        category: "Photography",
        description: "Professional photography services for weddings, events, and special occasions.",
        images: ["/images (4).jpg"],
        originalPrice: 25000,
        offerPrice: 22000,
        stock: 15,
        sku: "PHOTO-001",
        status: "Active",
        showOnHomepage: true,
        homepageOrder: 4,
        featured: true,
        limitedOffer: false,
        GSI1PK: 'HOMEPAGE#true',
        GSI1SK: 'ORDER#004'
    },
    {
        PK: 'PRODUCT#5',
        SK: 'METADATA',
        id: 'product-5',
        name: "Catering Services",
        category: "Catering",
        description: "Delicious catering services with a variety of cuisines for all types of events.",
        images: ["/images (5).jpg"],
        originalPrice: 30000,
        offerPrice: 28000,
        stock: 12,
        sku: "CATER-001",
        status: "Active",
        showOnHomepage: true,
        homepageOrder: 5,
        featured: false,
        limitedOffer: false,
        GSI1PK: 'HOMEPAGE#true',
        GSI1SK: 'ORDER#005'
    },
    {
        PK: 'PRODUCT#6',
        SK: 'METADATA',
        id: 'product-6',
        name: "Music & Entertainment",
        category: "Entertainment",
        description: "Live music, DJ services, and entertainment for parties and events.",
        images: ["/images (1).jpg"],
        originalPrice: 20000,
        offerPrice: 18000,
        stock: 8,
        sku: "MUSIC-001",
        status: "Active",
        showOnHomepage: true,
        homepageOrder: 6,
        featured: false,
        limitedOffer: true,
        GSI1PK: 'HOMEPAGE#true',
        GSI1SK: 'ORDER#006'
    }
];

export async function seedShopProducts() {
    console.log('Seeding shop products...');
    
    try {
        for (const productData of sampleProducts) {
            const product = {
                ...productData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const command = new PutCommand({
                TableName: 'ai-d-mart-products',
                Item: product
            });

            await docClient.send(command);
            console.log(`Added product: ${product.name}`);
        }
        
        console.log('Shop products seeded successfully!');
    } catch (error) {
        console.error('Error seeding products:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedShopProducts().catch(console.error);
}