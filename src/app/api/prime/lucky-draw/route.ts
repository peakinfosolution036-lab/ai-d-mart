import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, GetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');
        const month = searchParams.get('month') || new Date().toISOString().slice(0, 7); // YYYY-MM format

        switch (action) {
            case 'current_draw':
                return await getCurrentDraw(month);
            
            case 'user_status':
                if (!userId) {
                    return NextResponse.json({
                        success: false,
                        error: 'User ID is required'
                    }, { status: 400 });
                }
                return await getUserDrawStatus(userId, month);
            
            case 'winners':
                return await getDrawWinners(month);
            
            case 'all_draws':
                return await getAllDraws();
            
            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Lucky draw GET error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch lucky draw data'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, userId, month, drawId, winners, prizes } = body;

        switch (action) {
            case 'create_draw':
                return await createMonthlyDraw(month, prizes);
            
            case 'enter_draw':
                if (!userId) {
                    return NextResponse.json({
                        success: false,
                        error: 'User ID is required'
                    }, { status: 400 });
                }
                return await enterUserInDraw(userId, month);
            
            case 'select_winners':
                if (!drawId || !winners) {
                    return NextResponse.json({
                        success: false,
                        error: 'Draw ID and winners are required'
                    }, { status: 400 });
                }
                return await selectWinners(drawId, winners);
            
            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Lucky draw POST error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process lucky draw operation'
        }, { status: 500 });
    }
}

async function getCurrentDraw(month: string) {
    try {
        const draw = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-lucky-draw',
            Key: {
                PK: `DRAW#${month}`,
                SK: 'METADATA'
            }
        }));

        if (!draw.Item) {
            // Auto-create monthly draw if it doesn't exist
            const newDraw = await createMonthlyDraw(month, [
                { position: 1, prize: 'Cash ₹10,000', type: 'CASH', value: 10000 },
                { position: 2, prize: 'Cash ₹5,000', type: 'CASH', value: 5000 },
                { position: 3, prize: 'Event Pass', type: 'PASS', value: 2000 }
            ]);
            return newDraw;
        }

        // Get participant count
        const participants = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-lucky-draw',
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `DRAW#${month}`,
                ':sk': 'PARTICIPANT#'
            }
        }));

        return NextResponse.json({
            success: true,
            data: {
                ...draw.Item,
                participantCount: participants.Items?.length || 0
            }
        });

    } catch (error) {
        console.error('Error getting current draw:', error);
        throw error;
    }
}

async function createMonthlyDraw(month: string, prizes: any[]) {
    try {
        const drawId = uuidv4();
        const timestamp = new Date().toISOString();

        const draw = {
            PK: `DRAW#${month}`,
            SK: 'METADATA',
            id: drawId,
            month,
            status: 'ACTIVE',
            prizes,
            startDate: `${month}-01T00:00:00.000Z`,
            endDate: `${month}-31T23:59:59.999Z`,
            drawDate: null,
            winners: [],
            totalParticipants: 0,
            GSI1PK: 'DRAW#ACTIVE',
            GSI1SK: month,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-lucky-draw',
            Item: draw
        }));

        return NextResponse.json({
            success: true,
            data: draw
        });

    } catch (error) {
        console.error('Error creating monthly draw:', error);
        throw error;
    }
}

async function enterUserInDraw(userId: string, month: string) {
    try {
        // Check if user is Prime member
        const membership = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-prime-memberships',
            Key: {
                PK: `USER#${userId}`,
                SK: 'MEMBERSHIP'
            }
        }));

        if (!membership.Item || membership.Item.status !== 'ACTIVE') {
            return NextResponse.json({
                success: false,
                error: 'Only Prime members can participate in lucky draw'
            }, { status: 403 });
        }

        // Check if user already entered this month
        const existingEntry = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-lucky-draw',
            Key: {
                PK: `DRAW#${month}`,
                SK: `PARTICIPANT#${userId}`
            }
        }));

        if (existingEntry.Item) {
            return NextResponse.json({
                success: false,
                error: 'User already entered this month\'s draw'
            }, { status: 400 });
        }

        const timestamp = new Date().toISOString();
        const entryId = uuidv4();

        // Add user to draw
        const entry = {
            PK: `DRAW#${month}`,
            SK: `PARTICIPANT#${userId}`,
            id: entryId,
            userId,
            month,
            primeCode: membership.Item.primeCode,
            entryDate: timestamp,
            status: 'ENTERED',
            GSI1PK: `USER#${userId}`,
            GSI1SK: `DRAW#${month}`,
            createdAt: timestamp
        };

        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-lucky-draw',
            Item: entry
        }));

        return NextResponse.json({
            success: true,
            data: {
                entryId,
                message: 'Successfully entered in lucky draw'
            }
        });

    } catch (error) {
        console.error('Error entering user in draw:', error);
        throw error;
    }
}

