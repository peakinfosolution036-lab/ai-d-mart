import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, amount, payoutDetails } = body;

        if (!userId || !amount || !payoutDetails) {
            return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
        }

        const withdrawalAmount = parseFloat(amount);
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
        }

        const timestamp = new Date().toISOString();
        const transactionId = uuidv4();

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

        if (withdrawalAmount > totalBalance) {
            return NextResponse.json({ success: false, error: 'Insufficient wallet balance' }, { status: 400 });
        }

        // 1. Deduct from Wallets sequentially
        let remainingToDeduct = withdrawalAmount;
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
            remainingToDeduct -= toDeduct;
        }

        // 2. Log Wallet Transaction 
        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-wallets',
            Item: {
                PK: `USER#${userId}`,
                SK: `TRANSACTION#${transactionId}`,
                transactionId,
                walletType: 'MAIN',
                type: 'WITHDRAWAL_REQUEST',
                amount: -withdrawalAmount,
                description: `Withdrawal request for ₹${withdrawalAmount} to ${payoutDetails}`,
                status: 'PENDING',
                GSI1PK: 'TRANSACTION#WITHDRAWAL',
                GSI1SK: timestamp,
                createdAt: timestamp
            }
        }));

        // 3. Create standalone Withdrawal Request entity for Admin
        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-wallets', // Storing requests in wallets table under different PK
            Item: {
                PK: 'WITHDRAWAL_REQUEST',
                SK: `${timestamp}#${transactionId}`,
                transactionId,
                userId,
                amount: withdrawalAmount,
                payoutDetails,
                status: 'PENDING',
                createdAt: timestamp,
                updatedAt: timestamp
            }
        }));

        return NextResponse.json({
            success: true,
            message: 'Withdrawal request submitted successfully'
        });

    } catch (error) {
        console.error('Withdrawal request error:', error);
        return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
    }
}
