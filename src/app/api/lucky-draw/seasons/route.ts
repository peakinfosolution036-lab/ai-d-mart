import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, ScanCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

const SEASONS_TABLE = 'LuckyDrawSeasons';

// GET - Fetch seasons
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let params: any = {
            TableName: SEASONS_TABLE,
        };

        if (status) {
            params.FilterExpression = '#status = :status';
            params.ExpressionAttributeNames = { '#status': 'status' };
            params.ExpressionAttributeValues = { ':status': status };
        }

        const result = await docClient.send(new ScanCommand(params));

        // Sort by start date descending
        const seasons = (result.Items || []).sort((a: any, b: any) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );

        return NextResponse.json({ success: true, data: seasons });
    } catch (error) {
        console.error('Error fetching seasons:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create or update season
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { id, name, startDate, endDate, status, drawTypes } = data;

        const timestamp = new Date().toISOString();

        if (id) {
            // Update existing season
            await docClient.send(new UpdateCommand({
                TableName: SEASONS_TABLE,
                Key: { id },
                UpdateExpression: 'SET #name = :name, startDate = :startDate, endDate = :endDate, #status = :status, drawTypes = :drawTypes, updatedAt = :updatedAt',
                ExpressionAttributeNames: {
                    '#name': 'name',
                    '#status': 'status'
                },
                ExpressionAttributeValues: {
                    ':name': name,
                    ':startDate': startDate,
                    ':endDate': endDate,
                    ':status': status || 'active',
                    ':drawTypes': drawTypes || [],
                    ':updatedAt': timestamp
                }
            }));

            return NextResponse.json({ success: true, message: 'Season updated successfully' });
        } else {
            // Create new season
            const newSeason = {
                id: uuidv4(),
                name,
                startDate,
                endDate,
                status: status || 'active',
                drawTypes: drawTypes || [], // ['daily', 'weekly', 'monthly']
                createdAt: timestamp,
                updatedAt: timestamp
            };

            await docClient.send(new PutCommand({
                TableName: SEASONS_TABLE,
                Item: newSeason
            }));

            return NextResponse.json({ success: true, data: newSeason });
        }
    } catch (error) {
        console.error('Error in season POST:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove season
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        }

        await docClient.send(new DeleteCommand({
            TableName: SEASONS_TABLE,
            Key: { id }
        }));

        return NextResponse.json({ success: true, message: 'Season deleted successfully' });
    } catch (error) {
        console.error('Error deleting season:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
