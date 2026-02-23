import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch exclusive events
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const command = new ScanCommand({
            TableName: 'exclusive-events',
            FilterExpression: '#status = :status',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':status': 'active' }
        });

        const result = await docClient.send(command);
        let events = result.Items || [];

        // If userId provided, check subscription status
        if (userId) {
            const userCommand = new GetCommand({
                TableName: 'ai-d-mart-users',
                Key: { id: userId }
            });
            const userResult = await docClient.send(userCommand);
            const user = userResult.Item;

            // Filter events based on subscription
            if (!user?.subscriptionStatus || user.subscriptionStatus !== 'active') {
                events = events.map(event => ({
                    ...event,
                    canAccess: false,
                    message: 'Subscribe to access this exclusive event'
                }));
            } else {
                events = events.map(event => ({ ...event, canAccess: true }));
            }
        }

        return NextResponse.json({ success: true, events });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
    }
}

// POST - Create new exclusive event (Admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, date, location, eligiblePlans, passValidity, createdBy } = body;

        const event = {
            id: uuidv4(),
            name,
            description,
            date,
            location,
            eligiblePlans: eligiblePlans || ['premium'],
            passValidity,
            status: 'active',
            createdBy,
            createdAt: new Date().toISOString()
        };

        const command = new PutCommand({
            TableName: 'exclusive-events',
            Item: event
        });

        await docClient.send(command);
        return NextResponse.json({ success: true, event });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
    }
}

// PUT - Update event
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        const command = new UpdateCommand({
            TableName: 'exclusive-events',
            Key: { id },
            UpdateExpression: 'SET #name = :name, description = :description, #date = :date, #location = :location, eligiblePlans = :eligiblePlans, passValidity = :passValidity, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#date': 'date',
                '#location': 'location'
            },
            ExpressionAttributeValues: {
                ':name': updates.name,
                ':description': updates.description,
                ':date': updates.date,
                ':location': updates.location,
                ':eligiblePlans': updates.eligiblePlans,
                ':passValidity': updates.passValidity,
                ':updatedAt': new Date().toISOString()
            }
        });

        await docClient.send(command);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
    }
}

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
        }

        const command = new DeleteCommand({
            TableName: 'exclusive-events',
            Key: { id }
        });

        await docClient.send(command);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
    }
}