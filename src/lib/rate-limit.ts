// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
    identifier: string, 
    maxRequests: number = 10, 
    windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const key = identifier;
    
    const current = requestCounts.get(key);
    
    if (!current || now > current.resetTime) {
        // Reset or initialize
        requestCounts.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return { allowed: true, remaining: maxRequests - 1 };
    }
    
    if (current.count >= maxRequests) {
        return { allowed: false, remaining: 0 };
    }
    
    current.count++;
    return { allowed: true, remaining: maxRequests - current.count };
}

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
        if (now > data.resetTime) {
            requestCounts.delete(key);
        }
    }
}, 300000); // Clean every 5 minutes