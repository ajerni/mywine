import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    const client = await pool.connect();
    
    const result = await client.query(
      'INSERT INTO wine_users (username, email, password_hash, has_proaccount) VALUES ($1, $2, $3, $4) RETURNING id, username, email, created_at, has_proaccount',
      [username, email, await bcrypt.hash(password, 10), false]
    );

    client.release();

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return NextResponse.json({ token, user });
  } catch (error) {
    // ... existing error handling ...
  }
} 