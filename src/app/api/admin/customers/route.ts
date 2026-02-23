import { NextRequest, NextResponse } from 'next/server';
import { adminDisableUser, adminEnableUser, adminDeleteUser } from '@/lib/cognito';
import { getUsersByRole, updateUserStatus, getUserById, deleteUser } from '@/lib/dynamodb';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { ApiResponse } from '@/types';

// GET all customers
export async function GET(request: NextRequest) {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.success) {
        return NextResponse.json<ApiResponse>({
            success: false,
            error: authResult.error
        }, { status: authResult.status });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Get customers from DynamoDB
        let customers = await getUsersByRole('CUSTOMER', status || undefined);

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            customers = customers.filter(c =>
                c.name?.toLowerCase().includes(searchLower) ||
                c.email?.toLowerCase().includes(searchLower) ||
                c.phone?.includes(search) ||
                c.id?.toLowerCase().includes(searchLower)
            );
        }

        // Sort by createdAt desc
        customers.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Pagination
        const total = customers.length;
        const startIndex = (page - 1) * limit;
        const paginatedCustomers = customers.slice(startIndex, startIndex + limit);

        // Map to safe response format
        const safeCustomers = paginatedCustomers.map(c => ({
            id: c.id,
            email: c.email,
            name: c.name,
            phone: c.phone,
            status: c.status,
            kycVerified: c.kycVerified,
            walletBalance: c.walletBalance,
            createdAt: c.createdAt,
            address: c.address,
            dob: c.dob,
            referredBy: c.referredBy,
            utrNumber: c.utrNumber,
            paymentScreenshot: c.paymentScreenshot,
        }));

        return NextResponse.json<ApiResponse>({
            success: true,
            data: safeCustomers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get customers error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch customers'
        }, { status: 500 });
    }
}

// PATCH - Update customer status
export async function PATCH(request: NextRequest) {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.success) {
        return NextResponse.json<ApiResponse>({
            success: false,
            error: authResult.error
        }, { status: authResult.status });
    }

    try {
        const body = await request.json();
        const { customerId, status } = body;

        if (!customerId || !status) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Customer ID and status are required'
            }, { status: 400 });
        }

        // Validate status
        const validStatuses = ['ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Invalid status'
            }, { status: 400 });
        }

        // Get customer to get their email
        const customer = await getUserById(customerId);
        if (!customer) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Customer not found'
            }, { status: 404 });
        }

        // Update status in DynamoDB
        const updated = await updateUserStatus(customerId, status);
        if (!updated) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to update status'
            }, { status: 500 });
        }

        // Also update Cognito user status if suspending/enabling
        if (customer.email) {
            try {
                if (status === 'SUSPENDED') {
                    await adminDisableUser(customer.email);
                } else if (status === 'ACTIVE') {
                    await adminEnableUser(customer.email);
                }
            } catch (error) {
                console.error('Failed to update Cognito user status:', error);
                // Continue anyway - DynamoDB status is updated
            }
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                customerId,
                status,
                message: `Customer status updated to ${status}`
            }
        });
    } catch (error) {
        console.error('Update customer error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to update customer'
        }, { status: 500 });
    }
}

// DELETE - Remove customer
export async function DELETE(request: NextRequest) {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.success) {
        return NextResponse.json<ApiResponse>({
            success: false,
            error: authResult.error
        }, { status: authResult.status });
    }

    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customerId');

        if (!customerId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Customer ID is required'
            }, { status: 400 });
        }

        // Get customer to get their email
        const customer = await getUserById(customerId);
        if (!customer) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Customer not found'
            }, { status: 404 });
        }

        // Delete from DynamoDB
        const deleted = await deleteUser(customerId);
        if (!deleted) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to delete user from database'
            }, { status: 500 });
        }

        // Also delete from Cognito if email exists
        if (customer.email) {
            try {
                await adminDeleteUser(customer.email);
            } catch (error) {
                console.error('Failed to delete Cognito user:', error);
                // Continue anyway - DynamoDB user is deleted
            }
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                customerId,
                message: 'Customer deleted successfully'
            }
        });
    } catch (error) {
        console.error('Delete customer error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to delete customer'
        }, { status: 500 });
    }
}
