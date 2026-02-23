import { NextRequest, NextResponse } from 'next/server';
import { resendConfirmationCode } from '@/lib/cognito';
import { getUsersByRole } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

// POST - Resend verification code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Email is required'
            }, { status: 400 });
        }

        // Trim and sanitize email (case-insensitive)
        const trimmedEmail = email.trim().toLowerCase();

        console.log('Resend verification code attempt:', trimmedEmail);

        // Look up the userId from DynamoDB — this is the Cognito username
        // (email is only an alias in the user pool, not the username)
        const customers = await getUsersByRole('CUSTOMER');
        const user = customers.find(c => c.email?.toLowerCase() === trimmedEmail);
        const cognitoUsername = user?.id || trimmedEmail;

        // Resend confirmation code via Cognito
        const result = await resendConfirmationCode(cognitoUsername);

        if (!result.success) {
            // Check for specific errors
            if (result.error?.includes('already confirmed') || result.error?.includes('CONFIRMED')) {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Email is already verified. Please login.'
                }, { status: 400 });
            }

            return NextResponse.json<ApiResponse>({
                success: false,
                error: result.error || 'Failed to resend verification code'
            }, { status: 400 });
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                message: 'Verification code sent! Please check your email.'
            }
        });
    } catch (error: any) {
        console.error('Resend verification code error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
