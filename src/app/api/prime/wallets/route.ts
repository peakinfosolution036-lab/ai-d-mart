import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const walletType = searchParams.get('type');

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }

        if (walletType) {
            // Get specific wallet
            const wallet = await docClient.send(new GetCommand({
                TableName: 'ai-d-mart-wallets',
                Key: {
                    PK: `USER#${userId}`,
                    SK: `WALLET#${walletType.toUpperCase()}`
                }
            }));

            return NextResponse.json({
                success: true,
                data: wallet.Item || null
            });
        } else {
            // Get all wallets for user
            const walletTypes = ['REFERRAL', 'SHOPPING', 'EVENT'];
            const wallets: Record<string, any> = {};

            for (const type of walletTypes) {
                const wallet = await docClient.send(new GetCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: {
                        PK: `USER#${userId}`,
                        SK: `WALLET#${type}`
                    }
                }));

                if (wallet.Item) {
                    wallets[type.toLowerCase()] = wallet.Item;
                }
            }

            return NextResponse.json({
                success: true,
                data: wallets
            });
        }

    } catch (error) {
        console.error('Get wallet error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch wallet details'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, userId, walletType, amount, transactionType, description, orderId } = body;

        if (!userId || !walletType || !action) {
            return NextResponse.json({
                success: false,
                error: 'User ID, wallet type, and action are required'
            }, { status: 400 });
        }

        const timestamp = new Date().toISOString();
        const transactionId = uuidv4();

        switch (action) {
            case 'add_cashback':
                return await addCashback(userId, amount, orderId, transactionId, timestamp);
            
            case 'add_commission':
                return await addCommission(userId, amount, orderId, transactionId, timestamp);
            
            case 'withdraw':
                return await processWithdrawal(userId, walletType, amount, transactionId, timestamp);
            
            case 'spend':
                return await spendFromWallet(userId, walletType, amount, orderId, transactionId, timestamp);
            
            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Wallet operation error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process wallet operation'
        }, { status: 500 });
    }
}

async function addCashback(userId: string, amount: number, orderId: string, transactionId: string, timestamp: string) {
    const cashbackAmount = Math.round(amount * 0.05); // 5% cashback

    // Update shopping wallet
    await docClient.send(new UpdateCommand({
        TableName: 'ai-d-mart-wallets',
        Key: {
            PK: `USER#${userId}`,
            SK: 'WALLET#SHOPPING'
        },
        UpdateExpression: 'ADD balance :amount, totalEarned :amount SET updatedAt = :updated',
        ExpressionAttributeValues: {
            ':amount': cashbackAmount,
            ':updated': timestamp
        }
    }));

    // Log transaction
    await docClient.send(new PutCommand({
        TableName: 'ai-d-mart-wallets',
        Item: {
            PK: `USER#${userId}`,
            SK: `TRANSACTION#${transactionId}`,
            transactionId,
            walletType: 'SHOPPING',
            type: 'CASHBACK',
            amount: cashbackAmount,
            orderId,
            description: `5% cashback on order ${orderId}`,
            status: 'COMPLETED',
            GSI1PK: 'TRANSACTION#CASHBACK',
            GSI1SK: timestamp,
            createdAt: timestamp
        }
    }));

    return NextResponse.json({
        success: true,
        data: {
            transactionId,
            cashbackAmount,
            walletType: 'shopping'
        }
    });
}

async function addCommission(userId: string, amount: number, orderId: string, transactionId: string, timestamp: string) {
    const commissionAmount = Math.round(amount * 0.07); // 7% commission

    // Update event wallet
    await docClient.send(new UpdateCommand({
        TableName: 'ai-d-mart-wallets',
        Key: {
            PK: `USER#${userId}`,
            SK: 'WALLET#EVENT'
        },
        UpdateExpression: 'ADD balance :amount, totalEarned :amount SET updatedAt = :updated',
        ExpressionAttributeValues: {
            ':amount': commissionAmount,
            ':updated': timestamp
        }
    }));

    // Log transaction
    await docClient.send(new PutCommand({
        TableName: 'ai-d-mart-wallets',
        Item: {
            PK: `USER#${userId}`,
            SK: `TRANSACTION#${transactionId}`,
            transactionId,
            walletType: 'EVENT',
            type: 'COMMISSION',
            amount: commissionAmount,
            orderId,
            description: `7% commission on event booking ${orderId}`,
            status: 'COMPLETED',
            GSI1PK: 'TRANSACTION#COMMISSION',
            GSI1SK: timestamp,
            createdAt: timestamp
        }
    }));

    return NextResponse.json({
        success: true,
        data: {
            transactionId,
            commissionAmount,
            walletType: 'event'
        }
    });
}

