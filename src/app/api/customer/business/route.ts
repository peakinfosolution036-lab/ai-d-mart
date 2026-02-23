import { NextRequest, NextResponse } from 'next/server';
import { businesses, generateId } from '@/lib/dynamodb';

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get('userId');
        if (!userId) return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });

        const userBusinesses = await businesses.getByUser(userId);
        return NextResponse.json({ success: true, data: userBusinesses[0] || null });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, businessName, category, description, address, contactNumber, email, ownerName, businessType } = body;

        if (!userId || !businessName || !category) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const id = generateId('BUS');
        const success = await businesses.create(id, body);

        if (success) {
            return NextResponse.json({ success: true, data: { id, ...body } });
        } else {
            return NextResponse.json({ success: false, error: 'Failed to create business' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });

        const success = await businesses.update(id, updates);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Failed to update business' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
