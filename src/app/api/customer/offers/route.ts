import { NextRequest, NextResponse } from 'next/server';
import { offers } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        const eventId = searchParams.get('eventId');
        const category = searchParams.get('category');

        const allOffers = await offers.getAll();
        const now = new Date();

        // Filter active and enabled offers
        let filteredOffers = allOffers.filter((off: any) => {
            // Must be active and enabled
            if (off.status !== 'active' && off.status !== undefined) return false;
            if (off.isEnabled === false) return false;

            // Check validity dates
            if (off.validFrom && new Date(off.validFrom) > now) return false;
            if (off.validUntil && new Date(off.validUntil) < now) return false;

            // Check usage limit
            if (off.usageLimit && (off.usedCount || 0) >= off.usageLimit) return false;

            return true;
        });

        // Filter by city if provided
        if (city) {
            filteredOffers = filteredOffers.filter((off: any) =>
                !off.city || off.city.toLowerCase() === city.toLowerCase()
            );
        }

        // Filter by event if provided
        if (eventId) {
            filteredOffers = filteredOffers.filter((off: any) =>
                !off.eventId || off.eventId === eventId
            );
        }

        // Filter by category if provided
        if (category) {
            filteredOffers = filteredOffers.filter((off: any) =>
                !off.applicableCategories?.length || off.applicableCategories.includes(category)
            );
        }

        // Return public offer info
        const publicOffers = filteredOffers.map((off: any) => ({
            id: off.id,
            code: off.code,
            discount: off.discount,
            discountType: off.discountType || 'percentage',
            title: off.title,
            description: off.description,
            color: off.color || 'bg-gradient-to-r from-blue-500 to-indigo-600',
            validUntil: off.validUntil,
            minOrderValue: off.minOrderValue || 0,
            eventId: off.eventId,
            eventTitle: off.eventTitle
        }));

        return NextResponse.json<ApiResponse>({
            success: true,
            data: publicOffers
        });
    } catch (error) {
        console.error('Get customer offers error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch offers'
        }, { status: 500 });
    }
}

// POST - Validate and apply an offer code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, amount, eventId } = body;

        if (!code) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Offer code is required'
            }, { status: 400 });
        }

        const allOffers = await offers.getAll();
        const offer = allOffers.find((off: any) =>
            off.code?.toUpperCase() === code.toUpperCase() &&
            (off.status === 'active' || off.status === undefined) &&
            off.isEnabled !== false
        );

        if (!offer) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Invalid offer code'
            }, { status: 404 });
        }

        const now = new Date();

        // Check validity
        if (offer.validFrom && new Date(offer.validFrom) > now) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Offer is not yet valid'
            }, { status: 400 });
        }

        if (offer.validUntil && new Date(offer.validUntil) < now) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Offer has expired'
            }, { status: 400 });
        }

        // Check usage limit
        if (offer.usageLimit && (offer.usedCount || 0) >= offer.usageLimit) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Offer usage limit reached'
            }, { status: 400 });
        }

        // Check event applicability
        if (offer.eventId && eventId && offer.eventId !== eventId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'This offer is not applicable for this event'
            }, { status: 400 });
        }

        // Check minimum order value
        if (amount && offer.minOrderValue && amount < offer.minOrderValue) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: `Minimum order value of ₹${offer.minOrderValue} required`
            }, { status: 400 });
        }

        // Calculate discount
        let discountAmount = 0;
        if (offer.discountType === 'fixed') {
            discountAmount = parseFloat(offer.discount);
        } else {
            // Percentage discount
            const discountPercent = parseFloat(offer.discount);
            discountAmount = amount ? (amount * discountPercent / 100) : 0;
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                offerId: offer.id,
                code: offer.code,
                title: offer.title,
                discountAmount,
                discountType: offer.discountType || 'percentage',
                discountValue: offer.discount
            }
        });
    } catch (error) {
        console.error('Apply offer error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to apply offer'
        }, { status: 500 });
    }
}

