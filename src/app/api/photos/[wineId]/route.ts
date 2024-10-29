import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export const GET = authMiddleware(async (request: NextRequest) => {
  try {
    const wineId = request.url.split('/').pop();
    
    if (!wineId) {
      return NextResponse.json({ error: 'Wine ID is required' }, { status: 400 });
    }

    // List all files in the wine's folder
    const files = await imagekit.listFiles({
      path: `/wines/${wineId}`,
      sort: 'DESC_CREATED'  // Most recent first
    });

    // Extract URLs from the files
    const photos = files.map(file => file.url);

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching wine photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}); 