import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

// GET - Transaction history with filters and pagination
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const type = searchParams.get('type'); // CASHBACK, COMMISSION, WITHDRAWAL, SPEND, POINTS_CONVERSION, ADD_MONEY
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        let transactions: any[] = [];

        if (type) {
            // Filter by transaction type using GSI
            const result = await docClient.send(new QueryCommand({
                TableName: 'ai-d-mart-wallets',
                IndexName: 'GSI1',
                KeyConditionExpression: 'GSI1PK = :pk',
                FilterExpression: 'PK = :userPk',
                ExpressionAttributeValues: {
                    ':pk': `TRANSACTION#${type.toUpperCase()}`,
                    ':userPk': `USER#${userId}`
                },
                ScanIndexForward: false,
                Limit: limit
            }));
            transactions = result.Items || [];
        } else {
            // Get all transactions for user
            const result = await docClient.send(new QueryCommand({
                TableName: 'ai-d-mart-wallets',
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': `USER#${userId}`,
                    ':sk': 'TRANSACTION#'
                },
                ScanIndexForward: false,
                Limit: limit
            }));
            transactions = result.Items || [];
        }

        // Sort by createdAt descending
        transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            success: true,
            data: {
                transactions,
                count: transactions.length
            }
        });
    } catch (error) {
        console.error('Transaction history error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
