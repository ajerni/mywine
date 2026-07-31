import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth';
import { recordDeletedPhoto } from '@/lib/deleted-photos';
import { assertWineOwnedByUser, deleteWinePhotoByFileId } from '@/lib/wine-photos';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

function errorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error && 'statusCode' in error) {
    return Number((error as { statusCode?: number }).statusCode);
  }
  return undefined;
}

export const DELETE = authMiddleware(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user?.userId;
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const wineIdParam = searchParams.get('wineId');
    const wineId = wineIdParam ? Number(wineIdParam) : NaN;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }
    if (!Number.isFinite(wineId) || wineId <= 0) {
      return NextResponse.json({ error: 'Wine ID is required' }, { status: 400 });
    }

    if (!(await assertWineOwnedByUser(wineId, userId))) {
      return NextResponse.json(
        { error: 'Wine not found or unauthorized' },
        { status: 404 },
      );
    }

    // Record first so other devices never re-surface the file while ImageKit's
    // search index still returns it after deleteFile succeeds.
    await recordDeletedPhoto(fileId, wineId);
    await deleteWinePhotoByFileId(fileId);

    let fileUrl: string | undefined;
    try {
      const details = await imagekit.getFileDetails(fileId);
      fileUrl = details.url;
    } catch (error) {
      if (errorStatus(error) !== 404) {
        // Still attempt deleteFile below; details are only needed for CDN purge.
        console.warn('Could not load file details before delete:', error);
      }
    }

    try {
      await imagekit.deleteFile(fileId);
    } catch (error) {
      // Already gone on ImageKit is still a successful delete from our side.
      if (errorStatus(error) !== 404) throw error;
    }

    if (fileUrl) {
      try {
        await imagekit.purgeCache(fileUrl);
      } catch (error) {
        // CDN purge is best-effort; the media library delete already succeeded.
        console.warn('Could not purge ImageKit CDN cache:', error);
      }
    }

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
});
