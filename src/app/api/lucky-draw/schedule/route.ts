import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

// GET - Fetch current draw schedule (public)
export async function GET() {
    try {
        const result = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-data',
            Key: { PK: 'CONFIG', SK: 'DRAW_SCHEDULE' }
        }));

        if (result.Item) {
            return NextResponse.json({
                success: true,
                data: {
                    drawDate: result.Item.drawDate,       // ISO string e.g. "2026-02-19T20:00:00+05:30"
                    drawDay: result.Item.drawDay,         // e.g. "THURSDAY"
                    drawTime: result.Item.drawTime,       // e.g. "20:00"
                    drawTimeZone: result.Item.drawTimeZone || 'IST',
                    isActive: result.Item.isActive ?? true,
                    title: result.Item.title || '',
                    description: result.Item.description || '',
                    updatedAt: result.Item.updatedAt
                }
            });
        }

        // Default schedule: next Thursday at 8PM IST
        const now = new Date();
        const nextThursday = new Date(now);
        nextThursday.setDate(now.getDate() + (4 + 7 - now.getDay()) % 7);
        nextThursday.setHours(20, 0, 0, 0);
        if (nextThursday <= now) nextThursday.setDate(nextThursday.getDate() + 7);

        return NextResponse.json({
            success: true,
            data: {
                drawDate: nextThursday.toISOString(),
                drawDay: 'THURSDAY',
                drawTime: '20:00',
                drawTimeZone: 'IST',
                isActive: true,
                title: '',
                description: '',
                updatedAt: null
            }
        });
    } catch (error) {
        console.error('Schedule GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch schedule' }, { status: 500 });
    }
}

// POST - Admin: Update draw schedule
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { drawDate, drawDay, drawTime, drawTimeZone, isActive, title, description } = body;

        if (!drawDate) {
            return NextResponse.json({ success: false, error: 'Draw date is required' }, { status: 400 });
        }

        const timestamp = new Date().toISOString();

        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-data',
            Item: {
                PK: 'CONFIG',
                SK: 'DRAW_SCHEDULE',
                drawDate,               // ISO string for the exact draw date/time
                drawDay: drawDay || new Date(drawDate).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
                drawTime: drawTime || new Date(drawDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                drawTimeZone: drawTimeZone || 'IST',
                isActive: isActive ?? true,
                title: title || '',
                description: description || '',
                updatedAt: timestamp,
                createdAt: timestamp
            }
        }));

        return NextResponse.json({
            success: true,
            message: 'Draw schedule updated successfully',
            data: { drawDate, drawDay, drawTime, isActive }
        });
    } catch (error) {
        console.error('Schedule POST error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update schedule' }, { status: 500 });
    }
}
