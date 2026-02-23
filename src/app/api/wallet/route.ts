import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch wallet summary (all wallets + recent transactions + points)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        // Get all wallets
        const walletTypes = ['REFERRAL', 'SHOPPING', 'EVENT', 'MAIN'];
        const wallets: Record<string, any> = {};

        for (const type of walletTypes) {
            const wallet = await docClient.send(new GetCommand({
                TableName: 'ai-d-mart-wallets',
                Key: { PK: `USER#${userId}`, SK: `WALLET#${type}` }
            }));
            wallets[type.toLowerCase()] = wallet.Item || { balance: 0, totalEarned: 0, totalSpent: 0, totalWithdrawn: 0 };
        }

        // Get user points
        const pointsResult = await docClient.send(new GetCommand({
            TableName: 'user-points',
            Key: { userId }
        }));
        const points = pointsResult.Item || { totalPoints: 0, availablePoints: 0, usedPoints: 0, convertedPoints: 0 };

        // Get recent transactions (last 50)
        const txResult = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-wallets',
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'TRANSACTION#'
            },
            ScanIndexForward: false,
            Limit: 50
        }));

        // Calculate total balance across all wallets
        const totalBalance = Object.values(wallets).reduce((sum: number, w: any) => sum + (w.balance || 0), 0);

        return NextResponse.json({
            success: true,
            data: {
                wallets,
                points,
                totalBalance,
                walletConversionRate: { pointsRequired: 100, walletValue: 1 }, // 100 pts = ₹1
                transactions: txResult.Items || []
            }
        });
    } catch (error) {
        console.error('Wallet GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch wallet data' }, { status: 500 });
    }
}

// POST - Wallet operations: convert_points, add_money, spend, withdraw
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, userId } = body;

        if (!userId || !action) {
            return NextResponse.json({ success: false, error: 'userId and action are required' }, { status: 400 });
        }

        const timestamp = new Date().toISOString();
        const transactionId = uuidv4();

        switch (action) {
            case 'convert_points': {
                const { points: pointsToConvert } = body;
                if (!pointsToConvert || pointsToConvert < 100) {
                    return NextResponse.json({ success: false, error: 'Minimum 100 points required for conversion' }, { status: 400 });
                }

                // Must be multiple of 100
                const convertible = Math.floor(pointsToConvert / 100) * 100;
                const walletAmount = convertible / 100; // 100 pts = ₹1

                // Check available points
                const pointsData = await docClient.send(new GetCommand({
                    TableName: 'user-points',
                    Key: { userId }
                }));

                const available = pointsData.Item?.availablePoints || 0;
                if (available < convertible) {
                    return NextResponse.json({ success: false, error: `Insufficient points. Available: ${available}` }, { status: 400 });
                }

                // Deduct points
                await docClient.send(new UpdateCommand({
                    TableName: 'user-points',
                    Key: { userId },
                    UpdateExpression: 'ADD availablePoints :neg, convertedPoints :pts SET updatedAt = :ts',
                    ExpressionAttributeValues: { ':neg': -convertible, ':pts': convertible, ':ts': timestamp }
                }));

                // Credit main wallet
                await docClient.send(new UpdateCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: { PK: `USER#${userId}`, SK: 'WALLET#MAIN' },
                    UpdateExpression: 'ADD balance :amt, totalEarned :amt SET updatedAt = :ts',
                    ExpressionAttributeValues: { ':amt': walletAmount, ':ts': timestamp }
                }));

                // Log transaction
                await docClient.send(new PutCommand({
                    TableName: 'ai-d-mart-wallets',
                    Item: {
                        PK: `USER#${userId}`,
                        SK: `TRANSACTION#${transactionId}`,
                        transactionId, walletType: 'MAIN', type: 'POINTS_CONVERSION',
                        amount: walletAmount, pointsConverted: convertible,
                        description: `Converted ${convertible} points to ₹${walletAmount}`,
                        status: 'COMPLETED',
                        GSI1PK: 'TRANSACTION#POINTS_CONVERSION', GSI1SK: timestamp,
                        createdAt: timestamp
                    }
                }));

                return NextResponse.json({
                    success: true,
                    data: { transactionId, pointsConverted: convertible, walletAmount, message: `Converted ${convertible} points to ₹${walletAmount}` }
                });
            }

            case 'add_money': {
                const { amount, paymentId } = body;
                if (!amount || amount <= 0) {
                    return NextResponse.json({ success: false, error: 'Valid amount required' }, { status: 400 });
                }

                // Credit main wallet
                await docClient.send(new UpdateCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: { PK: `USER#${userId}`, SK: 'WALLET#MAIN' },
                    UpdateExpression: 'ADD balance :amt, totalEarned :amt SET updatedAt = :ts',
                    ExpressionAttributeValues: { ':amt': amount, ':ts': timestamp }
                }));

                // Log transaction
                await docClient.send(new PutCommand({
                    TableName: 'ai-d-mart-wallets',
                    Item: {
                        PK: `USER#${userId}`, SK: `TRANSACTION#${transactionId}`,
                        transactionId, walletType: 'MAIN', type: 'ADD_MONEY',
                        amount, paymentId,
                        description: `Added ₹${amount} to wallet`,
                        status: 'COMPLETED',
                        GSI1PK: 'TRANSACTION#ADD_MONEY', GSI1SK: timestamp,
                        createdAt: timestamp
                    }
                }));

                return NextResponse.json({
                    success: true,
                    data: { transactionId, amount, message: `₹${amount} added to wallet` }
                });
            }

            case 'spend': {
                const { amount, walletType = 'MAIN', orderId, description } = body;
                if (!amount || amount <= 0) {
                    return NextResponse.json({ success: false, error: 'Valid amount required' }, { status: 400 });
                }

                const wt = walletType.toUpperCase();
                const wallet = await docClient.send(new GetCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: { PK: `USER#${userId}`, SK: `WALLET#${wt}` }
                }));

                if (!wallet.Item || (wallet.Item.balance || 0) < amount) {
                    return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
                }

                await docClient.send(new UpdateCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: { PK: `USER#${userId}`, SK: `WALLET#${wt}` },
                    UpdateExpression: 'ADD balance :neg, totalSpent :amt SET updatedAt = :ts',
                    ExpressionAttributeValues: { ':neg': -amount, ':amt': amount, ':ts': timestamp }
                }));

                await docClient.send(new PutCommand({
                    TableName: 'ai-d-mart-wallets',
                    Item: {
                        PK: `USER#${userId}`, SK: `TRANSACTION#${transactionId}`,
                        transactionId, walletType: wt, type: 'SPEND',
                        amount: -amount, orderId,
                        description: description || `Spent ₹${amount} from ${wt} wallet`,
                        status: 'COMPLETED',
                        GSI1PK: 'TRANSACTION#SPEND', GSI1SK: timestamp,
                        createdAt: timestamp
                    }
                }));

                return NextResponse.json({
                    success: true,
                    data: { transactionId, amount, remainingBalance: (wallet.Item.balance || 0) - amount }
                });
            }

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Wallet POST error:', error);
        return NextResponse.json({ success: false, error: 'Failed to process wallet operation' }, { status: 500 });
    }
}
