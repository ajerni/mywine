import pool from '@/lib/db';

/**
 * ImageKit's list/search index lags behind deletes (sometimes for a long time).
 * Client-side Sets only help the browser that performed the delete, so we persist
 * deletions and filter them out of every device's listing.
 *
 * Schema is owned by the database — create/alter tables manually, not from app code.
 */

export async function recordDeletedPhoto(fileId: string, wineId?: number | null): Promise<void> {
  await pool.query(
    `INSERT INTO deleted_imagekit_files (file_id, wine_id)
     VALUES ($1, $2)
     ON CONFLICT (file_id) DO NOTHING`,
    [fileId, wineId ?? null],
  );
}

export async function getDeletedPhotoIds(fileIds: string[]): Promise<Set<string>> {
  if (!fileIds.length) return new Set();

  const result = await pool.query<{ file_id: string }>(
    `SELECT file_id FROM deleted_imagekit_files WHERE file_id = ANY($1::text[])`,
    [fileIds],
  );
  return new Set(result.rows.map((row) => row.file_id));
}
