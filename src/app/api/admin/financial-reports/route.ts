import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // 1. Fetch Prime Memberships (Membership Sales)
        const primeResult = await docClient.send(new ScanCommand({
            TableName: 'ai-d-mart-prime-memberships',
        }));
        const primeMemberships = primeResult.Items || [];

        let primeRevenue = 0;
        primeMemberships.forEach(membership => {
            // Assuming each prime membership costs 500 based on standard pricing
            primeRevenue += 500;
        });

        // 2. Fetch Executed Withdrawals
        const withdrawalsResult = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-wallets',
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'WITHDRAWAL_REQUEST'
            }
        }));

        const allWithdrawals = withdrawalsResult.Items || [];
        const executedWithdrawals = allWithdrawals.filter(w => w.status === 'PAID');

        let totalWithdrawn = 0;
        executedWithdrawals.forEach(w => {
            totalWithdrawn += Number(w.amount) || 0;
        });

        // 3. Fetch Recent Wallet Transactions (Scan ai-d-mart-wallets for TRANSACTION#)
        // Note: For a production app with millions of rows, scanning is bad, 
        // but for this scale and admin dashboard, it's acceptable or we'd use GSI.
        const transactionsResult = await docClient.send(new ScanCommand({
            TableName: 'ai-d-mart-wallets',
            FilterExpression: 'begins_with(SK, :skPrefix)',
            ExpressionAttributeValues: {
                ':skPrefix': 'TRANSACTION#'
            }
        }));

        const allTransactions = transactionsResult.Items || [];

        // Sort transactions by date descending
        const recentTransactions = allTransactions
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 100); // Get latest 100

        // 4. Calculate total wallet liabilities (user balances)
        const balancesResult = await docClient.send(new ScanCommand({
            TableName: 'ai-d-mart-wallets',
            FilterExpression: 'begins_with(SK, :skPrefix)',
            ExpressionAttributeValues: {
                ':skPrefix': 'WALLET#'
            }
        }));

        const allBalances = balancesResult.Items || [];
        let totalUserBalances = 0;
        allBalances.forEach(b => {
            totalUserBalances += Number(b.balance) || 0;
        });

        return NextResponse.json({
            success: true,
            data: {
                income: {
                    primeRevenue,
                    totalPlatformRevenue: primeRevenue // Can be expanded with other revenue streams
                },
                withdrawals: {
                    totalWithdrawn,
                    executedList: executedWithdrawals,
                    allList: allWithdrawals
                },
                memberships: {
                    totalPrimeMembers: primeMemberships.length,
                    list: primeMemberships
                },
                walletLiabilities: totalUserBalances,
                recentWalletTransactions: recentTransactions
            }
        });

    } catch (error) {
        console.error('Error generating financial reports:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
