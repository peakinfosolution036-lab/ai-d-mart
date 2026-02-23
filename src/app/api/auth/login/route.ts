import { NextRequest, NextResponse } from 'next/server';
import { signIn, getCurrentUser, adminAddUserToGroup } from '@/lib/cognito';
import { getUserByCognitoSub, getUserById } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, role } = body;

        if (!email || !password) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Email and password are required'
            }, { status: 400 });
        }

        // Authenticate with Cognito
        const authResult = await signIn(email, password);

        if (!authResult.success) {
            // Handle specific Cognito errors
            if (authResult.error === 'Please verify your email first') {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Please verify your email first. Check your inbox for the verification code.'
                }, { status: 401 });
            }

            return NextResponse.json<ApiResponse>({
                success: false,
                error: authResult.error || 'Authentication failed'
            }, { status: 401 });
        }

        if (!authResult.accessToken) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Authentication failed'
            }, { status: 401 });
        }

        // Get user info from Cognito
        const userResult = await getCurrentUser(authResult.accessToken);

        if (!userResult.success || !userResult.user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to get user information'
            }, { status: 500 });
        }

        // Get user profile from DynamoDB
        console.log('[Login] Looking up user by Cognito sub:', userResult.user.sub);
        let userProfile = await getUserByCognitoSub(userResult.user.sub);
        console.log('[Login] getUserByCognitoSub result:', userProfile ? 'Found' : 'Not found');

        // If user doesn't exist by Cognito sub, try to find by email (for admin users)
        if (!userProfile) {
            console.log('[Login] Attempting fallback lookup by email:', email);
            const { getUsersByRole } = await import('@/lib/dynamodb');
            const admins = await getUsersByRole('ADMIN');
            console.log('[Login] Found', admins.length, 'admins');
            userProfile = admins.find(admin => admin.email === email) || null;

            // If still not found, check customers
            if (!userProfile) {
                const customers = await getUsersByRole('CUSTOMER');
                console.log('[Login] Found', customers.length, 'customers');
                userProfile = customers.find(customer => customer.email === email) || null;
            }
        }

        // If user still doesn't exist in DynamoDB
        if (!userProfile) {
            console.error('[Login] User profile not found for:', email, 'sub:', userResult.user.sub);
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'User profile not found. Please complete registration.'
            }, { status: 404 });
        }
        console.log('[Login] User profile found:', userProfile.id, userProfile.email);

        // Check if role matches
        if (role && role !== userProfile.role) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: `You are not authorized to login as ${role}`
            }, { status: 403 });
        }

        // Check user status
        if (userProfile.status === 'SUSPENDED') {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Your account has been suspended. Please contact support.'
            }, { status: 403 });
        }

        if (userProfile.status === 'PENDING' && role !== 'ADMIN') {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Your account is pending approval.'
            }, { status: 403 });
        }

        // Create response with tokens in cookies
        const response = NextResponse.json<ApiResponse>({
            success: true,
            data: {
                user: {
                    id: userProfile.id,
                    email: userProfile.email,
                    name: userProfile.name,
                    role: userProfile.role,
                    status: userProfile.status,
                    walletBalance: userProfile.walletBalance || 0,
                    kycVerified: userProfile.kycVerified,
                },
                message: 'Login successful'
            }
        });

        // Set auth cookies
        response.cookies.set('access_token', authResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
            path: '/'
        });

        if (authResult.refreshToken) {
            response.cookies.set('refresh_token', authResult.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60, // 30 days
                path: '/'
            });
        }

        response.cookies.set('user_role', userProfile.role, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60,
            path: '/'
        });

        response.cookies.set('user_id', userProfile.id, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60,
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
