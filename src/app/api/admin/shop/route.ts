import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

const DATA_TABLE = process.env.DYNAMODB_DATA_TABLE || 'ai-d-mart-data';

export async function GET() {
    try {
        const command = new ScanCommand({
            TableName: DATA_TABLE,
            FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
            ExpressionAttributeValues: {
                ':pk': 'PRODUCT#',
                ':sk': 'DATA'
            }
        });

        const result = await docClient.send(command);

        return NextResponse.json({
            success: true,
            products: result.Items || []
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const productId = uuidv4();

        const product = {
            PK: `PRODUCT#${productId}`,
            SK: 'DATA',
            id: productId,
            entityType: 'product',
            name: body.name,
            category: body.category,
            description: body.description || '',
            images: body.images || [],
            image: (body.images && body.images[0]) || '',
            originalPrice: body.originalPrice,
            offerPrice: body.offerPrice,
            price: body.offerPrice,
            stock: body.stock,
            quantity: body.stock,
            sku: body.sku || `SKU-${productId.slice(0, 8)}`,
            status: body.status || 'Active',
            showOnHomepage: body.showOnHomepage !== false,
            homepageOrder: body.homepageOrder || 999,
            featured: body.featured || false,
            limitedOffer: body.limitedOffer || false,
            inStock: (body.stock || 0) > 0,
            rating: 4.5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            storeId: body.storeId || '', // Support for store/vendor assignment
            businessId: body.storeId || '' // Redundant field for compatibility
        };

        // Validate image size (DynamoDB limit is 400KB total, but let's be safe)
        const itemSize = JSON.stringify(product).length;
        if (itemSize > 350 * 1024) {
            return NextResponse.json(
                { success: false, error: 'Product data (likely image) is too large for database.' },
                { status: 400 }
            );
        }

        await docClient.send(new PutCommand({
            TableName: DATA_TABLE,
            Item: product
        }));

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create product' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id && !body.PK) {
            return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
        }

        const pk = body.PK || `PRODUCT#${body.id}`;

        // Validate image size (DynamoDB limit is 400KB total, but let's be safe)
        const itemSize = JSON.stringify(body).length;
        if (itemSize > 350 * 1024) {
            return NextResponse.json(
                { success: false, error: 'Product data (likely image) is too large for database.' },
                { status: 400 }
            );
        }

        await docClient.send(new UpdateCommand({
            TableName: DATA_TABLE,
            Key: { PK: pk, SK: 'DATA' },
            UpdateExpression: `SET
                #name = :name,
                category = :category,
                description = :description,
                images = :images,
                image = :image,
                originalPrice = :originalPrice,
                offerPrice = :offerPrice,
                price = :price,
                stock = :stock,
                quantity = :stock,
                sku = :sku,
                #status = :status,
                showOnHomepage = :showOnHomepage,
                homepageOrder = :homepageOrder,
                featured = :featured,
                limitedOffer = :limitedOffer,
                inStock = :inStock,
                storeId = :storeId,
                businessId = :businessId,
                updatedAt = :updatedAt`,
            ExpressionAttributeNames: {
                '#name': 'name',
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':name': body.name,
                ':category': body.category,
                ':description': body.description || '',
                ':images': body.images || [],
                ':image': (body.images && body.images[0]) || '',
                ':originalPrice': body.originalPrice,
                ':offerPrice': body.offerPrice,
                ':price': body.offerPrice,
                ':stock': body.stock,
                ':sku': body.sku || '',
                ':status': body.status || 'Active',
                ':showOnHomepage': body.showOnHomepage !== false,
                ':homepageOrder': body.homepageOrder || 999,
                ':featured': body.featured || false,
                ':limitedOffer': body.limitedOffer || false,
                ':inStock': (body.stock || 0) > 0,
                ':storeId': body.storeId || '',
                ':businessId': body.storeId || '',
                ':updatedAt': new Date().toISOString()
            }
        }));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        if (!productId) {
            return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
        }

        await docClient.send(new DeleteCommand({
            TableName: DATA_TABLE,
            Key: { PK: `PRODUCT#${productId}`, SK: 'DATA' }
        }));

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
