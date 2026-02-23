import { NextRequest, NextResponse } from 'next/server';
import { events, generateId } from '@/lib/dynamodb';

export async function GET() {
    try {
        // Test creating an event
        const testEvent = {
            title: 'Test Event',
            description: 'This is a test event',
            date: '2024-12-25',
            location: 'Test Location',
            image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400',
            status: 'upcoming',
            createdBy: 'test'
        };

        const eventId = generateId('evt');
        const created = await events.create(eventId, testEvent);
        
        if (!created) {
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to create test event' 
            });
        }

        // Test fetching events
        const allEvents = await events.getAll();

        return NextResponse.json({ 
            success: true, 
            message: 'DynamoDB test successful',
            data: {
                created: { id: eventId, ...testEvent },
                allEvents: allEvents
            }
        });
    } catch (error) {
        console.error('DynamoDB test error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'DynamoDB test failed' 
        }, { status: 500 });
    }
}