import { NextResponse, NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';

// Add CORS headers for consistency
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
    // Type assertion for user from middleware
    const user = (request as any).user;
    const userId = user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, username, email FROM wine_users WHERE id = $1', 
      [userId]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(result.rows[0], { headers: corsHeaders });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Failed to get current user' }, 
      { status: 500, headers: corsHeaders }
    );
  }
});
