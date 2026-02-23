import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const { userId, paymentId } = await request.json();

        if (!userId || !paymentId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const subscription = {
            id: uuidv4(),
            userId,
            planName: 'Lucky Draw Premium',
            amount: 5000,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
            paymentId,
            createdAt: new Date().toISOString()
        };

        await docClient.send(new PutCommand({
            TableName: 'LuckyDrawSubscriptions',
            Item: subscription
        }));

        return NextResponse.json({ success: true, data: subscription });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        const [subscriptionResult, profileResult] = await Promise.all([
            docClient.send(new QueryCommand({
                TableName: 'LuckyDrawSubscriptions',
                IndexName: 'UserIndex',
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId },
                ScanIndexForward: false
            })),
            docClient.send(new QueryCommand({
                TableName: 'LuckyDrawProfiles',
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId }
            }))
        ]);

        const activeSubscription = subscriptionResult.Items?.find(sub =>
            sub.status === 'active' && new Date(sub.endDate) > new Date()
        );

        const profile = profileResult.Items?.[0];

        return NextResponse.json({
            success: true,
            data: {
                hasActiveSubscription: !!activeSubscription,
                subscription: activeSubscription,
                freeChanceUsed: !!profile?.freeChanceUsed
            }
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}