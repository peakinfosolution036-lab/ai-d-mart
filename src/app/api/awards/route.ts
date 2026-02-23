import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Rank hierarchy
const DEFAULT_RANKS = [
    { rank: 'Customer', level: 0, minReferrals: 0, maxReferrals: 4, reward: null, requiresDownlineRank: null },
    { rank: 'Promoter', level: 1, minReferrals: 5, maxReferrals: 10, reward: 'Mobile (Free)', requiresDownlineRank: null },
    { rank: 'Partner', level: 2, minReferrals: 5, maxReferrals: 10, reward: 'Laptop (Free)', requiresDownlineRank: 'Promoter' },
    { rank: 'Distributor', level: 3, minReferrals: 5, maxReferrals: 10, reward: 'Gold (Free)', requiresDownlineRank: 'Partner' },
    { rank: 'Prime Distributor', level: 4, minReferrals: 5, maxReferrals: 10, reward: 'Bike (Free)', requiresDownlineRank: 'Distributor' },
    { rank: 'Director', level: 5, minReferrals: 5, maxReferrals: 10, reward: 'Car (Free)', requiresDownlineRank: 'Prime Distributor' },
    { rank: 'Prime Director', level: 6, minReferrals: 5, maxReferrals: 10, reward: 'House (Free)', requiresDownlineRank: 'Director' },
    { rank: 'Advisor', level: 7, minReferrals: 5, maxReferrals: 10, reward: 'Goa Trip', requiresDownlineRank: 'Prime Director' },
    { rank: 'Prime Advisor', level: 8, minReferrals: 5, maxReferrals: 10, reward: 'International Trip', requiresDownlineRank: 'Advisor' },
    { rank: 'Executive', level: 9, minReferrals: 0, maxReferrals: 0, reward: 'Final Settlement', requiresDownlineRank: 'Prime Advisor' },
];

// GET - User rank, progress, rewards, or admin reports
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const action = searchParams.get('action') || 'user_rank';

        if (action === 'admin_config') {
            // Return rank configuration
            const configResult = await docClient.send(new GetCommand({
                TableName: 'ai-d-mart-data',
                Key: { PK: 'CONFIG', SK: 'AWARDS_RANKS' }
            }));
            return NextResponse.json({
                success: true,
                data: { ranks: configResult.Item?.ranks || DEFAULT_RANKS, autoPromote: configResult.Item?.autoPromote ?? true }
            });
        }

        if (action === 'admin_reports') {
            // Rank-wise distribution report
            const allRanks = await docClient.send(new QueryCommand({
                TableName: 'ai-d-mart-data',
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: { ':pk': 'AWARDS' }
            }));
            const items = allRanks.Items || [];
            const rankCounts: Record<string, number> = {};
            items.forEach((item: any) => { rankCounts[item.currentRank] = (rankCounts[item.currentRank] || 0) + 1; });

            // Get pending rewards
            const rewardResults = await docClient.send(new QueryCommand({
                TableName: 'ai-d-mart-data',
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: { ':pk': 'REWARDS' }
            }));

            return NextResponse.json({
                success: true,
                data: {
                    rankDistribution: rankCounts,
                    totalUsers: items.length,
                    rewards: rewardResults.Items || []
                }
            });
        }

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        // Get user's rank data
        const rankData = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-data',
            Key: { PK: 'AWARDS', SK: `USER#${userId}` }
        }));

        // Get rank configuration
        const configResult = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-data',
            Key: { PK: 'CONFIG', SK: 'AWARDS_RANKS' }
        }));
        const ranks = configResult.Item?.ranks || DEFAULT_RANKS;

        // Get direct prime referrals count
        const referrals = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-referrals',
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':sk': 'REFERRAL#' }
        }));
        const directPrimeReferrals = (referrals.Items || []).filter((r: any) => r.status === 'COMPLETED').length;

        // Get user rewards
        const rewards = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-data',
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: { ':pk': 'REWARDS', ':sk': `USER#${userId}` }
        }));

        const currentRank = rankData.Item?.currentRank || 'Customer';
        const currentLevel = rankData.Item?.currentLevel || 0;

        // Calculate next rank target
        const nextRank = ranks.find((r: any) => r.level === currentLevel + 1);
        let nextRankProgress = 0;
        let nextRankTarget = '';

        if (nextRank) {
            if (nextRank.requiresDownlineRank) {
                const downlineCount = rankData.Item?.downlineCounts?.[nextRank.requiresDownlineRank] || 0;
                nextRankProgress = Math.min(100, (downlineCount / nextRank.minReferrals) * 100);
                nextRankTarget = `${nextRank.minReferrals - downlineCount} more ${nextRank.requiresDownlineRank}s to become ${nextRank.rank}`;
            } else {
                nextRankProgress = Math.min(100, (directPrimeReferrals / nextRank.minReferrals) * 100);
                nextRankTarget = `${Math.max(0, nextRank.minReferrals - directPrimeReferrals)} more referrals to become ${nextRank.rank}`;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                userId,
                currentRank,
                currentLevel,
                directPrimeReferrals,
                downlineCounts: rankData.Item?.downlineCounts || {},
                totalTeamSize: rankData.Item?.totalTeamSize || 0,
                totalBusinessVolume: rankData.Item?.totalBusinessVolume || 0,
                nextRank: nextRank?.rank || null,
                nextRankProgress,
                nextRankTarget,
                rewards: rewards.Items || [],
                ranksConfig: ranks
            }
        });
    } catch (error) {
        console.error('Awards GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch awards data' }, { status: 500 });
    }
}

