import { NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';
import { NextRequest } from 'next/server';

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://mywine-git-images-ajernis-projects.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export const GET = authMiddleware(async (request: NextRequest) => {
  try {
    // Extract wineId from the URL
    const wineId = request.url.split('/').pop();
    if (!wineId) {
      return NextResponse.json(
        { error: 'Wine ID is required' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const client = await pool.connect();
    // Type assertion for user from middleware
    const user = (request as any).user;
    const userId = user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify wine belongs to user first
    const wineCheck = await client.query(
      'SELECT id FROM wine_table WHERE id = $1 AND user_id = $2',
      [parseInt(wineId), userId]
    );

    if (wineCheck.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Wine not found or not owned by user' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    const result = await client.query(
      'SELECT image_url FROM wine_photos WHERE wine_id = $1 AND user_id = $2 ORDER BY created_at DESC',
      [parseInt(wineId), userId]
    );
    
    client.release();
    
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