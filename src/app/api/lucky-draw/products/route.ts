import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand, QueryCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const seasonId = searchParams.get('seasonId');
        const drawType = searchParams.get('drawType');

        // 1. Fetch Specific Product
        if (productId) {
            const [productResult, bookingsResult] = await Promise.all([
                docClient.send(new ScanCommand({
                    TableName: 'LuckyDrawProducts',
                    FilterExpression: 'id = :id',
                    ExpressionAttributeValues: { ':id': productId }
                })),
                docClient.send(new QueryCommand({
                    TableName: 'NumberBookings',
                    IndexName: 'ProductIndex',
                    KeyConditionExpression: 'productId = :productId',
                    ExpressionAttributeValues: { ':productId': productId }
                }))
            ]);

            const product = productResult.Items?.[0];
            if (!product) {
                return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
            }

            // Calculate available numbers based on current cycle
            const currentDrawStart = product.currentDrawStart ? new Date(product.currentDrawStart) : new Date(0);

            const bookedNumbers = new Set();
            bookingsResult.Items?.forEach(booking => {
                const bookedAt = new Date(booking.bookedAt);
                // Only count bookings for the CURRENT active draw cycle
                if ((booking.paymentStatus === 'completed' || booking.paymentId) && bookedAt >= currentDrawStart) {
                    booking.numbers?.forEach((num: number) => bookedNumbers.add(num));
                }
            });

            const availableNumbers = Array.from({ length: product.totalNumbers || 100 }, (_, i) => i + 1)
                .filter(num => !bookedNumbers.has(num));

            return NextResponse.json({
                success: true,
                data: {
                    ...product,
                    availableNumbers,
                    bookedCount: bookedNumbers.size
                }
            });
        }

        // 2. Fetch All Active Products & Run Automation
        let filterExpression = '#status = :status';
        const expressionAttributeNames: any = { '#status': 'status' };
        const expressionAttributeValues: any = { ':status': 'active' };

        if (seasonId) {
            filterExpression += ' AND seasonId = :seasonId';
            expressionAttributeValues[':seasonId'] = seasonId;
        }

        if (drawType) {
            filterExpression += ' AND drawType = :drawType';
            expressionAttributeValues[':drawType'] = drawType;
        }

        const result = await docClient.send(new ScanCommand({
            TableName: 'LuckyDrawProducts',
            FilterExpression: filterExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        }));

        // Process each product for automation check (Winner Selection & Reset)
        const products = result.Items || [];
        const processingPromises = products.map(async (product) => {
            const now = new Date();
            const drawEnd = product.currentDrawEnd ? new Date(product.currentDrawEnd) : null;
            let drawStart = product.currentDrawStart ? new Date(product.currentDrawStart) : new Date(0);

            // Check if Draw Expired
            if (drawEnd && now > drawEnd) {
                console.log(`Draw expired for ${product.name}. Running selection...`);

                // Fetch all bookings for this product to find winner
                const bookingsResult = await docClient.send(new QueryCommand({
                    TableName: 'NumberBookings',
                    IndexName: 'ProductIndex',
                    KeyConditionExpression: 'productId = :productId',
                    ExpressionAttributeValues: { ':productId': product.id }
                }));

                // Filter for THIS specific draw cycle
                const eligibleBookings = (bookingsResult.Items || []).filter(b => {
                    const bookedAt = new Date(b.bookedAt);
                    return bookedAt >= drawStart && bookedAt <= drawEnd && b.paymentStatus === 'completed';
                });

                // Pick Winner
                if (eligibleBookings.length > 0) {
                    try {
                        const randomIndex = Math.floor(Math.random() * eligibleBookings.length);
                        const winningBooking = eligibleBookings[randomIndex];
                        const winningNumber = winningBooking.numbers[Math.floor(Math.random() * winningBooking.numbers.length)];

                        // FIX: Use deterministic ID to prevent duplicate winners for the same cycle
                        // Format: productId#drawDate
                        const winnerId = `${product.id}#${drawEnd.toISOString()}`;

                        const winner = {
                            id: winnerId,
                            productId: product.id,
                            productName: product.name,
                            userId: winningBooking.userId,
                            userName: winningBooking.userName || 'Anonymous',
                            winningNumber: winningNumber,
                            gift: product.name + ' Prize',
                            status: 'announced',
                            drawDate: drawEnd.toISOString(),
                            seasonId: product.seasonId,
                            drawType: product.drawType
                        };

                        try {
                            await docClient.send(new PutCommand({
                                TableName: 'LuckyDrawWinners',
                                Item: winner,
                                ConditionExpression: 'attribute_not_exists(id)'
                            }));

                            // Save History (Outcome)
                            await docClient.send(new PutCommand({
                                TableName: 'DrawResults',
                                Item: {
                                    id: `RES#${winnerId}`, // Deterministic Result ID too
                                    productId: product.id,
                                    drawDate: drawEnd.toISOString(),
                                    winnerId: winner.userId,
                                    winningNumber: winningNumber,
                                    participantsCount: eligibleBookings.length
                                }
                            }));
                            console.log(`Winner selected for ${product.name}: ${winner.userId}`);
                        } catch (err: any) {
                            if (err.name === 'ConditionalCheckFailedException') {
                                console.log(`Winner already exists for ${product.name} cycle ${drawEnd.toISOString()}. Skipping selection.`);
                            } else {
                                throw err; // Rethrow other errors
                            }
                        }
                    } catch (err) {
                        console.error("Error picking winner:", err);
                    }
                } else {
                    console.log(`No eligible bookings for ${product.name} this cycle.`);
                }

                // Reset Draw Cycle
                let nextEnd = new Date(drawEnd);
                const nextStart = new Date(drawEnd); // Next cycle starts where previous ended

                if (product.drawType === 'daily') {
                    nextEnd.setDate(nextEnd.getDate() + 1);
                    // Keep time aligned (10 PM)
                    nextEnd.setHours(22, 0, 0, 0);
                } else if (product.drawType === 'weekly') {
                    nextEnd.setDate(nextEnd.getDate() + 7);
                } else if (product.drawType === 'monthly') {
                    nextEnd.setMonth(nextEnd.getMonth() + 1);
                    // Handle month overflow/last day logic if needed, simple add month for now
                } else {
                    nextEnd.setDate(nextEnd.getDate() + 1); // Default
                }

                // Catch up if server was down for long time
                while (nextEnd < now) {
                    nextStart.setTime(nextEnd.getTime()); // Update start to the missed cycle end
                    if (product.drawType === 'daily') nextEnd.setDate(nextEnd.getDate() + 1);
                    else if (product.drawType === 'weekly') nextEnd.setDate(nextEnd.getDate() + 7);
                    else nextEnd.setDate(nextEnd.getDate() + 1);
                }

                // Update Product in DB
                await docClient.send(new UpdateCommand({
                    TableName: 'LuckyDrawProducts',
                    Key: { id: product.id },
                    UpdateExpression: 'SET currentDrawStart = :start, currentDrawEnd = :end',
                    ExpressionAttributeValues: {
                        ':start': nextStart.toISOString(),
                        ':end': nextEnd.toISOString()
                    }
                }));

                // Update local object for response
                product.currentDrawStart = nextStart.toISOString();
                product.currentDrawEnd = nextEnd.toISOString();
                drawStart = nextStart; // Update for booking count below
            }

            // Calculate Available Numbers for CURRENT Cycle
            const bookingsResult = await docClient.send(new QueryCommand({
                TableName: 'NumberBookings',
                IndexName: 'ProductIndex',
                KeyConditionExpression: 'productId = :productId',
                ExpressionAttributeValues: { ':productId': product.id }
            }));

            const currentBookings = (bookingsResult.Items || []).filter(b => {
                const bookedAt = new Date(b.bookedAt);
                return bookedAt >= drawStart && b.paymentStatus === 'completed';
            });

            const bookedNumbers = new Set();
            currentBookings.forEach(b => b.numbers.forEach((n: any) => bookedNumbers.add(n)));

            const availableNumbers = Array.from({ length: product.totalNumbers || 100 }, (_, i) => i + 1)
                .filter(num => !bookedNumbers.has(num));

            return {
                ...product,
                availableNumbers,
                bookedCount: bookedNumbers.size
            };
        });

        const processedProducts = await Promise.all(processingPromises);

        return NextResponse.json({ success: true, data: processedProducts });

    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}