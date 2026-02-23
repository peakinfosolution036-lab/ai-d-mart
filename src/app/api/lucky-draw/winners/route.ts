import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

export async function GET() {
    try {
        // Fetch winners from the correct table 'LuckyDrawWinners'
        const command = new ScanCommand({
            TableName: 'LuckyDrawWinners',
            Limit: 12 // Fetch a few more to filter if necessary
        });

        const result = await docClient.send(command);

        // Map the items to a consistent frontend structure
        const winners = (result.Items || []).map((item: any) => ({
            id: item.id,
            name: item.userName || 'Anonymous', // Fallback
            productName: item.productName || 'Unknown Prize',
            winningNumber: item.winningNumber,
            drawDate: item.selectedAt, // Using selectedAt as drawDate
            prize: item.gift || item.productName,
            image: item.userImage || null // Assuming userImage might exist, or handled by frontend
        }));

        // Sort by draw date descending
        winners.sort((a, b) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime());

        return NextResponse.json({
            success: true,
            winners: winners.slice(0, 6) // Return top 6
        });
    } catch (error) {
        console.error('Error fetching winners:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch winners',
            winners: []
        });
    }
}