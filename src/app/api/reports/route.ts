import { NextRequest, NextResponse } from 'next/server';
import { reports } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const type = searchParams.get('type') || 'platform';
        const businessId = searchParams.get('businessId');

        if (type === 'business' && businessId) {
            const stats = await reports.getBusinessStats(businessId);
            return NextResponse.json<ApiResponse>({
                success: true,
                data: stats
            });
        }

        const stats = await reports.getPlatformStats();
        return NextResponse.json<ApiResponse>({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get reports error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch reports'
        }, { status: 500 });
    }
}
