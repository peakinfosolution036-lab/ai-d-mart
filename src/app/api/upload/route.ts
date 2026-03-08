import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const s3 = new S3Client({
    region: process.env.APP_AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET = process.env.S3_UPLOAD_BUCKET || '';

export async function POST(request: NextRequest) {
    const userId = request.cookies.get('user_id')?.value;
    const accessToken = request.cookies.get('access_token')?.value;
    if (!userId || !accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!BUCKET) {
        return NextResponse.json({ error: 'Upload service not configured' }, { status: 503 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
        }

        const folder = (formData.get('folder') as string || 'uploads').replace(/[^a-zA-Z0-9-_]/g, '');
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
        const key = `${folder}/${timestamp}-${safeName}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        const url = `https://${BUCKET}.s3.${process.env.APP_AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;

        return NextResponse.json({ url, success: true });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
