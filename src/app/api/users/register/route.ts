import { NextResponse } from 'next/server';
import { registerUser } from '@/app/api/users/userHandlers';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();
    const result = await registerUser(username, email, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ message: result.message, user: result.user }, { status: result.status });
  } catch (error) {
    console.error('Registration route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
