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

    const response = await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(chatRequest),
    });

    const data: FastAPIResponse = await response.json();

    if (data.status === 'success') {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}); 