import { NextRequest, NextResponse } from 'next/server';
import { notifications } from '@/lib/dynamodb';
import { generateId } from '@/lib/dynamodb';

export async function GET() {
    try {
        const items = await notifications.getAll();
        console.log(`[AdminAPI] Fetched ${items.length} notifications`);
        return NextResponse.json({ success: true, data: items });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const id = generateId('NTF');
        const item = {
            id,
            ...body,
            createdAt: new Date().toISOString(),
            read: false
        };

        const success = await notifications.create(id, item);
        if (!success) throw new Error('Failed to create notification');

        return NextResponse.json({ success: true, data: item });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

        const body = await req.json();
        const success = await notifications.update(id, body);
        if (!success) throw new Error('Failed to update notification');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

        const success = await notifications.delete(id);
        if (!success) throw new Error('Failed to delete notification');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