async function getUserDrawStatus(userId: string, month: string) {
    try {
        // Check if user entered current month's draw
        const entry = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-lucky-draw',
            Key: {
                PK: `DRAW#${month}`,
                SK: `PARTICIPANT#${userId}`
            }
        }));

        // Get user's draw history
        const history = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-lucky-draw',
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :pk',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`
            }
        }));

        return NextResponse.json({
            success: true,
            data: {
                currentMonthEntered: !!entry.Item,
                entryDate: entry.Item?.entryDate || null,
                drawHistory: history.Items || []
            }
        });

    } catch (error) {
        console.error('Error getting user draw status:', error);
        throw error;
    }
}

async function selectWinners(drawId: string, winners: any[]) {
    try {
        const timestamp = new Date().toISOString();

        // Update draw with winners
        const draw = await docClient.send(new GetCommand({
            TableName: 'ai-d-mart-lucky-draw',
            Key: {
                PK: drawId,
                SK: 'METADATA'
            }
        }));

        if (!draw.Item) {
            return NextResponse.json({
                success: false,
                error: 'Draw not found'
            }, { status: 404 });
        }

        // Update draw status and winners
        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-lucky-draw',
            Item: {
                ...draw.Item,
                status: 'COMPLETED',
                winners,
                drawDate: timestamp,
                updatedAt: timestamp
            }
        }));

        // Create winner records and distribute rewards
        for (const winner of winners) {
            const winnerRecord = {
                PK: `WINNER#${drawId}`,
                SK: `USER#${winner.userId}`,
                drawId,
                userId: winner.userId,
                position: winner.position,
                prize: winner.prize,
                prizeType: winner.prizeType,
                prizeValue: winner.prizeValue,
                status: 'WON',
                GSI1PK: `USER#${winner.userId}`,
                GSI1SK: `WINNER#${timestamp}`,
                createdAt: timestamp
            };

            await docClient.send(new PutCommand({
                TableName: 'ai-d-mart-lucky-draw',
                Item: winnerRecord
            }));

            // If cash prize, add to rewards wallet
            if (winner.prizeType === 'CASH') {
                await docClient.send(new PutCommand({
                    TableName: 'ai-d-mart-prime-rewards',
                    Item: {
                        PK: `USER#${winner.userId}`,
                        SK: `REWARD#${uuidv4()}`,
                        userId: winner.userId,
                        type: 'LUCKY_DRAW_CASH',
                        amount: winner.prizeValue,
                        description: `Lucky Draw Winner - ${winner.prize}`,
                        status: 'CREDITED',
                        drawId,
                        GSI1PK: 'REWARD#LUCKY_DRAW',
                        GSI1SK: timestamp,
                        createdAt: timestamp
                    }
                }));
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                drawId,
                winners,
                message: 'Winners selected and rewards distributed'
            }
        });

    } catch (error) {
        console.error('Error selecting winners:', error);
        throw error;
    }
}

async function getDrawWinners(month: string) {
    try {
        const winners = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-lucky-draw',
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `WINNER#DRAW#${month}`,
                ':sk': 'USER#'
            }
        }));

        return NextResponse.json({
            success: true,
            data: winners.Items || []
        });

    } catch (error) {
        console.error('Error getting draw winners:', error);
        throw error;
    }
}

async function getAllDraws() {
    try {
        const draws = await docClient.send(new ScanCommand({
            TableName: 'ai-d-mart-lucky-draw',
            FilterExpression: 'SK = :sk',
            ExpressionAttributeValues: {
                ':sk': 'METADATA'
            }
        }));

        return NextResponse.json({
            success: true,
            data: draws.Items || []
        });

    } catch (error) {
        console.error('Error getting all draws:', error);
        throw error;
    }
}