import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, GetCommand, QueryCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Helper: Fetch referral settings from DynamoDB
async function getSettings() {
    try {
        const result = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-data',
            Key: { PK: 'CONFIG', SK: 'REFERRAL_SETTINGS' }
        }));
        return result.Item?.settings || {
            pointsPerReferral: 25,
            approvalMode: 'manual',
            systemEnabled: true,
            pointsToWalletRate: 100,
        };
    } catch {
        return { pointsPerReferral: 25, approvalMode: 'manual', systemEnabled: true, pointsToWalletRate: 100 };
    }
}

// Generate referral code
function generateReferralCode(): string {
    const prefix = 'REF';
    const middle = 'TITAN';
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${middle}-${suffix}`;
}

// GET - Get user referral data OR admin stats/list
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const type = searchParams.get('type'); // 'stats', 'admin_list', or default (user data)

        // Admin: Get aggregate stats
        if (type === 'stats') {
            const scan = await docClient.send(new ScanCommand({
                TableName: 'referrals',
                Limit: 1000,
            }));
            const referrals = scan.Items || [];
            const total = referrals.length;
            const pending = referrals.filter((r: any) => r.status === 'pending').length;
            const approved = referrals.filter((r: any) => r.status === 'approved').length;
            const totalPoints = referrals.reduce((sum: number, r: any) => sum + (r.pointsEarned || 0), 0);
            const settings = await getSettings();
            const walletValue = totalPoints / (settings.pointsToWalletRate || 100);

            return NextResponse.json({
                success: true,
                data: {
                    stats: { totalReferrals: total, pendingReferrals: pending, approvedReferrals: approved, totalPointsAwarded: totalPoints, walletValueGenerated: walletValue },
                }
            });
        }

        // Admin: Get all referrals list
        if (type === 'admin_list') {
            const scan = await docClient.send(new ScanCommand({
                TableName: 'referrals',
                Limit: 500,
            }));
            return NextResponse.json({
                success: true,
                data: { referrals: scan.Items || [] }
            });
        }

        // User: Get own referral data
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        // Get user points
        const pointsResult = await docClient.send(new GetCommand({
            TableName: 'user-points',
            Key: { userId }
        }));

        // Get user referrals
        const referralsResult = await docClient.send(new QueryCommand({
            TableName: 'referrals',
            IndexName: 'referrer-index',
            KeyConditionExpression: 'referrerId = :referrerId',
            ExpressionAttributeValues: { ':referrerId': userId }
        }));

        // Get point transactions
        const transactionsResult = await docClient.send(new QueryCommand({
            TableName: 'point-transactions',
            IndexName: 'user-transactions-index',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: { ':userId': userId }
        }));

        // Get Prime membership status
        let isPrimeMember = false;
        try {
            const primeResult = await docClient.send(new GetCommand({
                TableName: 'ai-d-mart-prime-memberships',
                Key: { PK: `USER#${userId}`, SK: 'MEMBERSHIP' }
            }));
            isPrimeMember = primeResult.Item?.status === 'ACTIVE';
        } catch { /* ignore */ }

        // Get wallet balances
        const wallets: Record<string, number> = {};
        for (const wt of ['REFERRAL', 'SHOPPING', 'EVENT', 'MAIN']) {
            try {
                const w = await docClient.send(new GetCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: { PK: `USER#${userId}`, SK: `WALLET#${wt}` }
                }));
                wallets[wt.toLowerCase()] = w.Item?.balance || 0;
            } catch { wallets[wt.toLowerCase()] = 0; }
        }

        const points = pointsResult.Item || { userId, totalPoints: 0, availablePoints: 0, usedPoints: 0, convertedPoints: 0 };
        const referrals = referralsResult.Items || [];
        const settings = await getSettings();

        return NextResponse.json({
            success: true,
            data: {
                points,
                referrals,
                transactions: transactionsResult.Items || [],
                isPrimeMember,
                wallets,
                totalWalletBalance: Object.values(wallets).reduce((a, b) => a + b, 0),
                walletConversion: { rate: settings.pointsToWalletRate || 100, walletValue: (points.availablePoints || 0) / (settings.pointsToWalletRate || 100) },
                stats: {
                    totalReferrals: referrals.length,
                    approvedReferrals: referrals.filter((r: any) => r.status === 'approved').length,
                    pendingReferrals: referrals.filter((r: any) => r.status === 'pending').length,
                    totalPointsEarned: points.totalPoints || 0,
                    totalEarnings: (points.totalPoints || 0) / (settings.pointsToWalletRate || 100),
                    pendingEarnings: (points.availablePoints || 0) / (settings.pointsToWalletRate || 100),
                    cashbackEarned: wallets.shopping || 0,
                    eventCommission: wallets.event || 0,
                    referralIncome: wallets.referral || 0,
                },
            }
        });
    } catch (error) {
        console.error('Error fetching referral data:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
}

// POST - Create referral or process referral signup
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, userId, referralCode, newUserId } = body;
        const settings = await getSettings();

        // Check if system is enabled
        if (!settings.systemEnabled) {
            return NextResponse.json({ success: false, error: 'Referral system is currently disabled' }, { status: 400 });
        }

        if (action === 'create_referral') {
            const referralId = uuidv4();
            const isAutoApprove = settings.approvalMode === 'auto';

            const referral: any = {
                id: referralId,
                referrerId: userId,
                referredUserId: newUserId,
                referralCode,
                status: isAutoApprove ? 'approved' : 'pending',
                createdAt: new Date().toISOString(),
                pointsEarned: isAutoApprove ? settings.pointsPerReferral : 0,
            };
            if (isAutoApprove) {
                referral.approvedAt = new Date().toISOString();
            }

            await docClient.send(new PutCommand({
                TableName: 'referrals',
                Item: referral
            }));

            // Auto-approve: also award points and convert to wallet
            if (isAutoApprove) {
                await awardPointsAndCredit(userId, settings.pointsPerReferral, referralId, newUserId, settings);
            }

            return NextResponse.json({ success: true, referral });
        }

        if (action === 'approve_referral') {
            const { referralId } = body;
            const pointsToAward = settings.pointsPerReferral;

            // Update referral status
            await docClient.send(new UpdateCommand({
                TableName: 'referrals',
                Key: { id: referralId },
                UpdateExpression: 'SET #status = :status, pointsEarned = :points, approvedAt = :approvedAt',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: {
                    ':status': 'approved',
                    ':points': pointsToAward,
                    ':approvedAt': new Date().toISOString()
                }
            }));

            // Get referral to find referrer
            const referralResult = await docClient.send(new GetCommand({
                TableName: 'referrals',
                Key: { id: referralId }
            }));
            const referral = referralResult.Item;

            if (referral) {
                await awardPointsAndCredit(referral.referrerId, pointsToAward, referralId, referral.referredUserId, settings);
            }

            return NextResponse.json({ success: true, message: 'Referral approved, points awarded, wallet credited' });
        }

        if (action === 'reject_referral') {
            const { referralId } = body;
            await docClient.send(new UpdateCommand({
                TableName: 'referrals',
                Key: { id: referralId },
                UpdateExpression: 'SET #status = :status, rejectedAt = :rejectedAt',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: {
                    ':status': 'rejected',
                    ':rejectedAt': new Date().toISOString()
                }
            }));
            return NextResponse.json({ success: true, message: 'Referral rejected' });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error processing referral:', error);
        return NextResponse.json({ success: false, error: 'Failed to process referral' }, { status: 500 });
    }
}

