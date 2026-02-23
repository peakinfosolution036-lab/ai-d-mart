import { NextRequest, NextResponse } from 'next/server';
import { generateId, putDataItem, getDataItemsByType, updateDataItem, deleteDataItem, getDataItem } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        // Get single promotion by ID
        if (id) {
            const promo = await getDataItem('promotion', id);
            return NextResponse.json<ApiResponse>({
                success: true,
                data: promo
            });
        }

        // Get all promotions
        const items = await getDataItemsByType('promotion');
        return NextResponse.json<ApiResponse>({
            success: true,
            data: items
        });
    } catch (error: any) {
        return NextResponse.json<ApiResponse>({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            code,
            discount,
            discountType = 'percentage', // 'percentage' or 'fixed'
            title,
            description,
            expiryDate,
            minPurchase = 0,
            maxUsage = 1000,
            maxUsagePerUser = 1,
            applicableCategories = [],
            applicableEvents = []
        } = body;

        if (!code || !discount) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Promo code and discount are required'
            }, { status: 400 });
        }

        const id = generateId('PRM');
        const item = {
            code: code.toUpperCase(),
            discount: parseFloat(discount),
            discountType,
            title: title || `${discount}${discountType === 'percentage' ? '%' : '₹'} OFF`,
            description: description || '',
            expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            minPurchase,
            maxUsage,
            usedCount: 0,
            maxUsagePerUser,
            applicableCategories,
            applicableEvents,
            active: true,
            createdAt: new Date().toISOString()
        };

        const success = await putDataItem('promotion', id, item);
        if (!success) throw new Error('Database write failed');

        return NextResponse.json<ApiResponse>({
            success: true,
            data: { id, ...item }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create promotion error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, active, ...otherUpdates } = body;

        if (!id) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Promotion ID is required'
            }, { status: 400 });
        }

        const updates: Record<string, any> = { ...otherUpdates };
        if (active !== undefined) updates.active = active;

        const success = await updateDataItem('promotion', id, updates);

        if (success) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { message: 'Promotion updated successfully' }
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to update promotion'
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Update promotion error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Promotion ID is required'
            }, { status: 400 });
        }

        const success = await deleteDataItem('promotion', id);

        if (success) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { message: 'Promotion deleted successfully' }
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to delete promotion'
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Delete promotion error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
