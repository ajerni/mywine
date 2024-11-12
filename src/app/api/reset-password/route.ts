import { NextResponse } from 'next/server';
import pool from "@/lib/db";
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();
    const client = await pool.connect();

    // Find valid reset token
    const tokenResult = await client.query(
      `SELECT user_id 
       FROM password_reset_tokens 
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const userId = tokenResult.rows[0].user_id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await client.query(
      'UPDATE wine_users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    // Delete used token
    await client.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1',
      [userId]
    );

    client.release();

    return NextResponse.json({ 
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
} 