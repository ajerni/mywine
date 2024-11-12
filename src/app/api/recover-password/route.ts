import { NextResponse } from 'next/server';
import pool from "@/lib/db";
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_MYWINE_EMAIL,
    pass: process.env.GOOGLE_MYWINE_APP_PASSWORD
  }
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const client = await pool.connect();

    // Check if user exists
    const userResult = await client.query(
      'SELECT id, username FROM wine_users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'If a user with this email exists, they will receive a password reset link.' },
        { status: 200 } // Return 200 even when user not found to prevent email enumeration
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await client.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $2, expires_at = $3`,
      [userResult.rows[0].id, resetToken, resetTokenExpiry]
    );

    client.release();

    // Send reset email
    const resetUrl = `${request.headers.get('origin')}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: 'mywine.info@gmail.com',
      to: email,
      subject: 'Password Reset Request - MyWine',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Password Reset Request</h2>
          <p>Hello ${userResult.rows[0].username},</p>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p>
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>MyWine.info Team</p>
        </div>
      `
    });

    return NextResponse.json({ 
      message: 'If a user with this email exists, they will receive a password reset link.' 
    });

  } catch (error) {
    console.error('Password recovery error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 