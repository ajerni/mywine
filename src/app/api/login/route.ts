import { NextResponse } from 'next/server';
import pool from "@/lib/db";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const client = await pool.connect();

    const result = await client.query(
      'SELECT id, username, email, password_hash, created_at, has_proaccount FROM wine_users WHERE email = $1',
      [email]
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = {
      id: result.rows[0].id,
      username: result.rows[0].username,
      email: result.rows[0].email,
      created_at: result.rows[0].created_at,
      has_proaccount: result.rows[0].has_proaccount
    };

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'An error occurred while logging in' }, { status: 500 });
  }
} 