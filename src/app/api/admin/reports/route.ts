import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Fetch All Bookings (Scan - OK for < 10k items, consider pagination/analytics service for scale)
        const bookingsResult = await docClient.send(new ScanCommand({
            TableName: 'NumberBookings'
        }));

        const bookings = bookingsResult.Items || [];

        // Fetch All Products for names
        const productsResult = await docClient.send(new ScanCommand({
            TableName: 'LuckyDrawProducts'
        }));
        const products = productsResult.Items || [];
        const productMap = new Map(products.map(p => [p.id, p]));

        // Aggregate Data
        let totalRevenue = 0;
        let totalTickets = 0;
        const uniqueUsers = new Set();
        const productStats: { [key: string]: { name: string, revenue: number, tickets: number } } = {};

        bookings.forEach(booking => {
            if (booking.paymentStatus === 'completed' || booking.paymentId) {
                const amount = Number(booking.totalAmount) || 0;
                totalRevenue += amount;
                totalTickets += booking.numbers?.length || 0;
                uniqueUsers.add(booking.userId);

                const productId = booking.productId;
                if (!productStats[productId]) {
                    productStats[productId] = {
                        name: productMap.get(productId)?.name || 'Unknown Product',
                        revenue: 0,
                        tickets: 0
                    };
                }
                productStats[productId].revenue += amount;
                productStats[productId].tickets += booking.numbers?.length || 0;
            }
        });

        // Format Product Performance
        const productPerformance = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);

        // Recent Sales (Last 10)
        // Sort by booking date desc
        const recentSales = bookings
            .filter(b => b.paymentStatus === 'completed' || b.paymentId)
            .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
            .slice(0, 50)
            .map(b => ({
                id: b.id,
                user: b.userName || b.userId,
                product: productMap.get(b.productId)?.name || 'Unknown',
                amount: b.totalAmount,
                date: b.bookedAt
            }));

        return NextResponse.json({
            success: true,
            data: {
                totalRevenue,
                totalTickets,
                activeUsers: uniqueUsers.size,
                productPerformance,
                recentSales
            }
        });

    } catch (error) {
        console.error('Error generating reports:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
