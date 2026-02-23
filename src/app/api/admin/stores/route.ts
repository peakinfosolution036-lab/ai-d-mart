import { NextRequest, NextResponse } from 'next/server';
import { stores } from '@/lib/dynamodb';

export async function GET() {
    try {
        const items = await stores.getAll();
        return NextResponse.json({ success: true, data: items });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
