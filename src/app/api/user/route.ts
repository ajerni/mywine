import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    // An expired or tampered token must read as 401 so the client logs out
    // rather than treating it as a server fault.
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, username, email, created_at, has_proaccount FROM wine_users WHERE id = $1',
      [decoded.userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error loading current user:', error);
    return NextResponse.json({ error: 'Could not load the current user' }, { status: 500 });
  } finally {
    client.release();
  }
}
