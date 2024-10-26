import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request: Request) {
  // Authenticate user...
  // If authentication is successful:
  const token = 'generated_token_here';
  const user = { id: 1, username: 'example' };

  // Set the token as an HTTP-only cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 3600, // 1 hour
    path: '/',
  };

  const cookie = serialize('token', token, cookieOptions);

  return NextResponse.json(
    { user },
    {
      status: 200,
      headers: { 'Set-Cookie': cookie },
    }
  );
}
