import { NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';

export const GET = authMiddleware(async (request) => {
  try {
    // @ts-ignore
    const userId = request.user.userId;
    const client = await pool.connect();
    const result = await client.query('SELECT id, username, email FROM wine_users WHERE id = $1', [userId]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json({ error: 'Failed to get current user' }, { status: 500 });
  }
});
