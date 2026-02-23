import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, GetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch user passes or all passes (admin)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const eventId = searchParams.get('eventId');
        const isAdmin = searchParams.get('admin') === 'true';

        if (isAdmin) {
            // Admin view - all passes
            const command = new ScanCommand({
                TableName: 'event-passes'
            });
            const result = await docClient.send(command);
            return NextResponse.json({ success: true, passes: result.Items || [] });
        }

        if (userId) {
            // User view - their passes
            const command = new QueryCommand({
                TableName: 'event-passes',
                IndexName: 'user-passes-index',
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId }
            });
            const result = await docClient.send(command);
            return NextResponse.json({ success: true, passes: result.Items || [] });
        }

        return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Error fetching passes:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch passes' }, { status: 500 });
    }
}

// POST - Generate event pass
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, eventId, eventDate, timeSlot, idProof, emergencyContact, city, notes } = body;

        // Check if user already has pass for this event
        const existingCommand = new QueryCommand({
            TableName: 'event-passes',
            IndexName: 'user-passes-index',
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'eventId = :eventId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':eventId': eventId
            }
        });

        const existingResult = await docClient.send(existingCommand);
        if (existingResult.Items && existingResult.Items.length > 0) {
            return NextResponse.json({ success: false, error: 'Pass already exists for this event' }, { status: 400 });
        }

        // Get user and event details
        const [userResult, eventResult] = await Promise.all([
            docClient.send(new GetCommand({ TableName: 'users', Key: { id: userId } })),
            docClient.send(new GetCommand({ TableName: 'exclusive-events', Key: { id: eventId } }))
        ]);

        const user = userResult.Item;
        const event = eventResult.Item;

        if (!user || !event) {
            return NextResponse.json({ success: false, error: 'User or event not found' }, { status: 404 });
        }

        // Check subscription status
        if (!user.subscriptionStatus || user.subscriptionStatus !== 'active') {
            return NextResponse.json({ success: false, error: 'Active subscription required' }, { status: 403 });
        }

        // Create pass
        const passId = `PASS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const pass = {
            passId,
            userId,
            eventId,
            eventName: event.name,
            eventDate,
            timeSlot,
            idProof,
            emergencyContact,
            city,
            notes,
            userName: user.fullName || user.name,
            userEmail: user.email,
            userPhone: user.mobile || user.phone,
            subscriptionId: user.subscriptionId,
            status: 'active',
            createdAt: new Date().toISOString(),
            validUntil: event.passValidity
        };

        const command = new PutCommand({
            TableName: 'event-passes',
            Item: pass
        });

        await docClient.send(command);

        // Register user for event
        const registration = {
            id: uuidv4(),
            userId,
            eventId,
            passId,
            registeredAt: new Date().toISOString()
        };

        await docClient.send(new PutCommand({
            TableName: 'event-registrations',
            Item: registration
        }));

        return NextResponse.json({ success: true, pass });
    } catch (error) {
        console.error('Error creating pass:', error);
        return NextResponse.json({ success: false, error: 'Failed to create pass' }, { status: 500 });
    }
}

// PUT - Download pass PDF
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { passId } = body;

        const command = new GetCommand({
            TableName: 'event-passes',
            Key: { passId }
        });

        const result = await docClient.send(command);
        const pass = result.Item;

        if (!pass) {
            return NextResponse.json({ success: false, error: 'Pass not found' }, { status: 404 });
        }

        // Generate pass as HTML (rendered client-side or printed)
        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Event Pass</title>
<style>body{font-family:sans-serif;padding:40px}h1{font-size:24px}p{font-size:16px;margin:8px 0}</style>
</head><body>
<h1>EVENT PASS</h1>
<p><b>Pass ID:</b> ${pass.passId}</p>
<p><b>Event:</b> ${pass.eventName}</p>
<p><b>Date:</b> ${pass.eventDate}</p>
<p><b>Time:</b> ${pass.timeSlot}</p>
<p><b>Name:</b> ${pass.userName}</p>
<p><b>Email:</b> ${pass.userEmail}</p>
<p><b>Phone:</b> ${pass.userPhone}</p>
<p><b>City:</b> ${pass.city}</p>
<p><b>Valid Until:</b> ${pass.validUntil}</p>
${pass.notes ? `<p><b>Notes:</b> ${pass.notes}</p>` : ''}
</body></html>`;

        return NextResponse.json({
            success: true,
            html,
            filename: `event-pass-${passId}.html`
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate PDF' }, { status: 500 });
    }
}