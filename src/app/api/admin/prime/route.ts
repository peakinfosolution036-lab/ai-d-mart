import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'members':
                return await getPrimeMembers();
            
            case 'analytics':
                return await getPrimeAnalytics();
            
            case 'withdrawals':
                return await getPendingWithdrawals();
            
            case 'distribution_logs':
                return await getDistributionLogs();
            
            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Admin Prime GET error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch Prime data'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, transactionId, status, adminNotes } = body;

        switch (action) {
            case 'approve_withdrawal':
                return await approveWithdrawal(transactionId, adminNotes);
            
            case 'reject_withdrawal':
                return await rejectWithdrawal(transactionId, adminNotes);
            
            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Admin Prime POST error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process Prime operation'
        }, { status: 500 });
    }
}

async function getPrimeMembers() {
    try {
        const members = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-prime-memberships',
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'PRIME#ACTIVE'
            }
        }));

        // Get wallet balances for each member
        const membersWithWallets = await Promise.all(
            (members.Items || []).map(async (member) => {
                const walletTypes = ['REFERRAL', 'SHOPPING', 'EVENT'];
                const wallets: Record<string, any> = {};

                for (const type of walletTypes) {
                    try {
                        const wallet = await docClient.send(new QueryCommand({
                            TableName: 'ai-d-mart-wallets',
                            KeyConditionExpression: 'PK = :pk AND SK = :sk',
                            ExpressionAttributeValues: {
                                ':pk': `USER#${member.userId}`,
                                ':sk': `WALLET#${type}`
                            }
                        }));

                        if (wallet.Items && wallet.Items[0]) {
                            wallets[type.toLowerCase()] = wallet.Items[0];
                        }
                    } catch (error) {
                        console.error(`Error fetching ${type} wallet for user ${member.userId}:`, error);
                    }
                }

                return {
                    ...member,
                    wallets
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: membersWithWallets
        });

    } catch (error) {
        console.error('Error getting Prime members:', error);
        throw error;
    }
}

async function getPrimeAnalytics() {
    try {
        // Get total members
        const members = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-prime-memberships',
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'PRIME#ACTIVE'
            }
        }));

        // Get distribution logs
        const distributions = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-prime-memberships',
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'DISTRIBUTION#LOG'
            }
        }));

        // Calculate totals
        const totalMembers = members.Items?.length || 0;
        const totalRevenue = (distributions.Items || []).reduce((sum, dist) => sum + (dist.totalAmount || 0), 0);
        
        // Calculate distribution totals
        const distributionTotals = {
            referralIncome: 0,
            shoppingCashback: 0,
            eventCommission: 0,
            awardsRewards: 0,
            platformCharges: 0,
            companyProfit: 0,
            gst: 0
        };

        (distributions.Items || []).forEach(dist => {
            if (dist.distribution) {
                distributionTotals.referralIncome += dist.distribution.referralIncome || 0;
                distributionTotals.shoppingCashback += dist.distribution.shoppingCashback || 0;
                distributionTotals.eventCommission += dist.distribution.eventCommission || 0;
                distributionTotals.awardsRewards += dist.distribution.awardsRewards || 0;
                distributionTotals.platformCharges += dist.distribution.platformCharges || 0;
                distributionTotals.companyProfit += dist.distribution.companyProfit || 0;
                distributionTotals.gst += dist.distribution.gst || 0;
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                totalMembers,
                totalRevenue,
                distributionTotals,
                recentMembers: members.Items?.slice(0, 10) || []
            }
        });

    } catch (error) {
        console.error('Error getting Prime analytics:', error);
        throw error;
    }
}

async function getPendingWithdrawals() {
    try {
        const withdrawals = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-wallets',
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'TRANSACTION#WITHDRAWAL'
            }
        }));

        const pendingWithdrawals = (withdrawals.Items || []).filter(w => w.status === 'PENDING');

        return NextResponse.json({
            success: true,
            data: pendingWithdrawals
        });

    } catch (error) {
        console.error('Error getting pending withdrawals:', error);
        throw error;
    }
}

async function getDistributionLogs() {
    try {
        const logs = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-prime-memberships',
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'DISTRIBUTION#LOG'
            }
        }));

        return NextResponse.json({
            success: true,
            data: logs.Items || []
        });

    } catch (error) {
        console.error('Error getting distribution logs:', error);
        throw error;
    }
}

async function approveWithdrawal(transactionId: string, adminNotes: string) {
    try {
        // Find the withdrawal transaction
        const transactions = await docClient.send(new ScanCommand({
            TableName: 'ai-d-mart-wallets',
            FilterExpression: 'transactionId = :id',
            ExpressionAttributeValues: {
                ':id': transactionId
            }
        }));

        if (!transactions.Items || transactions.Items.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Transaction not found'
            }, { status: 404 });
        }

        const transaction = transactions.Items[0];
        const timestamp = new Date().toISOString();

        // Update transaction status
        await docClient.send(new UpdateCommand({
            TableName: 'ai-d-mart-wallets',
            Key: {
                PK: transaction.PK,
                SK: transaction.SK
            },
            UpdateExpression: 'SET #status = :status, adminNotes = :notes, approvedAt = :approved, updatedAt = :updated',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'APPROVED',
                ':notes': adminNotes || 'Approved by admin',
                ':approved': timestamp,
                ':updated': timestamp
            }
        }));

        return NextResponse.json({
            success: true,
            data: {
                transactionId,
                status: 'APPROVED',
                message: 'Withdrawal approved successfully'
            }
        });

    } catch (error) {
        console.error('Error approving withdrawal:', error);
        throw error;
    }
}

async function rejectWithdrawal(transactionId: string, adminNotes: string) {
    try {
        // Find the withdrawal transaction
        const transactions = await docClient.send(new ScanCommand({
            TableName: 'ai-d-mart-wallets',
            FilterExpression: 'transactionId = :id',
            ExpressionAttributeValues: {
                ':id': transactionId
            }
        }));

        if (!transactions.Items || transactions.Items.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Transaction not found'
            }, { status: 404 });
        }

        const transaction = transactions.Items[0];
        const timestamp = new Date().toISOString();

        // Update transaction status
        await docClient.send(new UpdateCommand({
            TableName: 'ai-d-mart-wallets',
            Key: {
                PK: transaction.PK,
                SK: transaction.SK
            },
            UpdateExpression: 'SET #status = :status, adminNotes = :notes, rejectedAt = :rejected, updatedAt = :updated',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'REJECTED',
                ':notes': adminNotes || 'Rejected by admin',
                ':rejected': timestamp,
                ':updated': timestamp
            }
        }));

        // Refund the amount back to user's wallet
        const userId = transaction.PK.replace('USER#', '');
        const walletType = transaction.walletType;
        const amount = Math.abs(transaction.amount);

        await docClient.send(new UpdateCommand({
            TableName: 'ai-d-mart-wallets',
            Key: {
                PK: `USER#${userId}`,
                SK: `WALLET#${walletType}`
            },
            UpdateExpression: 'ADD balance :amount SET updatedAt = :updated',
            ExpressionAttributeValues: {
                ':amount': amount,
                ':updated': timestamp
            }
        }));

        return NextResponse.json({
            success: true,
            data: {
                transactionId,
                status: 'REJECTED',
                message: 'Withdrawal rejected and amount refunded'
            }
        });

    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        throw error;
    }
}