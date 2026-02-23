import { NextRequest, NextResponse } from 'next/server';
import { cart } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }

        const userCart = await cart.getByUserId(userId);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: userCart?.items || []
        });
    } catch (error) {
        console.error('Get cart error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch cart'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, items } = body;

        if (!userId || !Array.isArray(items)) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'User ID and items array are required'
            }, { status: 400 });
        }

        const success = await cart.update(userId, items);

        if (success) {
            return NextResponse.json<ApiResponse>({
                success: true,
                message: 'Cart updated successfully'
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to update cart'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Update cart error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }

        const success = await cart.clear(userId);

        if (success) {
            return NextResponse.json<ApiResponse>({
                success: true,
                message: 'Cart cleared successfully'
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to clear cart'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Clear cart error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
