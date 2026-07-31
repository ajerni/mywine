import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth';
import { recordDeletedPhoto } from '@/lib/deleted-photos';
import { assertWineOwnedByUser, deleteWinePhotosForWine } from '@/lib/wine-photos';

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
    const wineIdParam = new URL(request.url).searchParams.get('wineId');
    const wineId = wineIdParam ? Number(wineIdParam) : NaN;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
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

    const removedFileIds = await deleteWinePhotosForWine(wineId);
    await Promise.all(removedFileIds.map((fileId) => recordDeletedPhoto(fileId, wineId)));

    try {
      await imagekit.deleteFolder(`/wines/${wineId}`);
    } catch (error) {
      // No folder yet (wine never had photos) is fine when deleting a wine.
      if (errorStatus(error) !== 404) throw error;
    }

    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
});
