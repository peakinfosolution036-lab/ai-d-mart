import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Prime Membership Configuration
const PRIME_CONFIG = {
    originalPrice: 5000,
    discountPrice: 2000,
    gstRate: 0.18,
    distribution: {
        referralIncome: 500, // 25%
        shoppingCashback: 100, // 5%
        eventCommission: 140, // 7%
        awardsRewards: 300, // 15%
        platformCharges: 100, // 5%
        companyProfit: 500, // 25%
        gst: 360 // 18%
    }
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, referralCode, paymentMethod = 'wallet' } = body;

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }

        // Check if user is already a Prime member
        const existingMembership = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-prime-memberships',
            Key: {
                PK: `USER#${userId}`,
                SK: 'MEMBERSHIP'
            }
        }));

        if (existingMembership.Item && existingMembership.Item.status === 'ACTIVE') {
            return NextResponse.json({
                success: false,
                error: 'User is already a Prime member'
            }, { status: 400 });
        }

        const membershipId = uuidv4();
        const primeCode = `PRIME${Date.now().toString().slice(-6)}`;
        const timestamp = new Date().toISOString();

        // Create Prime Membership record
        const membership = {
            PK: `USER#${userId}`,
            SK: 'MEMBERSHIP',
            id: membershipId,
            userId,
            primeCode,
            status: 'ACTIVE',
            type: 'LIFETIME',
            originalPrice: PRIME_CONFIG.originalPrice,
            paidPrice: PRIME_CONFIG.discountPrice,
            paymentMethod,
            referralCode: referralCode || null,
            purchaseDate: timestamp,
            activationDate: timestamp,
            benefits: {
                referralIncome: true,
                shoppingCashback: true,
                eventCommission: true,
                luckyDraw: true,
                awardsRewards: true,
                exclusiveOffers: true,
                megaEventPass: true
            },
            GSI1PK: 'PRIME#ACTIVE',
            GSI1SK: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-prime-memberships',
            Item: membership
        }));

        // Initialize user wallets
        const wallets = [
            {
                PK: `USER#${userId}`,
                SK: 'WALLET#REFERRAL',
                walletType: 'REFERRAL',
                balance: 0,
                totalEarned: 0,
                totalWithdrawn: 0,
                status: 'ACTIVE',
                GSI1PK: 'WALLET#REFERRAL',
                GSI1SK: `USER#${userId}`,
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                PK: `USER#${userId}`,
                SK: 'WALLET#SHOPPING',
                walletType: 'SHOPPING',
                balance: 0,
                totalEarned: 0,
                totalSpent: 0,
                status: 'ACTIVE',
                GSI1PK: 'WALLET#SHOPPING',
                GSI1SK: `USER#${userId}`,
                createdAt: timestamp,
                updatedAt: timestamp
            },
            {
                PK: `USER#${userId}`,
                SK: 'WALLET#EVENT',
                walletType: 'EVENT',
                balance: 0,
                totalEarned: 0,
                totalWithdrawn: 0,
                status: 'ACTIVE',
                GSI1PK: 'WALLET#EVENT',
                GSI1SK: `USER#${userId}`,
                createdAt: timestamp,
                updatedAt: timestamp
            }
        ];

        for (const wallet of wallets) {
            await docClient.send(new PutCommand({
                TableName: 'ai-d-mart-wallets',
                Item: wallet
            }));
        }

        // Save mapping for the new primeCode
        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-data',
            Item: {
                PK: `CODE#${primeCode}`,
                SK: 'MAPPING',
                userId,
                type: 'PRIME'
            }
        }));

        // Process referral if referral code provided
        if (referralCode) {
            await processReferralReward(referralCode, userId, membershipId);
        }

        // Log payment distribution
        await logPaymentDistribution(membershipId, userId, PRIME_CONFIG.discountPrice);

        // Update user status in main users table
        await docClient.send(new UpdateCommand({
            TableName: 'ai-d-mart-users',
            Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
            UpdateExpression: 'SET isPrimeMember = :prime, primeCode = :code, primeMembershipDate = :date, updatedAt = :updated',
            ExpressionAttributeValues: {
                ':prime': true,
                ':code': primeCode,
                ':date': timestamp,
                ':updated': timestamp
            }
        }));

        return NextResponse.json({
            success: true,
            data: {
                membershipId,
                primeCode,
                status: 'ACTIVE',
                benefits: membership.benefits,
                wallets: wallets.map(w => ({ type: w.walletType, balance: w.balance }))
            }
        });

    } catch (error) {
        console.error('Prime membership purchase error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process Prime membership purchase'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }

        // Get membership details
        const membership = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-prime-memberships',
            Key: {
                PK: `USER#${userId}`,
                SK: 'MEMBERSHIP'
            }
        }));

        if (!membership.Item) {
            return NextResponse.json({
                success: true,
                data: {
                    isPrimeMember: false,
                    membership: null,
                    wallets: null
                }
            });
        }

        // Get wallet balances
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
                wallets[type.toLowerCase()] = {
                    balance: wallet.Item.balance || 0,
                    totalEarned: wallet.Item.totalEarned || 0,
                    totalWithdrawn: wallet.Item.totalWithdrawn || 0,
                    totalSpent: wallet.Item.totalSpent || 0
                };
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                isPrimeMember: true,
                membership: membership.Item,
                wallets
            }
        });

    } catch (error) {
        console.error('Get Prime membership error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch Prime membership details'
        }, { status: 500 });
    }
}

