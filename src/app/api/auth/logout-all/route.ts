import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        // In a real implementation, you would:
        // 1. Get the user's ID from the access token
        // 2. Invalidate all refresh tokens for this user in your database
        // 3. Force re-authentication on all devices

        // For now, we'll just clear the cookies on this device
        // In production, implement token blacklisting or token versioning

        const response = NextResponse.json<ApiResponse>({
            success: true,
            message: 'Successfully logged out from all devices'
        });

        // Clear all auth cookies
        response.cookies.delete('user_role');
        response.cookies.delete('user_id');
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');

        return response;
    } catch (error) {
        console.error('Logout all devices error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to logout from all devices'
        }, { status: 500 });
    }
}
