import { NextRequest, NextResponse } from 'next/server';
import { signUp, adminAddUserToGroup } from '@/lib/cognito';
import { putUserProfile, generateUserId, type UserProfile } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';
import { REGISTRATION_FEE } from '@/constants';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            fullName,
            email,
            password,
            phone,
            mobile,
            dob,
            address,
            pinCode,
            inviteCode,
            aadhaarPan,
            selfieImage,
            location,
            utrNumber,
            paymentScreenshot,
        } = body;

        const userPhone = phone || mobile;

        // Validate required fields
        if (!fullName || !email || !password) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Name, email, and password are required'
            }, { status: 400 });
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Password must be at least 8 characters'
            }, { status: 400 });
        }

        // Format phone number for Cognito (must include country code)
        const formattedPhone = userPhone ? (userPhone.startsWith('+') ? userPhone : `+91${userPhone}`) : undefined;

        // Generate user ID first so it can be used as the Cognito username.
        // This avoids the "username cannot be email format" error when the user
        // pool is configured with email as an alias.
        const userId = generateUserId('CUSTOMER');

        // Sign up with Cognito
        const signUpResult = await signUp(
            email,
            password,
            fullName,
            formattedPhone,
            'CUSTOMER',
            userId
        );

        if (!signUpResult.success) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: signUpResult.error || 'Registration failed'
            }, { status: 400 });
        }

        // Create user profile in DynamoDB
        const userProfile: UserProfile = {
            id: userId,
            cognitoSub: signUpResult.user?.userSub || '',
            email,
            name: fullName,
            phone: formattedPhone,
            mobile: formattedPhone,
            role: 'CUSTOMER',
            status: 'PENDING', // Requires email verification and admin approval
            walletBalance: REGISTRATION_FEE.breakdown.regFee,
            kycVerified: false,
            address,
            pinCode,
            dob,
            aadhaarPan,
            selfieImage,
            location,
            utrNumber,
            paymentScreenshot,
            bankAccountNumber: body.bankAccountNumber,
            ifscCode: body.ifscCode,
            branchName: body.branchName,
            referredBy: inviteCode,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        console.log('[Register] Attempting to save user profile:', userId);
        const saved = await putUserProfile(userProfile);

        if (!saved) {
            console.error('[Register] Failed to save user profile to DynamoDB');
            // If DynamoDB save fails, we should also clean up the Cognito user
            // but for now, just return the error
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to create user profile. Please check server logs or contact support.'
            }, { status: 500 });
        }
        console.log('[Register] User profile saved successfully');

        // Add user to customers group
        await adminAddUserToGroup(email, 'customers');

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                userId,
                email,
                dob: userProfile.dob,
                aadhaarPan: userProfile.aadhaarPan,
                createdAt: userProfile.createdAt,
                message: 'Registration successful! Please check your email for verification code.',
                requiresVerification: !signUpResult.user?.confirmed
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle Cognito-specific errors
        if (error.name === 'UsernameExistsException') {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'An account with this email already exists'
            }, { status: 409 });
        }

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
