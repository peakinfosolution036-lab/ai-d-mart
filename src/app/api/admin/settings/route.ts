import { NextRequest, NextResponse } from 'next/server';
import { platformSettings } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET() {
    try {
        const settings = await platformSettings.get();
        return NextResponse.json<ApiResponse>({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get platform settings error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch settings'
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { adminId, ...settings } = body;

        if (!adminId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Admin ID is required'
            }, { status: 400 });
        }

        const saved = await platformSettings.save(settings, adminId);

        if (saved) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { message: 'Platform settings saved successfully' }
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to save settings'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Save platform settings error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
