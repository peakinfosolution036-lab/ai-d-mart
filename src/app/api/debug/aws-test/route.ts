import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const BUILD_TIME = new Date().toISOString(); // captured at module load = build time

export async function GET() {
    const keyId = (process.env.APP_AWS_ACCESS_KEY_ID || '').trim();
    const secretKey = (process.env.APP_AWS_SECRET_ACCESS_KEY || '').trim();
    const region = (process.env.APP_AWS_REGION || 'ap-southeast-1').trim();
    const usersTable = (process.env.DYNAMODB_USERS_TABLE || 'ai-d-mart-users').trim();

    // Show env var status (mask secrets)
    const envStatus = {
        APP_AWS_REGION: region || '(empty)',
        APP_AWS_ACCESS_KEY_ID: keyId ? `${keyId.slice(0, 4)}...${keyId.slice(-4)} (len=${keyId.length})` : '(EMPTY - NOT SET)',
        APP_AWS_SECRET_ACCESS_KEY: secretKey ? `set (len=${secretKey.length})` : '(EMPTY - NOT SET)',
        DYNAMODB_USERS_TABLE: usersTable || '(empty)',
        COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID ? 'set' : '(empty)',
        COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID ? 'set' : '(empty)',
        COGNITO_REGION: process.env.COGNITO_REGION || '(empty)',
        NODE_ENV: process.env.NODE_ENV,
    };

    if (!keyId || !secretKey) {
        return NextResponse.json({
            success: false,
            error: 'APP_AWS_ACCESS_KEY_ID or APP_AWS_SECRET_ACCESS_KEY not set in runtime environment',
            envStatus,
            buildTime: BUILD_TIME,
            fix: 'Set these env vars in Amplify Console → App settings → Environment variables',
        }, { status: 500 });
    }

    try {
        const client = new DynamoDBClient({
            region,
            credentials: {
                accessKeyId: keyId,
                secretAccessKey: secretKey,
            }
        });

        const docClient = DynamoDBDocumentClient.from(client);

        const command = new QueryCommand({
            TableName: usersTable,
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :pk',
            ExpressionAttributeValues: { ':pk': 'ROLE#ADMIN' },
            Limit: 1,
        });

        const result = await docClient.send(command);

        return NextResponse.json({
            success: true,
            count: result.Count,
            region,
            table: usersTable,
            envStatus,
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            name: error.name,
            envStatus,
        }, { status: 500 });
    }
}
