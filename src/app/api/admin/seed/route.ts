import { NextRequest, NextResponse } from 'next/server';
import { events, products, jobs, offers, rewards, generateId } from '@/lib/dynamodb';

export async function POST() {
    try {
        // Add sample events
        await events.create(generateId('evt'), {
            title: 'Grand Launch Event',
            description: 'Join us for the grand launch of AI D Mart platform',
            date: 'Dec 25, 2024',
            location: 'Bangalore Convention Center',
            image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400',
            status: 'upcoming',
            createdBy: 'admin'
        });

        await events.create(generateId('evt'), {
            title: 'Digital India Summit',
            description: 'Connecting rural India to digital economy',
            date: 'Jan 15, 2025',
            location: 'New Delhi',
            image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=400',
            status: 'upcoming',
            createdBy: 'admin'
        });

        // Add sample products
        await products.create(generateId('prd'), {
            name: 'Smart Watch Pro',
            description: 'Advanced fitness tracking and notifications',
            price: '2499',
            category: 'Electronics',
            rating: 4.5,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
            inStock: true,
            quantity: 50,
            sellerId: 'admin'
        });

        await products.create(generateId('prd'), {
            name: 'Wireless Earbuds',
            description: 'Premium sound quality with noise cancellation',
            price: '1999',
            category: 'Electronics',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1572569028738-411a0977d42f?auto=format&fit=crop&q=80&w=200',
            inStock: true,
            quantity: 100,
            sellerId: 'admin'
        });

        // Add sample jobs
        await jobs.create(generateId('job'), {
            title: 'Area Sales Manager',
            company: 'AI D Mart',
            description: 'Manage sales operations in assigned territory',
            type: 'Full Time',
            salary: '₹25k - ₹40k',
            location: 'Bangalore',
            requirements: ['Sales experience', 'Communication skills'],
            postedBy: 'admin',
            status: 'open'
        });

        // Add sample offers
        await offers.create(generateId('off'), {
            code: 'WELCOME20',
            discount: '20%',
            title: 'Welcome Bonus',
            description: 'Flat 20% off on your first order',
            color: 'bg-blue-500',
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            usageLimit: 1000,
            usedCount: 0,
            minOrderValue: 500
        });

        // Add sample rewards
        await rewards.create(generateId('rwd'), {
            name: 'Smart Watch',
            description: 'Latest smartwatch with health tracking',
            points: 2500,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
            category: 'Electronics',
            available: true,
            quantity: 20
        });

        return NextResponse.json({ success: true, message: 'Sample data created successfully' });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create sample data' }, { status: 500 });
    }
}