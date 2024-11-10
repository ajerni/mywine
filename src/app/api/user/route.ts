import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const client = await pool.connect();

    const result = await client.query(
      'SELECT id, username, email, created_at, has_proaccount FROM wine_users WHERE id = $1',
      [decoded.userId]
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    // ... existing error handling ...
  }
} 