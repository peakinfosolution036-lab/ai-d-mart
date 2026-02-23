import { NextRequest, NextResponse } from 'next/server';
import { getUserById, putUserProfile } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function PATCH(request: NextRequest) {
    try {
        const userId = request.cookies.get('user_id')?.value;
        if (!userId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const body = await request.json();
        const user = await getUserById(userId);

        if (!user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }

        // Update fields
        const updatedProfile = {
            ...user,
            ...body,
            name: body.fullName || body.name || user.name,
            phone: body.mobile || body.phone || user.phone,
            updatedAt: new Date().toISOString()
        };

        const success = await putUserProfile(updatedProfile);

        if (!success) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to update profile'
            }, { status: 500 });
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                user: {
                    ...updatedProfile,
                    fullName: updatedProfile.name, // Ensure frontend gets fullName
                }
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
