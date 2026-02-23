import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, ScanCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Create Product
export async function POST(request: NextRequest) {
    try {
        const { action, ...data } = await request.json();

        if (action === 'create-product') {
            const now = new Date();
            let drawEnd = new Date();
            drawEnd.setHours(22, 0, 0, 0); // Default 10 PM

            if (data.drawType === 'weekly') {
                const day = drawEnd.getDay();
                const diff = drawEnd.getDate() - day + (day === 0 ? 0 : 7); // Next Sunday
                drawEnd.setDate(diff);
            } else if (data.drawType === 'monthly') {
                drawEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 22, 0, 0); // Last day of month
            }

            // Ensure end is in future
            if (drawEnd < now) drawEnd.setDate(drawEnd.getDate() + 1);

            const product = {
                id: uuidv4(),
                name: data.name,
                description: data.description,
                image: data.image,
                totalNumbers: data.totalNumbers || 100,
                pricePerNumber: data.pricePerNumber,
                status: 'active',
                seasonId: data.seasonId,
                drawType: data.drawType, // daily, weekly, monthly
                durationValue: data.durationValue, // e.g. "30 days", "20 weeks"
                isJackpot: data.isJackpot,
                jackpotConfig: data.jackpotConfig || { prizeAmount: 0, profitGoal: 0 },
                isSurpriseGift: data.isSurpriseGift,
                autoWinner: data.autoWinner || false,
                currentDrawEnd: drawEnd.toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await docClient.send(new PutCommand({
                TableName: 'LuckyDrawProducts',
                Item: product
            }));

            return NextResponse.json({ success: true, data: product });
        }

        if (action === 'update-product') {
            const { id, ...updateData } = data;

            await docClient.send(new UpdateCommand({
                TableName: 'LuckyDrawProducts',
                Key: { id },
                UpdateExpression: 'SET #name = :name, description = :description, image = :image, totalNumbers = :totalNumbers, pricePerNumber = :pricePerNumber, updatedAt = :updatedAt',
                ExpressionAttributeNames: { '#name': 'name' },
                ExpressionAttributeValues: {
                    ':name': updateData.name,
                    ':description': updateData.description,
                    ':image': updateData.image,
                    ':totalNumbers': updateData.totalNumbers || 100,
                    ':pricePerNumber': updateData.pricePerNumber,
                    ':updatedAt': new Date().toISOString()
                }
            }));

            return NextResponse.json({ success: true, message: 'Product updated successfully' });
        }

        if (action === 'delete-product') {
            const { id } = data;

            await docClient.send(new DeleteCommand({
                TableName: 'LuckyDrawProducts',
                Key: { id }
            }));

            return NextResponse.json({ success: true, message: 'Product deleted successfully' });
        }

        if (action === 'select-winners') {
            const { productId, winningNumbers, gifts, selectionMethod, selectedBy } = data;

            // Get bookings for winning numbers
            const bookingsResult = await docClient.send(new QueryCommand({
                TableName: 'NumberBookings',
                IndexName: 'ProductIndex',
                KeyConditionExpression: 'productId = :productId',
                ExpressionAttributeValues: { ':productId': productId }
            }));

            const winners = [];
            const drawResult = {
                id: uuidv4(),
                productId,
                winningNumbers,
                selectedBy,
                selectionMethod,
                completedAt: new Date().toISOString()
            };

            // Find winners and create winner records
            for (let i = 0; i < winningNumbers.length; i++) {
                const winningNumber = winningNumbers[i];
                const booking = bookingsResult.Items?.find(b =>
                    b.numbers.includes(winningNumber) && b.paymentStatus === 'completed'
                );

                if (booking) {
                    const winner = {
                        id: uuidv4(),
                        productId,
                        productName: data.productName,
                        userId: booking.userId,
                        userName: booking.userName,
                        winningNumber,
                        gift: gifts[i] || 'Prize',
                        giftValue: data.giftValues?.[i] || 0,
                        status: 'pending',
                        selectedAt: new Date().toISOString(),
                        notified: false
                    };

                    await docClient.send(new PutCommand({
                        TableName: 'LuckyDrawWinners',
                        Item: winner
                    }));

                    winners.push(winner);
                }
            }

            // Save draw result
            await docClient.send(new PutCommand({
                TableName: 'DrawResults',
                Item: drawResult
            }));

            // Handle Automated Next Draw Cycle
            const now = new Date();
            let nextDrawEnd = new Date();
            // Simple logic for next cycle
            if (data.drawType === 'daily') nextDrawEnd.setDate(now.getDate() + 1);
            else if (data.drawType === 'weekly') nextDrawEnd.setDate(now.getDate() + 7);
            else if (data.drawType === 'monthly') nextDrawEnd.setMonth(now.getMonth() + 1);

            // Update product status or reset for next cycle
            await docClient.send(new UpdateCommand({
                TableName: 'LuckyDrawProducts',
                Key: { id: productId },
                UpdateExpression: 'SET #status = :status, drawDate = :drawDate, currentDrawEnd = :nextDrawEnd, updatedAt = :updatedAt',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: {
                    ':status': 'active', // Keep active for next cycle
                    ':drawDate': new Date().toISOString(),
                    ':nextDrawEnd': nextDrawEnd.toISOString(),
                    ':updatedAt': new Date().toISOString()
                }
            }));

            return NextResponse.json({ success: true, data: { winners, drawResult } });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error in admin action:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// Get admin data
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        if (type === 'products') {
            const result = await docClient.send(new ScanCommand({
                TableName: 'LuckyDrawProducts'
            }));
            return NextResponse.json({ success: true, data: result.Items || [] });
        }

        if (type === 'bookings') {
            const productId = searchParams.get('productId');
            if (!productId) {
                return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
            }

            const result = await docClient.send(new QueryCommand({
                TableName: 'NumberBookings',
                IndexName: 'ProductIndex',
                KeyConditionExpression: 'productId = :productId',
                ExpressionAttributeValues: { ':productId': productId }
            }));

            return NextResponse.json({ success: true, data: result.Items || [] });
        }

        if (type === 'winners') {
            const result = await docClient.send(new ScanCommand({
                TableName: 'LuckyDrawWinners'
            }));
            return NextResponse.json({ success: true, data: result.Items || [] });
        }

        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        console.error('Error fetching admin data:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}