async function processReferralReward(referralCode: string, newUserId: string, membershipId: string) {
    try {
        // Find the referrer by mapping
        const mapRes = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-data',
            Key: { PK: `CODE#${referralCode}`, SK: 'MAPPING' }
        }));

        if (mapRes.Item && mapRes.Item.userId) {
            const referrerId = mapRes.Item.userId;
            const timestamp = new Date().toISOString();

            // Check if referrer is a Prime member
            const primeCheck = await docClient.send(new GetCommand({
                TableName: 'ai-d-mart-prime-memberships',
                Key: { PK: `USER#${referrerId}`, SK: 'MEMBERSHIP' }
            }));

            if (!primeCheck.Item || primeCheck.Item.status !== 'ACTIVE') {
                console.log(`Referrer ${referrerId} is not a prime member. No ₹500 commission awarded.`);
                return;
            }

            // Create referral record
            const referralRecord = {
                PK: `USER#${referrerId}`,
                SK: `REFERRAL#${newUserId}`,
                referrerId,
                referredUserId: newUserId,
                referralCode,
                membershipId,
                rewardAmount: PRIME_CONFIG.distribution.referralIncome,
                status: 'COMPLETED',
                GSI1PK: 'REFERRAL#COMPLETED',
                GSI1SK: timestamp,
                createdAt: timestamp
            };

            await docClient.send(new PutCommand({
                TableName: 'ai-d-mart-referrals',
                Item: referralRecord
            }));

            // Update referrer's wallet
            await docClient.send(new UpdateCommand({
                TableName: 'ai-d-mart-wallets',
                Key: {
                    PK: `USER#${referrerId}`,
                    SK: 'WALLET#REFERRAL'
                },
                UpdateExpression: 'ADD balance :amount, totalEarned :amount SET updatedAt = :updated',
                ExpressionAttributeValues: {
                    ':amount': PRIME_CONFIG.distribution.referralIncome,
                    ':updated': timestamp
                }
            }));
        }
    } catch (error) {
        console.error('Error processing referral reward:', error);
    }
}

async function logPaymentDistribution(membershipId: string, userId: string, amount: number) {
    try {
        const timestamp = new Date().toISOString();

        const distributionLog = {
            PK: `MEMBERSHIP#${membershipId}`,
            SK: 'DISTRIBUTION',
            membershipId,
            userId,
            totalAmount: amount,
            distribution: PRIME_CONFIG.distribution,
            timestamp,
            GSI1PK: 'DISTRIBUTION#LOG',
            GSI1SK: timestamp
        };

        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-prime-memberships',
            Item: distributionLog
        }));
    } catch (error) {
        console.error('Error logging payment distribution:', error);
    }
}