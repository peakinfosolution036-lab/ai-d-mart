import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

const DATA_TABLE = process.env.DYNAMODB_DATA_TABLE || 'ai-d-mart-data';

export async function GET() {
    try {
        const command = new ScanCommand({
            TableName: DATA_TABLE,
            FilterExpression: 'begins_with(PK, :pk) AND SK = :sk AND showOnHomepage = :show AND #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':pk': 'PRODUCT#',
                ':sk': 'DATA',
                ':show': true,
                ':status': 'Active'
            }
        });

        const result = await docClient.send(command);

        const products = (result.Items || []).map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.offerPrice || item.originalPrice,
            description: item.description,
            status: item.status,
            image: item.images?.[0] || item.image || null,
            homepageOrder: item.homepageOrder || 999,
            stock: item.stock || 0
        }));

        // Sort by homepage order
        products.sort((a, b) => (a.homepageOrder || 999) - (b.homepageOrder || 999));

        return NextResponse.json({
            success: true,
            products,
            count: products.length
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch products'
        }, { status: 500 });
    }
}