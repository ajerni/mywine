import { NextResponse, NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

const ALLOWED_ORIGINS = [
  'https://mywine-git-dashboard-ajernis-projects.vercel.app/*',
  'https://mywine.vercel.app',
  'https://mywine.info/*',
  'https://www.mywine.info/*'
];

// Helper function to check if origin is allowed and return appropriate origin
function getValidOrigin(requestOrigin: string | null) {
  if (!requestOrigin) return ALLOWED_ORIGINS[0];
  return ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
}

// Helper function to add CORS headers
function addCorsHeaders(headers: Headers, origin: string) {
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Credentials', 'true');
  return headers;
}

interface TokenPayload extends JwtPayload {
  userId: number;
  username: string;
}

type RouteHandler = (request: NextRequest) => Promise<NextResponse>;

export function authMiddleware(handler: RouteHandler) {
  return async (request: NextRequest) => {
    try {
      const origin = getValidOrigin(request.headers.get('origin'));

      if (request.method === 'OPTIONS') {
        return NextResponse.json({}, { 
          headers: addCorsHeaders(new Headers(), origin)
        });
      }

      const token = request.headers.get('Authorization')?.split(' ')[1];
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { 
            status: 401,
            headers: addCorsHeaders(new Headers(), origin)
          }
        );
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET!) as unknown as TokenPayload;
        
        const requestWithUser = request.clone();
        // @ts-ignore -- Safe to ignore as we're adding a custom property
        requestWithUser.user = decoded;
        
        const response = await handler(requestWithUser as NextRequest);
        
        // Add CORS headers to the response
        const headers = addCorsHeaders(new Headers(response.headers), origin);

        return new NextResponse(response.body, {
          status: response.status,
          headers
        });

      } catch (jwtError) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { 
            status: 401,
            headers: addCorsHeaders(new Headers(), origin)
          }
        );
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { 
          status: 401,
          headers: addCorsHeaders(new Headers(), request.headers.get('origin') || ALLOWED_ORIGINS[0])
        }
      );
    }
  };
}

export const config = {
  matcher: ['/api/:path*'],
};