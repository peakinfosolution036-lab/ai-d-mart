import { events, products, jobs, offers, rewards, generateId } from '../src/lib/dynamodb.js';

async function seedData() {
    console.log('🌱 Seeding initial data...');

    try {
        // Seed Events
        const eventData = [
            {
                title: 'Grand Launch Event',
                description: 'Join us for the grand launch of AI D Mart platform',
                date: 'Dec 25, 2024',
                location: 'Bangalore Convention Center',
                image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400',
                status: 'upcoming',
                createdBy: 'admin'
            },
            {
                title: 'Digital India Summit',
                description: 'Connecting rural India to digital economy',
                date: 'Jan 15, 2025',
                location: 'New Delhi',
                image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=400',
                status: 'upcoming',
                createdBy: 'admin'
            }
        ];

        for (const event of eventData) {
            await events.create(generateId('evt'), event);
        }

        // Seed Products
        const productData = [
            {
                name: 'Smart Watch Pro',
                description: 'Advanced fitness tracking and notifications',
                price: '2499',
                category: 'Electronics',
                rating: 4.5,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
                inStock: true,
                quantity: 50,
                sellerId: 'admin'
            },
            {
                name: 'Wireless Earbuds',
                description: 'Premium sound quality with noise cancellation',
                price: '1999',
                category: 'Electronics',
                rating: 4.8,
                image: 'https://images.unsplash.com/photo-1572569028738-411a0977d42f?auto=format&fit=crop&q=80&w=200',
                inStock: true,
                quantity: 100,
                sellerId: 'admin'
            },
            {
                name: 'Leather Backpack',
                description: 'Stylish and durable leather backpack',
                price: '1299',
                category: 'Fashion',
                rating: 4.2,
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200',
                inStock: true,
                quantity: 25,
                sellerId: 'admin'
            },
            {
                name: 'Running Shoes',
                description: 'Comfortable running shoes for daily workouts',
                price: '2999',
                category: 'Sports',
                rating: 4.6,
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200',
                inStock: true,
                quantity: 30,
                sellerId: 'admin'
            }
        ];

        for (const product of productData) {
            await products.create(generateId('prd'), product);
        }

        // Seed Jobs
        const jobData = [
            {
                title: 'Area Sales Manager',
                company: 'AI D Mart',
                description: 'Manage sales operations in assigned territory',
                type: 'Full Time',
                salary: '₹25k - ₹40k',
                location: 'Bangalore',
                requirements: ['Sales experience', 'Communication skills', 'Local language'],
                postedBy: 'admin',
                status: 'open'
            },
            {
                title: 'Delivery Partner',
                company: 'AI D Mart Logistics',
                description: 'Deliver products to customers in your area',
                type: 'Part Time',
                salary: '₹15k - ₹20k',
                location: 'Multiple Cities',
                requirements: ['Two wheeler', 'Smartphone', 'Local area knowledge'],
                postedBy: 'admin',
                status: 'open'
            },
            {
                title: 'Customer Support Executive',
                company: 'AI D Mart',
                description: 'Provide excellent customer service and support',
                type: 'Full Time',
                salary: '₹18k - ₹25k',
                location: 'Remote',
                requirements: ['Good communication', 'Computer skills', 'Problem solving'],
                postedBy: 'admin',
                status: 'open'
            }
        ];

        for (const job of jobData) {
            await jobs.create(generateId('job'), job);
        }

        // Seed Offers
        const offerData = [
            {
                code: 'WELCOME20',
                discount: '20%',
                title: 'Welcome Bonus',
                description: 'Flat 20% off on your first order',
                color: 'bg-blue-500',
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                usageLimit: 1000,
                usedCount: 0,
                minOrderValue: 500,
                applicableCategories: []
            },
            {
                code: 'FESTIVE50',
                discount: '50%',
                title: 'Festival Special',
                description: 'Mega discount on electronics',
                color: 'bg-red-500',
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                usageLimit: 500,
                usedCount: 0,
                minOrderValue: 2000,
                applicableCategories: ['Electronics']
            },
            {
                code: 'FASHION30',
                discount: '30%',
                title: 'Fashion Week',
                description: 'Special discount on fashion items',
                color: 'bg-pink-500',
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                usageLimit: 300,
                usedCount: 0,
                minOrderValue: 1000,
                applicableCategories: ['Fashion']
            }
        ];

        for (const offer of offerData) {
            await offers.create(generateId('off'), offer);
        }

        // Seed Rewards
        const rewardData = [
            {
                name: 'Gold Ring',
                description: 'Beautiful 18k gold ring',
                points: 5000,
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=200',
                category: 'Jewelry',
                available: true,
                quantity: 10
            },
            {
                name: 'Smart Watch',
                description: 'Latest smartwatch with health tracking',
                points: 2500,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
                category: 'Electronics',
                available: true,
                quantity: 20
            },
            {
                name: 'Laptop Bag',
                description: 'Premium laptop bag with multiple compartments',
                points: 1500,
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200',
                category: 'Accessories',
                available: true,
                quantity: 50
            },
            {
                name: 'Bluetooth Speaker',
                description: 'Portable wireless speaker with great sound',
                points: 1000,
                image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=200',
                category: 'Electronics',
                available: true,
                quantity: 30
            },
            {
                name: 'Gift Voucher ₹500',
                description: 'Shopping voucher worth ₹500',
                points: 500,
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200',
                category: 'Vouchers',
                available: true,
                quantity: 100
            }
        ];

        for (const reward of rewardData) {
            await rewards.create(generateId('rwd'), reward);
        }

        console.log('✅ Data seeding completed successfully!');
        console.log(`📊 Seeded:`);
        console.log(`   - ${eventData.length} events`);
        console.log(`   - ${productData.length} products`);
        console.log(`   - ${jobData.length} jobs`);
        console.log(`   - ${offerData.length} offers`);
        console.log(`   - ${rewardData.length} rewards`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
}

// Run the seed function
seedData().then(() => process.exit(0)).catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
});