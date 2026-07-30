import { NextResponse } from 'next/server';
import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth';
import pool from '@/lib/db';

export const POST = authMiddleware(async (request: AuthenticatedRequest) => {
  try {
    const { firstName, lastName, email, subject, message } = await request.json();
    
    const user = request.user;
    const userId = user?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO wine_contact 
        (user_id, first_name, last_name, email, subject, message) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id`,
        [userId, firstName, lastName, email, subject, message]
      );

      return NextResponse.json({ 
        success: true,
        id: result.rows[0].id,
        message: 'Contact form submitted successfully' 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to submit contact form' 
    }, { status: 500 });
  }
}); 