import { Request, Response, NextFunction } from 'express';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 10, windowMs: number = 60000) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const key = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const record = rateLimitMap.get(key);

        if (!record || now > record.resetTime) {
            rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }

        if (record.count >= maxRequests) {
            return res.status(429).json({
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((record.resetTime - now) / 1000),
            });
        }

        record.count++;
        next();
    };
};
