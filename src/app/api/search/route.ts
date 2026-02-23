import { NextRequest, NextResponse } from 'next/server';
import { searchEvents, globalSearch } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const query = searchParams.get('q') || '';
        const type = searchParams.get('type'); // 'global' or 'event'

        if (type === 'event') {
            const location = searchParams.get('location') || undefined;
            const date = searchParams.get('date') || undefined;
            const category = searchParams.get('category') || undefined;

            const results = await searchEvents({ query, location, date, category });
            return NextResponse.json<ApiResponse>({ success: true, data: results });
        }

        // Global search for Admin or specific entity search for Customer
        const entityTypes = searchParams.get('entities')?.split(',') || ['product', 'job', 'offer', 'business', 'event'];
        const results = await globalSearch(query, entityTypes);

        return NextResponse.json<ApiResponse>({ success: true, data: results });
    } catch (error: any) {
        console.error('Search API error:', error);
        return NextResponse.json<ApiResponse>({ success: false, error: 'Search failed' }, { status: 500 });
    }
}
