import { NextRequest, NextResponse } from 'next/server';
import { adminSetUserPassword, adminUpdateUserAttributes } from '@/lib/cognito';
import { getUserById, updateUserRole, updateUserStatus } from '@/lib/dynamodb';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.success) {
        return NextResponse.json<ApiResponse>({ success: false, error: authResult.error }, { status: authResult.status });
    }

    try {
        const body = await request.json();
        const { action, userId, data } = body;

        const targetUser = await getUserById(userId);
        if (!targetUser) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'User not found' }, { status: 404 });
        }

        switch (action) {
            case 'RESET_PASSWORD': {
                const { newPassword } = data;
                if (!newPassword) return NextResponse.json({ success: false, error: 'New password required' }, { status: 400 });

                if (!targetUser.email) {
                    return NextResponse.json({ success: false, error: 'User has no email' }, { status: 400 });
                }

                try {
                    // Use Cognito admin function to reset password
                    const result = await adminSetUserPassword(targetUser.email, newPassword, true);
                    if (!result.success) {
                        return NextResponse.json({ success: false, error: result.error || 'Failed to reset password' }, { status: 500 });
                    }
                    return NextResponse.json({ success: true, message: 'Password reset successfully' });
                } catch (error: any) {
                    return NextResponse.json({ success: false, error: error.message || 'Failed to reset password' }, { status: 500 });
                }
            }

            case 'ASSIGN_ROLE': {
                const { role } = data;
                if (!['ADMIN', 'CUSTOMER'].includes(role)) return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });

                // Update DynamoDB
                await updateUserRole(userId, role);

                // Update Cognito attributes with role (optional, for reference)
                if (targetUser.email) {
                    try {
                        await adminUpdateUserAttributes(targetUser.email, [
                            { Name: 'custom:role', Value: role },
                            { Name: 'custom:userId', Value: userId }
                        ]);
                    } catch (error) {
                        console.error('Failed to update Cognito attributes:', error);
                        // Continue anyway - DynamoDB is updated
                    }
                }

                return NextResponse.json({ success: true, message: `Role assigned as ${role}` });
            }

            case 'SUSPEND_USER': {
                await updateUserStatus(userId, 'SUSPENDED');
                return NextResponse.json({ success: true, message: 'User suspended' });
            }

            case 'VERIFY_BUSINESS': {
                // Assuming business verification means setting status to ACTIVE or a specialized flag
                await updateUserStatus(userId, 'ACTIVE');
                // We could add a businessVerified flag in future
                return NextResponse.json({ success: true, message: 'Business profile verified' });
            }

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Admin Master Action error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Operation failed' }, { status: 500 });
    }
}
