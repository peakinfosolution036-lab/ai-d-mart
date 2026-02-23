import { NextRequest, NextResponse } from 'next/server';
import { reviews } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { targetId, userId, userName, rating, comment } = await req.json();
        if (!targetId || !userId || !rating) throw new Error('Missing required fields');

        const reviewId = uuidv4();
        await reviews.create(reviewId, {
            targetId,
            userId,
            userName,
            rating,
            comment,
            status: 'active'
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const targetId = searchParams.get('targetId');
        if (!targetId) throw new Error('targetId required');

        const items = await reviews.getByTarget(targetId);
        return NextResponse.json({ success: true, data: items });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
