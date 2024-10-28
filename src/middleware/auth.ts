import { NextResponse, NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

interface TokenPayload extends JwtPayload {
  userId: number;
  username: string;
}

// Define a type for the handler function
type RouteHandler = (request: NextRequest) => Promise<NextResponse>;

export function authMiddleware(handler: RouteHandler) {
  return async (request: NextRequest) => {
    try {
      const token = request.headers.get('Authorization')?.split(' ')[1];
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { 
            status: 401,
            headers: {
              'Access-Control-Allow-Origin': 'https://mywine-git-images-ajernis-projects.vercel.app',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Access-Control-Allow-Credentials': 'true',
            }
          }
        );
      }

      try {
        // First verify and cast to unknown, then to our custom type
        const decoded = jwt.verify(token, JWT_SECRET!) as unknown as TokenPayload;
        
        // Create a new request object with the user data
        const requestWithUser = request.clone();
        // @ts-ignore -- Safe to ignore as we're adding a custom property
        requestWithUser.user = decoded;
        
        return handler(requestWithUser as NextRequest);
      } catch (jwtError) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

export const config = {
  matcher: ['/api/:path*'],
};
