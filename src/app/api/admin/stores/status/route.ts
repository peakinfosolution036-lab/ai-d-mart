import { NextRequest, NextResponse } from 'next/server';
import { stores } from '@/lib/dynamodb';

export async function POST(req: NextRequest) {
    try {
        const { storeId, status } = await req.json();
        if (!storeId || !status) throw new Error('Missing storeId or status');

        const success = await stores.updateStatus(storeId, status);
        if (!success) throw new Error('Failed to update store status');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
