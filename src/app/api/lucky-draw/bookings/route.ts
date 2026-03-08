import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, ScanCommand, TransactWriteCommand, GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { sendLuckyDrawConfirmationEmail } from '@/lib/email-resend';

export async function POST(request: NextRequest) {
    try {
        const {
            productId, userId, userName, numbers, paymentId,
            isFreeRequest, participantName, participantMobile, participantAddress, participantEmail, participantPhoto
        } = await request.json();

        if (!productId || !userId || !numbers || !Array.isArray(numbers)) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Validate Mobile Number if provided (Indian format generally)
        if (participantMobile && !/^[6-9]\d{9}$/.test(participantMobile)) {
            return NextResponse.json({ success: false, error: 'Invalid mobile number format' }, { status: 400 });
        }

        // Handle Free Ticket Logic
        if (isFreeRequest) {
            // 1. Verify user hasn't used free chance
            const profileResult = await docClient.send(new QueryCommand({
                TableName: 'LuckyDrawProfiles',
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId }
            }));

            const profile = profileResult.Items?.[0];
            if (profile?.freeChanceUsed) {
                return NextResponse.json({ success: false, error: 'Free chance already used' }, { status: 400 });
            }

            // 2. Validate valid number count (only 1 allowed for free)
            if (numbers.length !== 1) {
                return NextResponse.json({ success: false, error: 'Only 1 number allowed for free entry' }, { status: 400 });
            }
        }

        // Check availability (Query BookedNumbers table if possible, or use current check as pre-validation)
        // Note: New BookedNumbers table ensures atomicity. Pre-check is for user feedback.
        const existingBookings = await docClient.send(new QueryCommand({
            TableName: 'NumberBookings',
            IndexName: 'ProductIndex',
            KeyConditionExpression: 'productId = :productId',
            ExpressionAttributeValues: { ':productId': productId }
        }));

        const bookedNumbers = new Set();
        existingBookings.Items?.forEach(booking => {
            if (booking.paymentStatus === 'completed' || booking.paymentId || booking.isFreeRequest) {
                booking.numbers.forEach((num: number) => bookedNumbers.add(num));
            }
        });

        const unavailableNumbers = numbers.filter((num: number) => bookedNumbers.has(num));
        if (unavailableNumbers.length > 0) {
            return NextResponse.json({
                success: false,
                error: `Numbers ${unavailableNumbers.join(', ')} are already booked`
            }, { status: 400 });
        }

        // Get product details
        const productResult = await docClient.send(new ScanCommand({
            TableName: 'LuckyDrawProducts',
            FilterExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': productId }
        }));

        const product = productResult.Items?.[0];
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const totalAmount = isFreeRequest ? 0 : numbers.length * product.pricePerNumber;
        const bookingId = uuidv4();

        const booking = {
            id: bookingId,
            productId,
            userId,
            userName, // Logged in user name
            participantName: participantName || userName, // Support family entry name
            participantMobile: participantMobile || '',    // Support family entry mobile
            participantAddress: participantAddress || '',
            participantPhoto: participantPhoto || '',
            numbers,
            totalAmount,
            paymentStatus: (paymentId || isFreeRequest) ? 'completed' : 'pending',
            paymentId: paymentId || (isFreeRequest ? 'FREE_ENTRY' : null),
            isFreeRequest: !!isFreeRequest,
            bookedAt: new Date().toISOString(),
            seasonId: product.seasonId,
            drawType: product.drawType
        };

        const timestamp = new Date().toISOString();

        // ------------------
        // WALLET DEDUCTION
        // ------------------
        if (paymentId === 'wallet' && !isFreeRequest && totalAmount > 0) {
            const walletTypes = ['MAIN', 'REFERRAL', 'SHOPPING', 'EVENT'];
            const wallets = [];
            let totalBalance = 0;

            for (const wt of walletTypes) {
                const wRes = await docClient.send(new GetCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: { PK: `USER#${userId}`, SK: `WALLET#${wt}` }
                }));
                const balance = wRes.Item?.balance || 0;
                if (balance > 0) {
                    wallets.push({ type: wt, balance });
                    totalBalance += balance;
                }
            }

            if (totalBalance < totalAmount) {
                return NextResponse.json({ success: false, error: 'Insufficient wallet balance.' }, { status: 400 });
            }

            // Deduct from Wallets sequentially
            let remainingToDeduct = totalAmount;
            for (const wallet of wallets) {
                if (remainingToDeduct <= 0) break;
                const toDeduct = Math.min(wallet.balance, remainingToDeduct);

                await docClient.send(new UpdateCommand({
                    TableName: 'ai-d-mart-wallets',
                    Key: { PK: `USER#${userId}`, SK: `WALLET#${wallet.type}` },
                    UpdateExpression: 'SET balance = balance - :amount, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                        ':amount': toDeduct,
                        ':updatedAt': timestamp
                    }
                }));

                // Record transaction
                const txId = uuidv4();
                await docClient.send(new PutCommand({
                    TableName: 'ai-d-mart-wallets',
                    Item: {
                        PK: `USER#${userId}`,
                        SK: `TRANSACTION#${txId}`,
                        transactionId: txId,
                        walletType: wallet.type,
                        type: 'LUCKY_DRAW_ENTRY',
                        amount: -toDeduct,
                        description: `Lucky Draw Ticket ${bookingId}`,
                        status: 'COMPLETED',
                        createdAt: timestamp
                    }
                }));

                remainingToDeduct -= toDeduct;
            }
        }

        // Transaction for Atomicity
        // Use a more robust cycle ID including season and draw end
        const cycleId = `${productId}#${product.seasonId || 'default'}#${product.currentDrawEnd || 'default'}`;

        const transactItems: any[] = numbers.map((num: number) => ({
            Put: {
                TableName: 'LuckyDrawBookedNumbers',
                Item: { cycleId, number: num, bookingId },
                ConditionExpression: 'attribute_not_exists(#n)',
                ExpressionAttributeNames: { '#n': 'number' }
            }
        }));

        transactItems.push({
            Put: {
                TableName: 'NumberBookings',
                Item: booking
            }
        });

        // Also update profile if free ticket
        if (isFreeRequest) {
            transactItems.push({
                Put: {
                    TableName: 'LuckyDrawProfiles',
                    Item: { userId, freeChanceUsed: true }
                }
            });
        }

        try {
            await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
        } catch (txError: any) {
            // Check for transaction cancellation efficiently
            if (txError.name === 'TransactionCanceledException') {
                return NextResponse.json({ success: false, error: 'One or more numbers were just booked by someone else. Please try again.' }, { status: 409 });
            }
            console.error('Transaction Error:', txError);
            throw txError;
        }

        // Send confirmation email
        if (participantEmail) {
            try {
                await sendLuckyDrawConfirmationEmail({
                    name: participantName || userName || 'Guest',
                    email: participantEmail,
                    mobile: participantMobile,
                    luckyNumbers: numbers,
                    bookingId,
                    photoDataUrl: participantPhoto
                });
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
            }
        }

        return NextResponse.json({ success: true, data: booking });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        const result = await docClient.send(new QueryCommand({
            TableName: 'NumberBookings',
            IndexName: 'UserIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: { ':userId': userId },
            ScanIndexForward: false
        }));

        return NextResponse.json({ success: true, data: result.Items || [] });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}