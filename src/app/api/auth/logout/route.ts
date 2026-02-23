import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/cognito';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        // Get access token from cookie
        const accessToken = request.cookies.get('access_token')?.value;

        // Sign out from Cognito if we have a token
        if (accessToken) {
            try {
                await signOut(accessToken);
            } catch (error) {
                // Ignore signout errors, still clear cookies
                console.log('Cognito signout error (ignored):', error);
            }
        }

        // Clear all auth cookies
        const response = NextResponse.json<ApiResponse>({
            success: true,
            message: 'Logged out successfully'
        });

        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        response.cookies.delete('user_role');
        response.cookies.delete('user_id');

        return response;
    } catch (error) {
        console.error('Logout error:', error);

        // Still clear cookies even on error
        const response = NextResponse.json<ApiResponse>({
            success: true,
            message: 'Logged out'
        });

        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        response.cookies.delete('user_role');
        response.cookies.delete('user_id');

        return response;
    }
}
