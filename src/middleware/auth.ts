import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function authMiddleware(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
        try {
            const token = req.headers.get('Authorization')?.split(' ')[1];

            if (!token) {
                return NextResponse.json({ error: 'No token provided' }, { status: 401 });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            // @ts-ignore
            req.user = decoded;
            return handler(req);
        } catch (error) {
            console.error('Auth middleware error:', error);
            if (error instanceof jwt.JsonWebTokenError) {
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            }
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    };
}

export const config = {
    matcher: ['/api/:path*'],
};
