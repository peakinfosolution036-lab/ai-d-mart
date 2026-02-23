import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ApiResponse } from '@/types';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const result = await docClient.send(new ScanCommand({
            TableName: 'ai-d-mart-products',
            FilterExpression: 'SK = :sk',
            ExpressionAttributeValues: {
                ':sk': 'METADATA'
            }
        }));
        
        return NextResponse.json<ApiResponse>({
            success: true,
            data: result.Items || []
        });
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch products'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, price, category, image, inStock = true } = body;

        if (!name || !price || !category) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Name, price, and category are required'
            }, { status: 400 });
        }

        const productId = uuidv4();
        
        const shopProduct = {
            PK: `PRODUCT#${productId}`,
            SK: 'METADATA',
            id: productId,
            name,
            description: description || '',
            category,
            images: image ? [image] : [],
            originalPrice: Number(price),
            offerPrice: Number(price),
            stock: inStock ? 100 : 0,
            sku: `SKU-${productId}`,
            status: 'Active',
            showOnHomepage: true,
            homepageOrder: 999,
            featured: false,
            limitedOffer: false,
            GSI1PK: 'HOMEPAGE#true',
            GSI1SK: 'ORDER#999',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await docClient.send(new PutCommand({
            TableName: 'ai-d-mart-products',
            Item: shopProduct
        }));

        return NextResponse.json<ApiResponse>({
            success: true,
            data: { ...shopProduct }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create product error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        if (!productId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Product ID is required'
            }, { status: 400 });
        }
        
        await docClient.send(new DeleteCommand({
            TableName: 'ai-d-mart-products',
            Key: { PK: `PRODUCT#${productId}`, SK: 'METADATA' }
        }));

        return NextResponse.json<ApiResponse>({
            success: true,
            data: { message: 'Product deleted successfully' }
        });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Product ID is required'
            }, { status: 400 });
        }
        
        await docClient.send(new UpdateCommand({
            TableName: 'ai-d-mart-products',
            Key: { PK: `PRODUCT#${id}`, SK: 'METADATA' },
            UpdateExpression: 'SET #name = :name, description = :desc, originalPrice = :price, offerPrice = :price, updatedAt = :updated',
            ExpressionAttributeNames: { '#name': 'name' },
            ExpressionAttributeValues: {
                ':name': updates.name || updates.title,
                ':desc': updates.description || '',
                ':price': Number(updates.price) || 0,
                ':updated': new Date().toISOString()
            }
        }));

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}