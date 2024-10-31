import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';

const FASTAPI_URL = 'https://fastapi.mywine.info/getaisummary';

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const { wine_id, wine_name, wine_producer } = await request.json();
    
    // Get token from the incoming request
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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
  }
}); 