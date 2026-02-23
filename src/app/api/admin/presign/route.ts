import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifyAdminAccess } from '@/lib/admin-auth';

const s3 = new S3Client({
    region: process.env.S3_UPLOAD_REGION || 'ap-southeast-1',
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET = process.env.S3_UPLOAD_BUCKET || 'd-mart-screenshot';

export async function GET(request: NextRequest) {
    const authResult = await verifyAdminAccess(request);
    if (!authResult.success) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'url param required' }, { status: 400 });
    }

    // Extract the S3 key from the URL
    // e.g. https://d-mart-screenshot.s3.ap-southeast-1.amazonaws.com/payment-screenshots/xyz.jpg
    const match = url.match(/amazonaws\.com\/(.+)$/);
    if (!match) {
        return NextResponse.json({ error: 'Invalid S3 URL' }, { status: 400 });
    }
    const key = match[1];

    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

    return NextResponse.json({ signedUrl });
}
