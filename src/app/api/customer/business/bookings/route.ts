import { NextRequest, NextResponse } from 'next/server';
import { bookings } from '@/lib/dynamodb';

export async function GET(req: NextRequest) {
    try {
        const businessId = req.nextUrl.searchParams.get('businessId');
        if (!businessId) return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });

        const businessBookings = await bookings.getByBusiness(businessId);
        return NextResponse.json({ success: true, data: businessBookings });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });

        const success = await bookings.updateStatus(id, status);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
