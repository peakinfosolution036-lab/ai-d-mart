import { NextRequest, NextResponse } from 'next/server';
import { offers, generateId } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Business ID is required'
            }, { status: 400 });
        }

        const allOffers = await offers.getAll();
        const businessOffers = allOffers.filter((o: any) => o.businessId === businessId);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: businessOffers
        });
    } catch (error) {
        console.error('Get business offers error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch offers'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { businessId, businessName, code, discount, title, description, validFrom, validUntil, minOrderValue, city } = body;

        if (!businessId || !code || !discount || !title) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        const offerId = generateId('off');
        const offerData = {
            businessId,
            businessName,
            code: code.toUpperCase(),
            discount,
            title,
            description,
            status: 'pending',
            city,
            color: 'bg-indigo-500',
            validFrom: validFrom || new Date().toISOString(),
            validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            usedCount: 0,
            minOrderValue: minOrderValue || 0,
            createdAt: new Date().toISOString()
        };

        const created = await offers.create(offerId, offerData);

        if (created) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { id: offerId, ...offerData }
            }, { status: 201 });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to create offer'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Create business offer error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
