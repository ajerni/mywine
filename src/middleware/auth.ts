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
      // Add OPTIONS handling for CORS
      if (request.method === 'OPTIONS') {
        return NextResponse.json({}, { 
          headers: {
            'Access-Control-Allow-Origin': 'https://mywine-git-images-ajernis-projects.vercel.app',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
          }
        });
      }

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
        const decoded = jwt.verify(token, JWT_SECRET!) as unknown as TokenPayload;
        
        // Create a new request object with the user data
        const requestWithUser = request.clone();
        // @ts-ignore -- Safe to ignore as we're adding a custom property
        requestWithUser.user = decoded;
        
        // Call the handler and ensure CORS headers are added to the response
        const response = await handler(requestWithUser as NextRequest);
        
        // Add CORS headers to the response
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', 'https://mywine-git-images-ajernis-projects.vercel.app');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        headers.set('Access-Control-Allow-Credentials', 'true');

        return new NextResponse(response.body, {
          status: response.status,
          headers
        });

      } catch (jwtError) {
        return NextResponse.json(
          { error: 'Invalid token' },
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
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
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
  };
}

export const config = {
  matcher: ['/api/:path*'],
};
