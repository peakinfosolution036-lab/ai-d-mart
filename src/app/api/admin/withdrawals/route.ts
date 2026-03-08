import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

export async function GET(request: NextRequest) {
    try {
        const result = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-wallets',
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'WITHDRAWAL_REQUEST'
            },
            ScanIndexForward: false // Newest first
        }));

        const withdrawals = result.Items || [];

        // In a real app we might want to fetch user details for each withdrawal id,
        // but for now we'll just return what's there.

        return NextResponse.json({ success: true, data: withdrawals });
    } catch (error) {
        console.error('Failed to fetch withdrawal requests:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch withdrawals' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestSk, status, note } = body;
        // requestSk here is the SK, e.g. `${timestamp}#${transactionId}`

        if (!requestSk || !status || !['APPROVED', 'REJECTED', 'PAID'].includes(status)) {
            return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
        }

        const timestamp = new Date().toISOString();

        // Optional: Ensure it exists before changing
        const getRes = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-wallets',
            Key: {
                PK: 'WITHDRAWAL_REQUEST',
                SK: requestSk
            }
        }));

        const withdrawalReq = getRes.Item;
        if (!withdrawalReq) {
            return NextResponse.json({ success: false, error: 'Withdrawal request not found' }, { status: 404 });
        }

        // If REJECTED, we need to refund the user's wallet
        if (status === 'REJECTED' && withdrawalReq.status === 'PENDING') {
            await docClient.send(new UpdateCommand({
                TableName: 'ai-d-mart-wallets',
                Key: { PK: `USER#${withdrawalReq.userId}`, SK: 'WALLET#MAIN' },
                UpdateExpression: 'SET balance = balance + :amount, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':amount': withdrawalReq.amount,
                    ':updatedAt': timestamp
                }
            }));

            // Wait, what about the Transaction Log? 
            // Ideally we'd also add a REFUND transaction to the user's log,
            // but simply refunding the balance solves the core issue.
        }

        // Update the withdrawal request status
        await docClient.send(new UpdateCommand({
            TableName: 'ai-d-mart-wallets',
            Key: {
                PK: 'WITHDRAWAL_REQUEST',
                SK: requestSk
            },
            UpdateExpression: 'SET #st = :status, adminNote = :note, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#st': 'status'
            },
            ExpressionAttributeValues: {
                ':status': status,
                ':note': note || null,
                ':updatedAt': timestamp
            }
        }));

        // Try to update the user's transaction status if we have the transactionId
        try {
            if (withdrawalReq.transactionId) {
                await docClient.send(new UpdateCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: {
                        PK: `USER#${withdrawalReq.userId}`,
                        SK: `TRANSACTION#${withdrawalReq.transactionId}`
                    },
                    UpdateExpression: 'SET #st = :status, updatedAt = :updatedAt',
                    ExpressionAttributeNames: {
                        '#st': 'status'
                    },
                    ExpressionAttributeValues: {
                        ':status': status,
                        ':updatedAt': timestamp
                    }
                }));
            }
        } catch (e) {
            console.error('Failed to update transaction status:', e);
            // Non-fatal error
        }

        return NextResponse.json({ success: true, message: `Withdrawal marked as ${status}` });
    } catch (error) {
        console.error('Failed to update withdrawal:', error);
        return NextResponse.json({ success: false, error: 'Failed to update withdrawal' }, { status: 500 });
    }
}
