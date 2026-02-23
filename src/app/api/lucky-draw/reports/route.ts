import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

// GET - Fetch lucky draw reports
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'revenue'; // revenue, season, winners
        const seasonId = searchParams.get('seasonId');
        const drawType = searchParams.get('drawType');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (type === 'revenue') {
            const result = await docClient.send(new ScanCommand({
                TableName: 'NumberBookings'
            }));

            let bookings = result.Items || [];

            // Filter by date range
            if (startDate) {
                bookings = bookings.filter(b => b.bookedAt >= startDate);
            }
            if (endDate) {
                bookings = bookings.filter(b => b.bookedAt <= endDate);
            }

            // Aggregated stats
            const totalTickets = bookings.reduce((sum, b) => sum + (b.numbers?.length || 0), 0);
            const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            const freeTickets = bookings.filter(b => b.isFreeRequest).length;

            return NextResponse.json({
                success: true,
                data: {
                    totalTickets,
                    totalRevenue,
                    freeTickets,
                    paidRevenue: totalRevenue,
                    bookingsCount: bookings.length
                }
            });
        }

        if (type === 'season') {
            const seasonsResult = await docClient.send(new ScanCommand({ TableName: 'LuckyDrawSeasons' }));
            const productsResult = await docClient.send(new ScanCommand({ TableName: 'LuckyDrawProducts' }));
            const bookingsResult = await docClient.send(new ScanCommand({ TableName: 'NumberBookings' }));

            const stats = (seasonsResult.Items || []).map(season => {
                const seasonProducts = (productsResult.Items || []).filter(p => p.seasonId === season.id);
                const seasonProductIds = seasonProducts.map(p => p.id);
                const seasonBookings = (bookingsResult.Items || []).filter(b => seasonProductIds.includes(b.productId));

                return {
                    seasonId: season.id,
                    seasonName: season.name,
                    totalProducts: seasonProducts.length,
                    totalRevenue: seasonBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
                    totalTickets: seasonBookings.reduce((sum, b) => sum + (b.numbers?.length || 0), 0)
                };
            });

            return NextResponse.json({ success: true, data: stats });
        }

        return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
