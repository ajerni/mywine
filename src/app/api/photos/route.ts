import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const { wineId, imageUrl, imageId, imagekitFileId } = await request.json();
    
    // Type assertion for user from middleware
    const user = (request as any).user;
    const userId = user?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      // First, check if the wine belongs to the user
      const wineCheck = await client.query(
        'SELECT id FROM wine_table WHERE id = $1 AND user_id = $2',
        [wineId, userId]
      );

      if (wineCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Wine not found or not owned by user' }, { status: 404 });
      }

      // Insert the photo record
      const result = await client.query(
        `INSERT INTO wine_photos 
        (wine_id, user_id, image_url, image_id, imagekit_file_id) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id`,
        [wineId, userId, imageUrl, imageId, imagekitFileId]
      );

      return NextResponse.json({ 
        id: result.rows[0].id,
        message: 'Photo saved successfully' 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving photo details:', error);
    return NextResponse.json({ error: 'Failed to save photo details' }, { status: 500 });
  }
}); 