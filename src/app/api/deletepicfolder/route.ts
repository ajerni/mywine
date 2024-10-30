import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export const DELETE = authMiddleware(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const wineId = searchParams.get('wineId');

    if (!wineId) {
      return NextResponse.json({ error: 'Wine ID is required' }, { status: 400 });
    }

    await imagekit.deleteFolder(`/wines/${wineId}`);
    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}); 