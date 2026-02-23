import { NextRequest, NextResponse } from 'next/server';
import { eventBookings, users, events } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';
import { sendBookingConfirmationEmail } from '@/lib/email-resend';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const bookings = await eventBookings.getAll();

        // Enrich bookings with user info if missing
        const enrichedBookings = await Promise.all(bookings.map(async (booking: any) => {
            if (!booking.userName || !booking.userEmail) {
                const user = await users.get(booking.userId);
                if (user) {
                    return {
                        ...booking,
                        userName: booking.userName || user.name,
                        userEmail: booking.userEmail || user.email
                    };
                }
            }
            return booking;
        }));

        return NextResponse.json<ApiResponse>({
            success: true,
            data: enrichedBookings
        });
    } catch (error) {
        console.error('Get event bookings error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch event bookings'
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'ID and status are required'
            }, { status: 400 });
        }

        // Update booking status
        const success = await eventBookings.update(id, { status });

        if (success) {
            // If status is CONFIRMED, send confirmation email
            if (status === 'CONFIRMED') {
                try {
                    // Get booking details
                    const booking = await eventBookings.get(id);
                    if (booking && booking.userEmail) {
                        // Get event details
                        const event = booking.eventId ? await events.get(booking.eventId) : null;

                        // Format date if available
                        let formattedDate = booking.eventDate || 'TBD';
                        if (booking.eventDate) {
                            try {
                                const date = new Date(booking.eventDate);
                                formattedDate = format(date, 'PPP');
                            } catch (e) {
                                // Use original date string if formatting fails
                            }
                        }

                        // Send confirmation email
                        await sendBookingConfirmationEmail({
                            userName: booking.userName || 'Valued Customer',
                            userEmail: booking.userEmail,
                            eventTitle: booking.eventTitle || event?.title || 'Event',
                            eventDate: formattedDate,
                            eventTime: booking.eventTime || event?.time,
                            eventLocation: booking.eventLocation || event?.location,
                            bookingId: id,
                        });

                        console.log(`Confirmation email sent to ${booking.userEmail}`);
                    }
                } catch (emailError) {
                    // Log email error but don't fail the request
                    console.error('Failed to send confirmation email:', emailError);
                }
            }

            return NextResponse.json<ApiResponse>({
                success: true,
                message: status === 'CONFIRMED'
                    ? 'Booking confirmed and email sent to user'
                    : 'Booking status updated'
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to update booking status'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Update event booking error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
