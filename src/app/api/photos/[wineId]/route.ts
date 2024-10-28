import { NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';
import { NextRequest } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Update this to your actual domain in production
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export const GET = authMiddleware(async (request: NextRequest) => {
  try {
    const wineId = request.url.split('/').pop();
    console.log('Fetching photos for wine:', wineId);

    if (!wineId) {
      return NextResponse.json(
        { error: 'Wine ID is required' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const client = await pool.connect();
    const user = (request as any).user;
    const userId = user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    // Log the query parameters
    console.log('Query params:', { wineId, userId });

    const result = await client.query(
      'SELECT image_url FROM wine_photos WHERE wine_id = $1 AND user_id = $2 ORDER BY created_at DESC',
      [parseInt(wineId), userId]
    );
    
    client.release();
    
    console.log('Query result:', result.rows);
    
    return NextResponse.json({
      photos: result.rows.map(row => row.image_url)
    }, { 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Error fetching wine photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}); 