async function processWithdrawal(userId: string, walletType: string, amount: number, transactionId: string, timestamp: string) {
    // Get current wallet balance
    const wallet = await docClient.send(new GetCommand({
        TableName: 'ai-d-mart-wallets',
        Key: {
            PK: `USER#${userId}`,
            SK: `WALLET#${walletType.toUpperCase()}`
        }
    }));

    if (!wallet.Item || wallet.Item.balance < amount) {
        return NextResponse.json({
            success: false,
            error: 'Insufficient balance'
        }, { status: 400 });
    }

    // Update wallet balance
    await docClient.send(new UpdateCommand({
        TableName: 'ai-d-mart-wallets',
        Key: {
            PK: `USER#${userId}`,
            SK: `WALLET#${walletType.toUpperCase()}`
        },
        UpdateExpression: 'ADD balance :negAmount, totalWithdrawn :amount SET updatedAt = :updated',
        ExpressionAttributeValues: {
            ':negAmount': -amount,
            ':amount': amount,
            ':updated': timestamp
        }
    }));

    // Log withdrawal transaction
    await docClient.send(new PutCommand({
        TableName: 'ai-d-mart-wallets',
        Item: {
            PK: `USER#${userId}`,
            SK: `TRANSACTION#${transactionId}`,
            transactionId,
            walletType: walletType.toUpperCase(),
            type: 'WITHDRAWAL',
            amount: -amount,
            description: `Withdrawal from ${walletType} wallet`,
            status: 'PENDING', // Admin approval required
            GSI1PK: 'TRANSACTION#WITHDRAWAL',
            GSI1SK: timestamp,
            createdAt: timestamp
        }
    }));

    return NextResponse.json({
        success: true,
        data: {
            transactionId,
            withdrawalAmount: amount,
            status: 'PENDING'
        }
    });
}

async function spendFromWallet(userId: string, walletType: string, amount: number, orderId: string, transactionId: string, timestamp: string) {
    // Get current wallet balance
    const wallet = await docClient.send(new GetCommand({
        TableName: 'ai-d-mart-wallets',
        Key: {
            PK: `USER#${userId}`,
            SK: `WALLET#${walletType.toUpperCase()}`
        }
    }));

    if (!wallet.Item || wallet.Item.balance < amount) {
        return NextResponse.json({
            success: false,
            error: 'Insufficient wallet balance'
        }, { status: 400 });
    }

    // Update wallet balance
    await docClient.send(new UpdateCommand({
        TableName: 'ai-d-mart-wallets',
        Key: {
            PK: `USER#${userId}`,
            SK: `WALLET#${walletType.toUpperCase()}`
        },
        UpdateExpression: 'ADD balance :negAmount, totalSpent :amount SET updatedAt = :updated',
        ExpressionAttributeValues: {
            ':negAmount': -amount,
            ':amount': amount,
            ':updated': timestamp
        }
    }));

    // Log spending transaction
    await docClient.send(new PutCommand({
        TableName: 'ai-d-mart-wallets',
        Item: {
            PK: `USER#${userId}`,
            SK: `TRANSACTION#${transactionId}`,
            transactionId,
            walletType: walletType.toUpperCase(),
            type: 'SPEND',
            amount: -amount,
            orderId,
            description: `Payment for order ${orderId}`,
            status: 'COMPLETED',
            GSI1PK: 'TRANSACTION#SPEND',
            GSI1SK: timestamp,
            createdAt: timestamp
        }
    }));

    return NextResponse.json({
        success: true,
        data: {
            transactionId,
            spentAmount: amount,
            remainingBalance: wallet.Item.balance - amount
        }
    });
}