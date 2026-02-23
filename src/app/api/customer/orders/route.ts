import { NextRequest, NextResponse } from 'next/server';
import { orders, users, transactions } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { userId, items, total, type } = await req.json();
        if (!userId || !items || !total) throw new Error('Missing required fields');

        // 1. Get user to check balance
        const user = await users.get(userId);
        if (!user) throw new Error('User not found');
        if (user.walletBalance < total) throw new Error('Insufficient wallet balance');

        const orderId = uuidv4();

        // 2. Create Order
        await orders.create(orderId, {
            userId,
            items,
            total,
            type,
            status: 'pending'
        });

        // 3. Update Wallet Balance
        const newBalance = user.walletBalance - total;
        await users.update(userId, { walletBalance: newBalance });

        // 4. Record Transaction
        await transactions.create(uuidv4(), {
            userId,
            amount: total,
            type: 'debit',
            description: `Purchase of ${items.length} items`,
            reference: orderId,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, orderId });
    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        if (!userId) throw new Error('userId required');

        const items = await orders.getByUser(userId);
        return NextResponse.json({ success: true, data: items });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
