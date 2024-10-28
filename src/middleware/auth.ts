import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

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

      const decoded = await verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      // Create a new request object with the user data
      const requestWithUser = request.clone();
      // @ts-ignore -- Safe to ignore as we're adding a custom property
      requestWithUser.user = decoded;
      
      return handler(requestWithUser);
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
