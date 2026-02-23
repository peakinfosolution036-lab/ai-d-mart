import {
    UserRole,
    UserStatus,
    AdminUser,
    CustomerUser,
    User,
    UserSession,
    AdminPermission
} from '@/types';

// Simple hash function (in production, use bcrypt)
export function hashPassword(password: string): string {
    // Simple hash for demo - use bcrypt in production
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `hashed_${Math.abs(hash).toString(16)}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
    return hashPassword(password) === hashedPassword;
}

// Generate session token
export function generateSessionToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Generate user ID
export function generateUserId(role: UserRole): string {
    const prefix = role === UserRole.ADMIN ? 'ADM' : 'DI';
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${num}`;
}

// Create session
export function createSession(userId: string, role: UserRole): UserSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    return {
        id: `sess_${generateSessionToken().substring(0, 16)}`,
        userId,
        role,
        token: generateSessionToken(),
        expiresAt,
        createdAt: now
    };
}

// Validate session
export function isSessionValid(session: UserSession): boolean {
    return new Date() < new Date(session.expiresAt);
}

// Check admin permission
export function hasPermission(admin: AdminUser, permission: AdminPermission): boolean {
    if (admin.isSuperAdmin) return true;
    return admin.permissions.includes(permission);
}

// Default admin permissions by department
export function getDefaultPermissions(department: string): AdminPermission[] {
    const permissionMap: Record<string, AdminPermission[]> = {
        'Super Admin': [AdminPermission.SUPER_ADMIN],
        'User Management': [AdminPermission.MANAGE_USERS, AdminPermission.VIEW_REPORTS],
        'Product Management': [AdminPermission.MANAGE_PRODUCTS, AdminPermission.MANAGE_ORDERS],
        'Marketing': [AdminPermission.MANAGE_EVENTS, AdminPermission.MANAGE_OFFERS],
        'HR': [AdminPermission.MANAGE_JOBS],
        'Finance': [AdminPermission.VIEW_REPORTS, AdminPermission.MANAGE_ORDERS],
        'Operations': [
            AdminPermission.MANAGE_ORDERS,
            AdminPermission.VIEW_REPORTS
        ]
    };
    return permissionMap[department] || [AdminPermission.VIEW_REPORTS];
}
