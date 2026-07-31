import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth';
import { getDeletedPhotoIds } from '@/lib/deleted-photos';
import { assertWineOwnedByUser, listWinePhotos } from '@/lib/wine-photos';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

async function listImageKitPhotos(wineId: string) {
  try {
    const files = await imagekit.listFiles({
      path: `/wines/${wineId}`,
      sort: 'DESC_CREATED',
    });

    return files
      .filter(
        (file): file is typeof file & { fileId: string; url: string } =>
          'fileId' in file && Boolean(file.fileId) && 'url' in file && Boolean(file.url),
      )
      .map((file) => ({ url: file.url, fileId: file.fileId }));
  } catch (error) {
    // Missing folder (no photos yet) should look like an empty gallery, not a 500.
    const status =
      typeof error === 'object' && error && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode)
        : undefined;
    if (status === 404) return [];
    throw error;
  }
}

export const GET = authMiddleware(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user?.userId;
    const wineIdParam = request.url.split('/').pop();
    const wineId = Number(wineIdParam);

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

    const stored = await listWinePhotos(wineId);
    const fromImageKit = await listImageKitPhotos(String(wineId));
    const knownDeleted = await getDeletedPhotoIds([
      ...stored.map((photo) => photo.fileId),
      ...fromImageKit.map((photo) => photo.fileId),
    ]);

    // DB is canonical for new uploads. Merge any legacy ImageKit-only files so
    // older bottles keep their photos until they are re-saved or deleted.
    const storedIds = new Set(stored.map((photo) => photo.fileId));
    const photos = [
      ...stored.filter((photo) => !knownDeleted.has(photo.fileId)),
      ...fromImageKit.filter(
        (photo) => !knownDeleted.has(photo.fileId) && !storedIds.has(photo.fileId),
      ),
    ];

    return NextResponse.json(
      { photos },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching wine photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
});
