import { NextRequest, NextResponse } from 'next/server';
import { businesses } from '@/lib/dynamodb';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, action } = body; // action: 'verify' | 'reject'

        if (!id || !action) {
            return NextResponse.json({ success: false, error: 'Business ID and action required' }, { status: 400 });
        }

        let success = false;
        if (action === 'verify') {
            success = await businesses.verify(id);
        } else if (action === 'reject') {
            success = await businesses.update(id, { status: 'rejected', isVerified: false });
        }

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: `Failed to ${action} business` }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
