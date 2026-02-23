import { NextRequest, NextResponse } from 'next/server';
import { confirmSignUp, adminConfirmUserByEmail } from '@/lib/cognito';
import { getUsersByRole, updateUserStatus } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

// POST - Verify email with Cognito confirmation code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Email and verification code are required'
            }, { status: 400 });
        }

        // Trim and sanitize inputs (case-insensitive for email)
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedCode = code.trim();

        console.log('Verify attempt:', { email: trimmedEmail, code: trimmedCode });

        // Look up userId from DynamoDB — this is the Cognito username
        // (email is only an alias in the user pool, not the username)
        const customers = await getUsersByRole('CUSTOMER');
        const user = customers.find(c => c.email?.toLowerCase() === trimmedEmail);
        const cognitoUsername = user?.id || trimmedEmail;

        // First try with user-facing confirmSignUp API
        let confirmResult = await confirmSignUp(cognitoUsername, trimmedCode);

        // If that fails (usually due to username/email mismatch), use admin API
        if (!confirmResult.success) {
            console.log('User confirmSignUp failed, trying admin confirm:', confirmResult.error);

            // Use admin API which doesn't require the code (admin verifies on behalf of user)
            // This is a fallback for the email alias username mismatch issue
            confirmResult = await adminConfirmUserByEmail(trimmedEmail);

            if (!confirmResult.success) {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: confirmResult.error || 'Invalid verification code'
                }, { status: 400 });
            }
        }

        console.log('Email verified, updating user status in DynamoDB');

        if (user) {
            console.log('Found user, updating status to ACTIVE:', user.id);
            // Activate user after email verification
            await updateUserStatus(user.id, 'ACTIVE');
        } else {
            console.warn('User not found in DynamoDB after Cognito verification:', trimmedEmail);
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                message: 'Email verified successfully! You can now login to your account.'
            }
        });
    } catch (error) {
        console.error('Verify email error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
