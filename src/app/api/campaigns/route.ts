import { NextRequest, NextResponse } from 'next/server';
import { campaigns, generateId } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get('businessId');

        if (businessId) {
            const businessCampaigns = await campaigns.getByBusiness(businessId);
            return NextResponse.json<ApiResponse>({
                success: true,
                data: businessCampaigns
            });
        }

        const allCampaigns = await campaigns.getAll();
        return NextResponse.json<ApiResponse>({
            success: true,
            data: allCampaigns
        });
    } catch (error) {
        console.error('Get campaigns error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch campaigns'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { businessId, businessName, title, description, targetCity, targetCategory, duration, budget, placement, image } = body;

        if (!businessId || !title || !budget || !duration) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        const campaignId = generateId('camp');
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();

        const campaignData = {
            businessId,
            businessName,
            title,
            description,
            image,
            targetCity,
            targetCategory,
            duration,
            startDate,
            endDate,
            budget,
            placement: placement || 'featured'
        };

        const created = await campaigns.create(campaignId, campaignData);

        if (created) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { id: campaignId, ...campaignData, status: 'pending' }
            }, { status: 201 });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to create campaign'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Create campaign error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Campaign ID and status are required'
            }, { status: 400 });
        }

        const updated = await campaigns.update(id, { status });

        if (updated) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { message: `Campaign ${status} successfully` }
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to update campaign'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Update campaign error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
