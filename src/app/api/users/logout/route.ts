import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response with cleared cookie
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear any HTTP-only cookies if you're using them
    response.cookies.delete('token');
    
    return response;
  } catch (error) {
    console.error('Logout route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 