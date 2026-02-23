import { NextRequest } from 'next/server';
import { getUserById } from '@/lib/dynamodb';
import { rateLimit } from '@/lib/rate-limit';

export interface AdminAuthResult {
    success: boolean;
    admin?: any;
    error?: string;
    status?: number;
}

// Efficient admin verification without excessive Cognito calls
export async function verifyAdminAccess(request: NextRequest): Promise<AdminAuthResult> {
    const userId = request.cookies.get('user_id')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    const accessToken = request.cookies.get('access_token')?.value;

    // Rate limiting per user
    if (userId) {
        const { allowed } = rateLimit(`admin:${userId}`, 30, 60000); // 30 requests per minute
        if (!allowed) {
            return { 
                success: false, 
                error: 'Too many requests. Please wait.', 
                status: 429 
            };
        }
    }

    // Quick cookie validation
    if (!accessToken || userRole !== 'ADMIN' || !userId) {
        return { 
            success: false, 
            error: 'Admin access required', 
            status: 403 
        };
    }

    try {
        // Get admin from DynamoDB (faster than Cognito)
        const admin = await getUserById(userId);
        if (!admin || admin.role !== 'ADMIN') {
            return { 
                success: false, 
                error: 'Admin not found', 
                status: 404 
            };
        }

        return { success: true, admin };
    } catch (error) {
        console.error('Admin verification error:', error);
        return { 
            success: false, 
            error: 'Authentication failed', 
            status: 500 
        };
    }
}