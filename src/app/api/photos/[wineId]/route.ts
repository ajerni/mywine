import { NextResponse } from 'next/server';
import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth';
import ImageKit from 'imagekit';
import { getDeletedPhotoIds, recordDeletedPhoto } from '@/lib/deleted-photos';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

async function fileStillExists(fileId: string): Promise<boolean> {
  try {
    await imagekit.getFileDetails(fileId);
    return true;
  } catch {
    return false;
  }
}

export const GET = authMiddleware(async (request: AuthenticatedRequest) => {
  try {
    const wineId = request.url.split('/').pop();

    if (!wineId) {
      return NextResponse.json({ error: 'Wine ID is required' }, { status: 400 });
    }

    const files = await imagekit.listFiles({
      path: `/wines/${wineId}`,
      sort: 'DESC_CREATED',
    });

    // Folders can appear in list results; only real files have a usable fileId/url.
    const listed = files.filter(
      (file): file is typeof file & { fileId: string; url: string } =>
        'fileId' in file && Boolean(file.fileId) && 'url' in file && Boolean(file.url),
    );

    const knownDeleted = await getDeletedPhotoIds(listed.map((file) => file.fileId));

    const survivors = listed.filter((file) => !knownDeleted.has(file.fileId));

    // Heal ghosts deleted before we started persisting IDs: list/search can still
    // return them, but getFileDetails 404s once the asset is actually gone.
    const verified = await Promise.all(
      survivors.map(async (file) => {
        if (await fileStillExists(file.fileId)) {
          return { url: file.url, fileId: file.fileId };
        }
        await recordDeletedPhoto(file.fileId, Number(wineId) || null);
        return null;
      }),
    );

    const photos = verified.filter((photo): photo is { url: string; fileId: string } => photo !== null);

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
