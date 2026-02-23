import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
    try {
        const command = new ScanCommand({
            TableName: 'LuckyDrawSeasons'
        });

        const result = await docClient.send(command);
        const seasons = result.Items || [];

        // Sort by start date specific
        seasons.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        return NextResponse.json({ success: true, data: seasons });
    } catch (error) {
        console.error('Error fetching seasons:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch seasons' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validation
        if (!body.name || !body.startDate || !body.type) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const season = {
            id: uuidv4(),
            name: body.name,
            type: body.type, // 'daily', 'weekly', 'monthly'
            startDate: body.startDate,
            endDate: body.endDate,
            duration: body.duration, // number of days/weeks/months
            status: 'upcoming', // 'active', 'completed', 'upcoming'
            createdAt: new Date().toISOString()
        };

        await docClient.send(new PutCommand({
            TableName: 'LuckyDrawSeasons',
            Item: season
        }));

        return NextResponse.json({ success: true, data: season });
    } catch (error) {
        console.error('Error creating season:', error);
        return NextResponse.json({ success: false, error: 'Failed to create season' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Season ID required' }, { status: 400 });
        }

        await docClient.send(new UpdateCommand({
            TableName: 'LuckyDrawSeasons',
            Key: { id },
            UpdateExpression: 'SET #name = :name, #type = :type, startDate = :startDate, endDate = :endDate, #status = :status, duration = :duration',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#type': 'type',
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':name': updateData.name,
                ':type': updateData.type,
                ':startDate': updateData.startDate,
                ':endDate': updateData.endDate,
                ':status': updateData.status,
                ':duration': updateData.duration
            }
        }));

        return NextResponse.json({ success: true, message: 'Season updated successfully' });
    } catch (error) {
        console.error('Error updating season:', error);
        return NextResponse.json({ success: false, error: 'Failed to update season' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Season ID required' }, { status: 400 });
        }

        await docClient.send(new DeleteCommand({
            TableName: 'LuckyDrawSeasons',
            Key: { id }
        }));

        return NextResponse.json({ success: true, message: 'Season deleted successfully' });
    } catch (error) {
        console.error('Error deleting season:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete season' }, { status: 500 });
    }
}
