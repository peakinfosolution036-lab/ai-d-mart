import { NextRequest, NextResponse } from 'next/server';
import { products, generateId } from '@/lib/dynamodb';

export async function GET(req: NextRequest) {
    try {
        const storeId = req.nextUrl.searchParams.get('storeId');
        if (!storeId) return NextResponse.json({ success: false, error: 'Store ID required' }, { status: 400 });

        const storeProducts = await products.getByStore(storeId);
        return NextResponse.json({ success: true, data: storeProducts });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { storeId, name, price, category, description, image, businessId } = body;

        if (!storeId || !name || !price) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const id = generateId('PRD');
        const productData = {
            id,
            storeId,
            businessId: businessId || null,
            name,
            price: parseFloat(price),
            category: category || 'General',
            description: description || '',
            image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        await products.create(id, productData);

        return NextResponse.json({ success: true, data: productData });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
