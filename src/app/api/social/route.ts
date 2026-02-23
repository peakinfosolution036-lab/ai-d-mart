import { NextRequest, NextResponse } from 'next/server';
import { socialEngagement } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, userId, contentType, contentId, platform, businessId } = body;

        if (!action || !userId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Action and user ID are required'
            }, { status: 400 });
        }

        switch (action) {
            case 'share':
                if (!contentType || !contentId || !platform) {
                    return NextResponse.json<ApiResponse>({
                        success: false,
                        error: 'Content type, content ID, and platform are required for sharing'
                    }, { status: 400 });
                }
                await socialEngagement.trackShare(userId, contentType, contentId, platform);
                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: { message: 'Share tracked successfully' }
                });

            case 'follow':
                if (!businessId) {
                    return NextResponse.json<ApiResponse>({
                        success: false,
                        error: 'Business ID is required'
                    }, { status: 400 });
                }
                await socialEngagement.followBusiness(userId, businessId);
                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: { message: 'Business followed successfully' }
                });

            case 'unfollow':
                if (!businessId) {
                    return NextResponse.json<ApiResponse>({
                        success: false,
                        error: 'Business ID is required'
                    }, { status: 400 });
                }
                await socialEngagement.unfollowBusiness(userId, businessId);
                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: { message: 'Business unfollowed successfully' }
                });

            default:
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Social action error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const businessId = searchParams.get('businessId');
        const userId = searchParams.get('userId');

        if (type === 'followers' && businessId) {
            const followers = await socialEngagement.getFollowers(businessId);
            return NextResponse.json<ApiResponse>({
                success: true,
                data: followers
            });
        }

        if (type === 'following' && userId) {
            const following = await socialEngagement.getFollowing(userId);
            return NextResponse.json<ApiResponse>({
                success: true,
                data: following
            });
        }

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Invalid query parameters'
        }, { status: 400 });
    } catch (error) {
        console.error('Get social data error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch social data'
        }, { status: 500 });
    }
}
