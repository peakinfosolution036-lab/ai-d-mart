import { NextRequest, NextResponse } from 'next/server';
import { orders } from '@/lib/dynamodb';
import { verifyAdminAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.success) {
        return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }

    try {
        const items = await orders.getAll();
        return NextResponse.json({ success: true, data: items });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }
}
