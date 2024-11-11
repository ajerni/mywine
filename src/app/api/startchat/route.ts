import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';

const FASTAPI_URL = 'https://fastapi.mywine.info/chat';

// Add this interface to extend NextRequest
interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number;
    // Add other user properties if needed
  };
}

interface ChatRequest {
  message: string;
  user_id: number;
}

interface FastAPIResponse {
  message: string;
  status: 'success' | 'error';
}

export const POST = authMiddleware(async (request: AuthenticatedRequest) => {
  try {
    const { message } = await request.json();
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user_id = request.user?.userId;
    
    if (!user_id) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    const chatRequest: ChatRequest = {
      message,
      user_id
    };

    console.log('Sending request to FastAPI:', { user_id, messageLength: message.length });

    const response = await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(chatRequest),
    });

    if (!response.ok) {
      console.error('FastAPI error:', {
        status: response.status,
        statusText: response.statusText,
      });
      const errorData = await response.json().catch(() => ({}));
      console.error('FastAPI error details:', errorData);
      return NextResponse.json(
        { error: 'FastAPI request failed', details: errorData },
        { status: response.status }
      );
    }

    const data: FastAPIResponse = await response.json();
    console.log('FastAPI response:', { status: data.status, hasMessage: !!data.message });

    if (data.status === 'success' && data.message) {
      return NextResponse.json(data);
    } else {
      console.error('Invalid FastAPI response:', data);
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}); 