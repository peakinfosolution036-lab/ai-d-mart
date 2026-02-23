import { NextRequest, NextResponse } from 'next/server';
import { offers, generateId, events } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET() {
    try {
        const allOffers = await offers.getAll();
        return NextResponse.json<ApiResponse>({
            success: true,
            data: allOffers
        });
    } catch (error) {
        console.error('Get offers error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch offers'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            code,
            discount,
            discountType = 'percentage', // 'percentage' or 'fixed'
            title,
            description,
            validFrom,
            validUntil,
            minOrderValue,
            usageLimit,
            eventId,
            eventTitle,
            isEnabled = true,
            applicableCategories = [],
            color
        } = body;

        if (!code || !discount || !title) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Code, discount, and title are required'
            }, { status: 400 });
        }

        const offerId = generateId('off');
        const offerData = {
            code: code.toUpperCase(),
            discount,
            discountType,
            title,
            description: description || '',
            color: color || 'bg-gradient-to-r from-blue-500 to-indigo-600',
            validFrom: validFrom || new Date().toISOString(),
            validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            usageLimit: usageLimit || 1000,
            usedCount: 0,
            minOrderValue: minOrderValue || 0,
            applicableCategories,
            eventId: eventId || null,
            eventTitle: eventTitle || null,
            isEnabled,
            status: 'active',
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
        console.error('Create offer error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status, isEnabled, ...otherUpdates } = body;

        if (!id) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Offer ID is required'
            }, { status: 400 });
        }

        const updates: Record<string, any> = { ...otherUpdates };
        if (status !== undefined) updates.status = status;
        if (isEnabled !== undefined) updates.isEnabled = isEnabled;

        const updated = await offers.update(id, updates);

        if (updated) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { message: 'Offer updated successfully' }
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to update offer'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Update offer error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const offerId = searchParams.get('id');

        if (!offerId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Offer ID is required'
            }, { status: 400 });
        }

        const deleted = await offers.delete(offerId);

        if (deleted) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { message: 'Offer deleted successfully' }
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to delete offer'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Delete offer error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}