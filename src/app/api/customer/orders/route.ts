import { NextRequest, NextResponse } from 'next/server';
import { orders, transactions, notifications, docClient } from '@/lib/dynamodb';
import { GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { userId, items, total, type, customerInfo, paymentStatus, utrNumber, paymentScreenshot } = await req.json();
        if (!userId || !items || !total) throw new Error('Missing required fields');

        const timestamp = new Date().toISOString();
        const orderId = uuidv4();

        // If paying with Wallet, check and deduct from multi-wallet system
        if (customerInfo?.paymentMethod === 'wallet') {
            const walletTypes = ['MAIN', 'REFERRAL', 'SHOPPING', 'EVENT'];
            const wallets = [];
            let totalBalance = 0;

            for (const type of walletTypes) {
                const wRes = await docClient.send(new GetCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: { PK: `USER#${userId}`, SK: `WALLET#${type}` }
                }));
                const balance = wRes.Item?.balance || 0;
                if (balance > 0) {
                    wallets.push({ type, balance });
                    totalBalance += balance;
                }
            }

            if (totalBalance < total) {
                return NextResponse.json({ success: false, error: 'Insufficient wallet balance across your accounts.' }, { status: 400 });
            }

            // Deduct from Wallets sequentially
            let remainingToDeduct = total;
            for (const wallet of wallets) {
                if (remainingToDeduct <= 0) break;
                const toDeduct = Math.min(wallet.balance, remainingToDeduct);

                await docClient.send(new UpdateCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: { PK: `USER#${userId}`, SK: `WALLET#${wallet.type}` },
                    UpdateExpression: 'SET balance = balance - :amount, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                        ':amount': toDeduct,
                        ':updatedAt': timestamp
                    }
                }));

                // Record wallet transaction for this specific deduction
                const txId = uuidv4();
                await docClient.send(new PutCommand({
                    TableName: 'ai-d-mart-wallets',
                    Item: {
                        PK: `USER#${userId}`,
                        SK: `TRANSACTION#${txId}`,
                        transactionId: txId,
                        walletType: wallet.type,
                        type: 'SHOP_PURCHASE',
                        amount: -toDeduct,
                        description: `Payment for Order ${orderId}`,
                        status: 'COMPLETED',
                        createdAt: timestamp
                    }
                }));

                remainingToDeduct -= toDeduct;
            }
        }

        // 2. Create Order
        await orders.create(orderId, {
            userId,
            items,
            total,
            type,
            status: paymentStatus || 'completed',
            paymentMethod: customerInfo?.paymentMethod || 'wallet',
            customerInfo,
            utrNumber,
            paymentScreenshot
        });

        // 5. Create Notification
        await notifications.create(`notif_${Date.now()}_${userId}`, {
            id: `notif_${Date.now()}_${userId}`,
            userId,
            title: 'Order Placed',
            message: `Your order for ₹${total} has been placed successfully.`,
            type: 'order',
            isRead: false,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, orderId });
    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        if (!userId) throw new Error('userId required');

        const items = await orders.getByUser(userId);
        return NextResponse.json({ success: true, data: items });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
