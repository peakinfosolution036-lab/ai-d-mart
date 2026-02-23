import { NextRequest, NextResponse } from 'next/server';
import { userSettings } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }

        let settings = await userSettings.get(userId);

        if (!settings) {
            settings = { userId, ...userSettings.getDefault() };
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch settings'
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, ...settings } = body;

        if (!userId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }

        const saved = await userSettings.save(userId, settings);

        if (saved) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { message: 'Settings saved successfully' }
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to save settings'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Save settings error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
