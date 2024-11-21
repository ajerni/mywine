import { NextResponse, NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const { wine_id, rating } = await request.json();
    
    // Validate input
    if (!wine_id || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid input: rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');

      // Update wine rating
      const result = await client.query(
        'UPDATE wine_table SET rating = $1 WHERE id = $2 RETURNING *',
        [rating, wine_id]
      );

      if (result.rowCount === 0) {
        throw new Error('Wine not found');
      }

      // Commit transaction
      await client.query('COMMIT');
      
      return NextResponse.json(result.rows[0]);
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating wine rating:', error);
    return NextResponse.json(
      { error: 'Failed to update wine rating' },
      { status: 500 }
    );
  }
});

// Optional: Add GET method to fetch rating for a specific wine
export const GET = authMiddleware(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const wine_id = url.searchParams.get('wine_id');

    if (!wine_id) {
      return NextResponse.json(
        { error: 'Wine ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT rating FROM wine_table WHERE id = $1',
        [wine_id]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'Wine not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ rating: result.rows[0].rating });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching wine rating:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wine rating' },
      { status: 500 }
    );
  }
}); 