import ImageKit from 'imagekit';

import { recordDeletedPhoto } from '@/lib/deleted-photos';
import { deleteWinePhotosForWine } from '@/lib/wine-photos';

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

/**
 * Remove DB photo rows, tombstone their file ids, and delete the ImageKit
 * `/wines/{wineId}` folder. Safe when the wine row is already gone (CSV import).
 */
export async function cleanupWineMedia(wineId: number, userId: number): Promise<void> {
  const removedFileIds = await deleteWinePhotosForWine(wineId, userId);
  await Promise.all(removedFileIds.map((fileId) => recordDeletedPhoto(fileId, wineId)));

  try {
    await imagekit.deleteFolder(`/wines/${wineId}`);
  } catch (error) {
    // No folder yet (wine never had photos) is fine.
    if (errorStatus(error) !== 404) throw error;
  }
}
