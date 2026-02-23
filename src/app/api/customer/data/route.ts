import { NextRequest, NextResponse } from 'next/server';
import { events, products, jobs, offers, rewards, promotions, notifications, businesses, stores, orders, reviews, cart, eventBookings } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const userId = searchParams.get('userId');

        let data;

        switch (type) {
            case 'events':
                data = await events.getAll();
                break;
            case 'products':
                data = await products.getAll();
                break;
            case 'jobs':
                data = await jobs.getAll();
                break;
            case 'offers':
                data = await offers.getAll();
                break;
            case 'all':
            default:
                const [allEvents, allProducts, allJobs, allOffers, allPromos, allNotifs, allBusiness, allStores, allOrders, allReviews, userCart, allEventBookings] = await Promise.all([
                    events.getAll(),
                    products.getAll(),
                    jobs.getAll(),
                    offers.getAll(),
                    promotions.getAll(),
                    notifications.getAll(),
                    businesses.getAll(),
                    stores.getAll(),
                    orders.getAll(),
                    reviews.getByTarget('global'), // Or general reviews
                    userId ? cart.getByUserId(userId) : Promise.resolve(null),
                    eventBookings.getAll()
                ]);
                console.log(`[CustomerAPI] Fetched ${allNotifs.length} notifications for dashboard`);

                data = {
                    events: allEvents,
                    products: allProducts,
                    jobs: allJobs,
                    offers: allOffers,
                    promotions: allPromos,
                    notifications: allNotifs,
                    businesses: allBusiness,
                    stores: allStores,
                    orders: allOrders,
                    reviews: allReviews,
                    cart: userCart?.items || [],
                    eventBookings: allEventBookings
                };
                break;
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get customer data error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch data'
        }, { status: 500 });
    }
}