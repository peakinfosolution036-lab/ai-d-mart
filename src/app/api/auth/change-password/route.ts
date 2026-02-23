import { NextRequest, NextResponse } from 'next/server';
import { changePassword } from '@/lib/cognito';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        // Get access token from cookie
        const accessToken = request.cookies.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Current and new passwords are required'
            }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Password must be at least 8 characters'
            }, { status: 400 });
        }

        // Change password in Cognito
        const result = await changePassword(accessToken, currentPassword, newPassword);

        if (!result.success) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: result.error || 'Failed to change password'
            }, { status: 400 });
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: { message: 'Password changed successfully' }
        });
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
