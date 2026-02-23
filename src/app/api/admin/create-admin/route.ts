import { NextRequest, NextResponse } from 'next/server';
import { putUserProfile, generateUserId } from '@/lib/dynamodb';

// This endpoint is deprecated - use the script instead:
// npx tsx scripts/create-admin-simple.ts

export async function POST() {
    return NextResponse.json({
        success: false,
        error: 'This endpoint is deprecated. Please use: npx tsx scripts/create-admin-simple.ts'
    }, { status: 410 });
}
