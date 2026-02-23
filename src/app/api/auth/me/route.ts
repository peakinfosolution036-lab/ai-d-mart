import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/cognito';
import { getUserById, getUserByCognitoSub } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Get access token from cookie
        const accessToken = request.cookies.get('access_token')?.value;
        const userId = request.cookies.get('user_id')?.value;

        if (!accessToken) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'No session found'
            }, { status: 401 });
        }

        // Validate token with Cognito
        const cognitoResult = await getCurrentUser(accessToken);

        if (!cognitoResult.success || !cognitoResult.user) {
            // Token is invalid, clear cookies
            const response = NextResponse.json<ApiResponse>({
                success: false,
                error: 'Invalid session'
            }, { status: 401 });

            response.cookies.delete('access_token');
            response.cookies.delete('refresh_token');
            response.cookies.delete('user_id');
            response.cookies.delete('user_role');

            return response;
        }

        // Get user profile from DynamoDB
        let userProfile = null;

        // Try by user ID first (faster)
        if (userId) {
            userProfile = await getUserById(userId);
        }

        // Fallback to Cognito sub
        if (!userProfile && cognitoResult.user.sub) {
            userProfile = await getUserByCognitoSub(cognitoResult.user.sub);
        }

        if (!userProfile) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'User profile not found'
            }, { status: 404 });
        }

        // Return user data
        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                user: {
                    ...userProfile,
                    fullName: userProfile.name,
                    mobile: userProfile.mobile || userProfile.phone,
                },
                cognitoUser: {
                    email: cognitoResult.user.email,
                    emailVerified: cognitoResult.user.emailVerified,
                }
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