// Award points to referrer AND auto-credit their wallet
async function awardPointsAndCredit(
    referrerId: string, points: number, referralId: string,
    referredUserId: string, settings: any
) {
    const timestamp = new Date().toISOString();

    // 1. Update user points
    await docClient.send(new UpdateCommand({
        TableName: 'user-points',
        Key: { userId: referrerId },
        UpdateExpression: 'ADD totalPoints :points, availablePoints :points',
        ExpressionAttributeValues: { ':points': points }
    }));

    // 2. Create point transaction record
    await docClient.send(new PutCommand({
        TableName: 'point-transactions',
        Item: {
            id: uuidv4(),
            userId: referrerId,
            type: 'earned',
            points,
            description: `Referral bonus for user ${referredUserId}`,
            referralId,
            createdAt: timestamp
        }
    }));

    // 3. Auto-convert points to wallet balance (100 pts = ₹1)
    const rate = settings.pointsToWalletRate || 100;
    const walletAmount = points / rate;
    if (walletAmount > 0) {
        await docClient.send(new UpdateCommand({
            TableName: 'ai-d-mart-wallets',
            Key: { PK: `USER#${referrerId}`, SK: 'WALLET#MAIN' },
            UpdateExpression: 'ADD balance :amt, totalEarned :amt SET updatedAt = :ts',
            ExpressionAttributeValues: { ':amt': walletAmount, ':ts': timestamp }
        }));

        // Log wallet transaction
        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-wallets',
            Item: {
                PK: `USER#${referrerId}`,
                SK: `TRANSACTION#${uuidv4()}`,
                transactionId: uuidv4(),
                walletType: 'MAIN',
                type: 'REFERRAL_POINTS_CREDIT',
                amount: walletAmount,
                pointsConverted: points,
                description: `Auto-converted ${points} referral points to ₹${walletAmount}`,
                status: 'COMPLETED',
                GSI1PK: 'TRANSACTION#REFERRAL_POINTS_CREDIT',
                GSI1SK: timestamp,
                createdAt: timestamp
            }
        }));
    }
}