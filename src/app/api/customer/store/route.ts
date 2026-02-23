import { NextRequest, NextResponse } from 'next/server';
import { stores, products, generateId } from '@/lib/dynamodb';

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get('userId');
        if (!userId) return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });

        const userStores = await stores.getByUser(userId);
        const store = userStores[0] || null;

        if (store) {
            const storeProducts = await products.getByStore(store.id);
            return NextResponse.json({ success: true, store, products: storeProducts });
        }

        return NextResponse.json({ success: true, store: null, products: [] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, name, category, description, location, businessId } = body;

        if (!userId || !name || !category) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const id = generateId('STORE');
        const storeData = {
            id,
            userId,
            businessId: businessId || null,
            name,
            category,
            description,
            location,
            status: 'pending',
            rating: 5.0,
            reviewsCount: 0,
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
            createdAt: new Date().toISOString()
        };

        await stores.create(id, storeData);

        return NextResponse.json({ success: true, data: storeData });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
