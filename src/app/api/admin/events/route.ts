import { NextRequest, NextResponse } from 'next/server';
import { events, generateId } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');

        let allEvents = await events.getAll();

        if (status) allEvents = allEvents.filter(e => e.status === status);
        if (category) allEvents = allEvents.filter(e => e.category === category);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: allEvents
        });
    } catch (error) {
        console.error('Get events error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch events'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, date, location, image, category } = body;

        if (!title || !date || !location) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Title, date, and location are required'
            }, { status: 400 });
        }

        const eventId = generateId('evt');
        const eventData = {
            title,
            description: description || '',
            date,
            location,
            category: category || 'General',
            image: image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400',
            status: 'pending', // Default to pending for approval flow
            createdBy: 'admin',
            views: 0,
            bookings: 0,
            revenue: 0
        };

        const created = await events.create(eventId, eventData);

        if (created) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { id: eventId, ...eventData }
            }, { status: 201 });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to create event'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Create event error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Event ID is required' }, { status: 400 });
        }

        const success = await events.update(id, updates);
        return NextResponse.json<ApiResponse>({
            success,
            data: success ? { message: 'Event updated successfully' } : undefined,
            error: !success ? 'Failed to update event' : undefined
        });
    } catch (error) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('id');

        if (!eventId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Event ID is required'
            }, { status: 400 });
        }

        const deleted = await events.delete(eventId);

        if (deleted) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { message: 'Event deleted successfully' }
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to delete event'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Delete event error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}