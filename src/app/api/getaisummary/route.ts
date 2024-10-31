import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';

const FASTAPI_URL = 'https://fastapi.mywine.info/getaisummary';

export const POST = authMiddleware(async (request: NextRequest) => {
  const client = await pool.connect();
  try {
    const { wine_id, wine_name, wine_producer } = await request.json();
    
    // Get token from the incoming request
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // First, verify the wine belongs to the user
    // @ts-ignore
    const userId = request.user.userId;
    const wineCheck = await client.query(
      'SELECT id FROM wine_table WHERE id = $1 AND user_id = $2',
      [wine_id, userId]
    );

    if (wineCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Wine not found or unauthorized' }, { status: 404 });
    }

    // Forward the request to FastAPI service
    const response = await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        wine_id,
        wine_name,
        wine_producer,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate AI summary');
    }

    const data = await response.json();
    
    // Save the summary to the database
    await client.query(
      `INSERT INTO wine_aisummaries (wine_id, summary)
       VALUES ($1, $2)
       ON CONFLICT (wine_id) 
       DO UPDATE SET summary = $2, created_at = CURRENT_TIMESTAMP`,
      [wine_id, data.summary]
    );

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in AI summary generation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  } finally {
    client.release();
  }
}); 