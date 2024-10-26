import { NextResponse } from 'next/server';
import { loginUser } from '@/app/api/users/userHandlers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const result = await loginUser(username, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ token: result.token, user: result.user }, { status: result.status });
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
