import { NextRequest, NextResponse } from 'next/server';
import { events, eventBookings, generateId } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const location = searchParams.get('location') || '';
        const category = searchParams.get('category') || '';
        const date = searchParams.get('date') || '';

        let allEvents = await events.getAll();

        // Only show active events to customers
        allEvents = allEvents.filter(e => e.status === 'ACTIVE' || e.status === 'upcoming');

        if (query) {
            allEvents = allEvents.filter(e =>
                e.title?.toLowerCase().includes(query.toLowerCase()) ||
                e.description?.toLowerCase().includes(query.toLowerCase())
            );
        }
        if (location) allEvents = allEvents.filter(e => e.location?.toLowerCase().includes(location.toLowerCase()));
        if (category) allEvents = allEvents.filter(e => e.category?.toLowerCase() === category.toLowerCase());
        if (date) allEvents = allEvents.filter(e => e.date === date);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: allEvents
        });
    } catch (error) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch events' }, { status: 500 });
    }
}

// Track view
export async function PATCH(request: NextRequest) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ success: false });
        await events.trackView(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}
