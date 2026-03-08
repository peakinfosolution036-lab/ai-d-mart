import { NextRequest, NextResponse } from 'next/server';
import { notifications } from '@/lib/dynamodb';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const userNotifs = await notifications.getByUser(userId);
        return NextResponse.json({ success: true, data: userNotifs });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const all = searchParams.get('all');
        const userId = searchParams.get('userId');

        if (all === 'true' && userId) {
            // Mark all as read logic (this might need a specific dynamodb helper)
            // For now, we'll fetch all and update each, or add a markAllRead helper
            const userNotifs = await notifications.getByUser(userId);
            const unreadIds = userNotifs.filter((n: any) => !n.read).map((n: any) => n.id);

            await Promise.all(unreadIds.map(id => notifications.update(id, { read: true })));
            return NextResponse.json({ success: true });
        }

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

        // Note: For broadcasts, we might want to "hide" it for this user rather than delete it globally.
        // But for private notifications, delete is fine.
        // For simplicity, we'll just delete if it's the user's notification.
        const success = await notifications.delete(id);
        if (!success) throw new Error('Failed to delete notification');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
