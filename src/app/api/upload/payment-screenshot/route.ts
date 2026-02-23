import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const BUCKET = process.env.S3_UPLOAD_BUCKET || 'd-mart-screenshot';
const REGION = process.env.S3_UPLOAD_REGION || 'ap-southeast-1';

const s3 = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
    },
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP allowed.' }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
        }

        const timestamp = Date.now();
        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        const folder = (formData.get('folder') as string || 'payment-screenshots').replace(/[^a-zA-Z0-9-_]/g, '');
        const key = `${folder}/${timestamp}.${ext}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

        return NextResponse.json({ url, success: true });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Payment screenshot upload error:', msg);
        return NextResponse.json({ error: 'Upload failed', detail: msg }, { status: 500 });
    }
}
