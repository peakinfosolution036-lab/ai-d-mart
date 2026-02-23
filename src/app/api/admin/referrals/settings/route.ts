import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

const TABLE_NAME = 'ai-d-mart-data';
const SETTINGS_KEY = { PK: 'CONFIG', SK: 'REFERRAL_SETTINGS' };

const DEFAULT_SETTINGS = {
    pointsPerReferral: 25,
    approvalMode: 'manual', // 'auto' | 'manual'
    systemEnabled: true,
    primeOnly: false, // restrict enhanced income to Prime members
    primeCommission: 500, // ₹500 referral income for Prime
    primeCommissionPercent: 25,
    pointsToWalletRate: 100, // 100 points = ₹1
    // Prime Membership distribution config
    primePrice: 2000,
    primeOriginalPrice: 5000,
    distribution: {
        referralIncome: { amount: 500, percent: 25 },
        shoppingWallet: { amount: 100, percent: 5 },
        eventPool: { amount: 140, percent: 7 },
        awardsRewards: { amount: 300, percent: 15 },
        platformCharge: { amount: 100, percent: 5 },
        companyProfit: { amount: 500, percent: 25 },
        gst: { amount: 360, percent: 18 },
    },
};

// GET - Fetch referral settings
export async function GET() {
    try {
        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: SETTINGS_KEY
        }));

        const settings = result.Item
            ? { ...DEFAULT_SETTINGS, ...result.Item.settings }
            : DEFAULT_SETTINGS;

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching referral settings:', error);
        return NextResponse.json({ success: true, data: DEFAULT_SETTINGS });
    }
}

// POST - Save referral settings (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            pointsPerReferral,
            approvalMode,
            systemEnabled,
            primeOnly,
            primeCommission,
            primeCommissionPercent,
            pointsToWalletRate,
            primePrice,
            primeOriginalPrice,
            distribution,
        } = body;

        const settings = {
            pointsPerReferral: pointsPerReferral ?? DEFAULT_SETTINGS.pointsPerReferral,
            approvalMode: approvalMode ?? DEFAULT_SETTINGS.approvalMode,
            systemEnabled: systemEnabled ?? DEFAULT_SETTINGS.systemEnabled,
            primeOnly: primeOnly ?? DEFAULT_SETTINGS.primeOnly,
            primeCommission: primeCommission ?? DEFAULT_SETTINGS.primeCommission,
            primeCommissionPercent: primeCommissionPercent ?? DEFAULT_SETTINGS.primeCommissionPercent,
            pointsToWalletRate: pointsToWalletRate ?? DEFAULT_SETTINGS.pointsToWalletRate,
            primePrice: primePrice ?? DEFAULT_SETTINGS.primePrice,
            primeOriginalPrice: primeOriginalPrice ?? DEFAULT_SETTINGS.primeOriginalPrice,
            distribution: distribution ?? DEFAULT_SETTINGS.distribution,
        };

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                ...SETTINGS_KEY,
                settings,
                updatedAt: new Date().toISOString(),
            }
        }));

        return NextResponse.json({ success: true, message: 'Settings saved', data: settings });
    } catch (error) {
        console.error('Error saving referral settings:', error);
        return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
    }
}
