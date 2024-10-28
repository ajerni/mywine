import { NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';
import { NextRequest } from 'next/server';

export const GET = authMiddleware(async (request: NextRequest) => {
  try {
    // Extract wineId from the URL
    const wineId = request.url.split('/').pop();
    if (!wineId) {
      return NextResponse.json({ error: 'Wine ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    // @ts-ignore
    const userId = request.user.userId;
    
    const result = await client.query(
      'SELECT image_url FROM wine_photos WHERE wine_id = $1 AND user_id = $2 ORDER BY created_at DESC',
      [parseInt(wineId), userId]
    );
    
    client.release();
    
    return NextResponse.json({
      photos: result.rows.map(row => row.image_url)
    });
  } catch (error) {
    console.error('Error fetching wine photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}); 