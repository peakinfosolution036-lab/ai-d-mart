import { NextRequest, NextResponse } from 'next/server';
import { eventBookings, generateId } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventId, userId, userName, userEmail, eventTitle } = body;

        if (!eventId || !userId) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Create booking (no payment required)
        const bookingId = generateId('bkg');
        const bookingData = {
            userId,
            userName,
            userEmail,
            eventId,
            eventTitle,
            status: 'CONFIRMED',
            bookingDate: new Date().toISOString()
        };

        const success = await eventBookings.create(bookingId, bookingData);

        if (success) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { bookingId, ...bookingData }
            });
        } else {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create booking' }, { status: 500 });
        }
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
