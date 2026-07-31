import { NextResponse } from 'next/server';
import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth';
import ImageKit from 'imagekit';
import { recordDeletedPhoto } from '@/lib/deleted-photos';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export const DELETE = authMiddleware(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const wineIdParam = searchParams.get('wineId');
    const wineId = wineIdParam ? Number(wineIdParam) : null;

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Record first so other devices never re-surface the file while ImageKit's
    // search index still returns it after deleteFile succeeds.
    await recordDeletedPhoto(fileId, Number.isFinite(wineId) ? wineId : null);

    try {
      await imagekit.deleteFile(fileId);
    } catch (error) {
      // Already gone on ImageKit is still a successful delete from our side.
      const status =
        typeof error === 'object' && error && 'statusCode' in error
          ? Number((error as { statusCode?: number }).statusCode)
          : undefined;
      if (status !== 404) throw error;
    }

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
});
