import { NextResponse, NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

// The browser sends a bare origin, so these must be scheme + host only —
// entries with a path or wildcard can never match and silently disable CORS.
const ALLOWED_ORIGINS = [
  'https://mywine.info',
  'https://www.mywine.info',
  'https://mywine.vercel.app',
];

/** Same-origin requests send no Origin header and need no CORS headers at all. */
function allowedOrigin(requestOrigin: string | null) {
  return requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : null;
}

function addCorsHeaders(headers: Headers, origin: string | null) {
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return headers;
}

export interface TokenPayload extends JwtPayload {
  userId: number;
  username: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user: TokenPayload;
}

type RouteHandler = (request: AuthenticatedRequest) => Promise<NextResponse>;

export function authMiddleware(handler: RouteHandler) {
  return async (request: NextRequest) => {
    const origin = allowedOrigin(request.headers.get('origin'));

    if (request.method === 'OPTIONS') {
      return NextResponse.json({}, { headers: addCorsHeaders(new Headers(), origin) });
    }

    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: addCorsHeaders(new Headers(), origin) },
      );
    }

    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET!) as TokenPayload;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401, headers: addCorsHeaders(new Headers(), origin) },
      );
    }

    const authenticated = Object.assign(request.clone() as NextRequest, { user: decoded });
    const response = await handler(authenticated);

    return new NextResponse(response.body, {
      status: response.status,
      headers: addCorsHeaders(new Headers(response.headers), origin),
    });
  };
}

export const config = {
  matcher: ['/api/:path*'],
};
