import { NextRequest, NextResponse } from 'next/server';
import { getDataItemsByType, getDataItem, updateDataItem } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

// GET - Get active promotions or validate a promo code
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const eventId = searchParams.get('eventId');
        const category = searchParams.get('category');

        // Validate a specific promo code
        if (code) {
            const allPromos = await getDataItemsByType('promotion');
            const promo = allPromos.find((p: any) =>
                p.code?.toUpperCase() === code.toUpperCase() &&
                p.active
            );

            if (!promo) {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Invalid promo code'
                }, { status: 404 });
            }

            // Check expiry
            if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Promo code has expired'
                }, { status: 400 });
            }

            // Check usage limit
            if (promo.maxUsage && (promo.usedCount || 0) >= promo.maxUsage) {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Promo code usage limit reached'
                }, { status: 400 });
            }

            // Check event applicability
            if (eventId && promo.applicableEvents?.length > 0) {
                if (!promo.applicableEvents.includes(eventId)) {
                    return NextResponse.json<ApiResponse>({
                        success: false,
                        error: 'This promo code is not applicable for this event'
                    }, { status: 400 });
                }
            }

            // Check category applicability
            if (category && promo.applicableCategories?.length > 0) {
                if (!promo.applicableCategories.includes(category)) {
                    return NextResponse.json<ApiResponse>({
                        success: false,
                        error: 'This promo code is not applicable for this category'
                    }, { status: 400 });
                }
            }

            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    id: promo.id,
                    code: promo.code,
                    discount: promo.discount,
                    discountType: promo.discountType || 'percentage',
                    title: promo.title,
                    description: promo.description,
                    minPurchase: promo.minPurchase || 0,
                    expiryDate: promo.expiryDate
                }
            });
        }

        // Get all active promotions
        const allPromos = await getDataItemsByType('promotion');
        const now = new Date();

        let activePromos = allPromos.filter((p: any) => {
            if (!p.active) return false;
            if (p.expiryDate && new Date(p.expiryDate) < now) return false;
            if (p.maxUsage && (p.usedCount || 0) >= p.maxUsage) return false;
            return true;
        });

        // Filter by event if specified
        if (eventId) {
            activePromos = activePromos.filter((p: any) =>
                !p.applicableEvents?.length || p.applicableEvents.includes(eventId)
            );
        }

        // Filter by category if specified
        if (category) {
            activePromos = activePromos.filter((p: any) =>
                !p.applicableCategories?.length || p.applicableCategories.includes(category)
            );
        }

        // Return public promo info only
        const publicPromos = activePromos.map((p: any) => ({
            id: p.id,
            code: p.code,
            discount: p.discount,
            discountType: p.discountType || 'percentage',
            title: p.title,
            description: p.description,
            minPurchase: p.minPurchase || 0,
            expiryDate: p.expiryDate
        }));

        return NextResponse.json<ApiResponse>({
            success: true,
            data: publicPromos
        });
    } catch (error) {
        console.error('Get promotions error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch promotions'
        }, { status: 500 });
    }
}

// POST - Apply a promo code (increment usage counter)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, userId, orderId, amount } = body;

        if (!code || !userId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Promo code and user ID are required'
            }, { status: 400 });
        }

        // Find the promo
        const allPromos = await getDataItemsByType('promotion');
        const promo = allPromos.find((p: any) =>
            p.code?.toUpperCase() === code.toUpperCase() &&
            p.active
        );

        if (!promo) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Invalid promo code'
            }, { status: 404 });
        }

        // Validate again
        if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Promo code has expired'
            }, { status: 400 });
        }

        if (promo.maxUsage && (promo.usedCount || 0) >= promo.maxUsage) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Promo code usage limit reached'
            }, { status: 400 });
        }

        // Check minimum purchase
        if (amount && promo.minPurchase && amount < promo.minPurchase) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: `Minimum purchase of ₹${promo.minPurchase} required`
            }, { status: 400 });
        }

        // Calculate discount
        let discountAmount = 0;
        if (promo.discountType === 'fixed') {
            discountAmount = promo.discount;
        } else {
            discountAmount = amount ? (amount * promo.discount / 100) : 0;
        }

        // Increment usage counter
        await updateDataItem('promotion', promo.id, {
            usedCount: (promo.usedCount || 0) + 1
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                promoId: promo.id,
                code: promo.code,
                discountAmount,
                discountType: promo.discountType || 'percentage',
                discountValue: promo.discount
            }
        });
    } catch (error) {
        console.error('Apply promo error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to apply promo code'
        }, { status: 500 });
    }
}
