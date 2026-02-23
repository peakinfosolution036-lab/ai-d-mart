import { NextRequest, NextResponse } from 'next/server';
import { forgotPassword, confirmForgotPassword } from '@/lib/cognito';
import { ApiResponse } from '@/types';

// POST - Forgot password / Reset password
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, code, newPassword } = body;

        if (!email) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Email is required'
            }, { status: 400 });
        }

        const trimmedEmail = email.trim().toLowerCase();

        // If code and newPassword provided, reset password
        if (code && newPassword) {
            if (newPassword.length < 8) {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Password must be at least 8 characters'
                }, { status: 400 });
            }

            const result = await confirmForgotPassword(trimmedEmail, code, newPassword);

            if (!result.success) {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: result.error || 'Failed to reset password'
                }, { status: 400 });
            }

            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    message: 'Password reset successfully. You can now login with your new password.'
                }
            });
        }

        // Otherwise, initiate forgot password flow
        const result = await forgotPassword(trimmedEmail);

        if (!result.success) {
            // Don't reveal if email exists or not for security
            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    message: 'If this email exists, a password reset code has been sent.'
                }
            });
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                message: 'Password reset code has been sent to your email.'
            }
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