// POST - Admin actions: configure ranks, approve rewards, manual promote
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        const timestamp = new Date().toISOString();

        switch (action) {
            case 'update_config': {
                const { ranks, autoPromote } = body;
                await docClient.send(new PutCommand({
                    TableName: 'ai-d-mart-data',
                    Item: {
                        PK: 'CONFIG', SK: 'AWARDS_RANKS',
                        ranks: ranks || DEFAULT_RANKS,
                        autoPromote: autoPromote ?? true,
                        updatedAt: timestamp
                    }
                }));
                return NextResponse.json({ success: true, message: 'Rank configuration updated' });
            }

            case 'manual_promote': {
                const { userId, newRank } = body;
                if (!userId || !newRank) {
                    return NextResponse.json({ success: false, error: 'userId and newRank required' }, { status: 400 });
                }

                const rankInfo = DEFAULT_RANKS.find(r => r.rank === newRank);
                if (!rankInfo) {
                    return NextResponse.json({ success: false, error: 'Invalid rank' }, { status: 400 });
                }

                await docClient.send(new UpdateCommand({
                    TableName: 'ai-d-mart-data',
                    Key: { PK: 'AWARDS', SK: `USER#${userId}` },
                    UpdateExpression: 'SET currentRank = :rank, currentLevel = :level, promotedAt = :ts, promotionMethod = :method, updatedAt = :ts',
                    ExpressionAttributeValues: {
                        ':rank': newRank,
                        ':level': rankInfo.level,
                        ':ts': timestamp,
                        ':method': 'MANUAL'
                    }
                }));

                // Create reward record if applicable
                if (rankInfo.reward) {
                    await docClient.send(new PutCommand({
                        TableName: 'ai-d-mart-data',
                        Item: {
                            PK: 'REWARDS', SK: `USER#${userId}#${uuidv4()}`,
                            userId, rank: newRank, reward: rankInfo.reward,
                            status: 'PENDING', createdAt: timestamp
                        }
                    }));
                }

                return NextResponse.json({ success: true, message: `User promoted to ${newRank}` });
            }

            case 'distribute_reward': {
                const { rewardId, userId } = body;
                if (!rewardId || !userId) {
                    return NextResponse.json({ success: false, error: 'rewardId and userId required' }, { status: 400 });
                }

                await docClient.send(new UpdateCommand({
                    TableName: 'ai-d-mart-data',
                    Key: { PK: 'REWARDS', SK: rewardId },
                    UpdateExpression: 'SET #s = :status, distributedAt = :ts',
                    ExpressionAttributeNames: { '#s': 'status' },
                    ExpressionAttributeValues: { ':status': 'DISTRIBUTED', ':ts': timestamp }
                }));

                return NextResponse.json({ success: true, message: 'Reward marked as distributed' });
            }

            case 'check_promotion': {
                // Auto-check and promote user based on referral counts
                const { userId } = body;
                if (!userId) {
                    return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
                }

                // Get config
                const configResult = await docClient.send(new GetCommand({
                    TableName: 'ai-d-mart-data',
                    Key: { PK: 'CONFIG', SK: 'AWARDS_RANKS' }
                }));
                const autoPromote = configResult.Item?.autoPromote ?? true;
                if (!autoPromote) {
                    return NextResponse.json({ success: true, message: 'Auto-promote disabled' });
                }

                const ranks = configResult.Item?.ranks || DEFAULT_RANKS;

                // Get current rank
                const rankData = await docClient.send(new GetCommand({
                    TableName: 'ai-d-mart-data',
                    Key: { PK: 'AWARDS', SK: `USER#${userId}` }
                }));
                const currentLevel = rankData.Item?.currentLevel || 0;

                // Get direct referrals
                const referrals = await docClient.send(new QueryCommand({
                    TableName: 'ai-d-mart-referrals',
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                    ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':sk': 'REFERRAL#' }
                }));
                const directCount = (referrals.Items || []).filter((r: any) => r.status === 'COMPLETED').length;

                // Check next rank eligibility
                const nextRank = ranks.find((r: any) => r.level === currentLevel + 1);
                if (!nextRank) {
                    return NextResponse.json({ success: true, message: 'Already at max rank' });
                }

                let eligible = false;
                if (nextRank.level === 1) {
                    // Promoter: based on direct prime referrals
                    eligible = directCount >= nextRank.minReferrals;
                } else if (nextRank.requiresDownlineRank) {
                    const downlineCount = rankData.Item?.downlineCounts?.[nextRank.requiresDownlineRank] || 0;
                    eligible = downlineCount >= nextRank.minReferrals;
                }

                if (eligible) {
                    await docClient.send(new UpdateCommand({
                        TableName: 'ai-d-mart-data',
                        Key: { PK: 'AWARDS', SK: `USER#${userId}` },
                        UpdateExpression: 'SET currentRank = :rank, currentLevel = :level, promotedAt = :ts, promotionMethod = :method, updatedAt = :ts',
                        ExpressionAttributeValues: {
                            ':rank': nextRank.rank,
                            ':level': nextRank.level,
                            ':ts': timestamp,
                            ':method': 'AUTO'
                        }
                    }));

                    if (nextRank.reward) {
                        await docClient.send(new PutCommand({
                            TableName: 'ai-d-mart-data',
                            Item: {
                                PK: 'REWARDS', SK: `USER#${userId}#${uuidv4()}`,
                                userId, rank: nextRank.rank, reward: nextRank.reward,
                                status: 'PENDING', createdAt: timestamp
                            }
                        }));
                    }

                    return NextResponse.json({ success: true, promoted: true, newRank: nextRank.rank, reward: nextRank.reward });
                }

                return NextResponse.json({ success: true, promoted: false, message: 'Not yet eligible' });
            }

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Awards POST error:', error);
        return NextResponse.json({ success: false, error: 'Failed to process awards action' }, { status: 500 });
    }
}
