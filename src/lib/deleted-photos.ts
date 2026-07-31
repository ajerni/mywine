import pool from '@/lib/db';

/**
 * ImageKit's list/search index lags behind deletes (sometimes for a long time).
 * Client-side Sets only help the browser that performed the delete, so we persist
 * deletions and filter them out of every device's listing.
 */
let ensureTablePromise: Promise<void> | null = null;

async function ensureDeletedPhotosTable(): Promise<void> {
  if (!ensureTablePromise) {
    ensureTablePromise = pool
      .query(
        `CREATE TABLE IF NOT EXISTS deleted_imagekit_files (
           file_id TEXT PRIMARY KEY,
           wine_id INTEGER,
           deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
         )`,
      )
      .then(() => undefined)
      .catch((error) => {
        ensureTablePromise = null;
        throw error;
      });
  }
  return ensureTablePromise;
}

export async function recordDeletedPhoto(fileId: string, wineId?: number | null): Promise<void> {
  await ensureDeletedPhotosTable();
  await pool.query(
    `INSERT INTO deleted_imagekit_files (file_id, wine_id)
     VALUES ($1, $2)
     ON CONFLICT (file_id) DO NOTHING`,
    [fileId, wineId ?? null],
  );
}

export async function getDeletedPhotoIds(fileIds: string[]): Promise<Set<string>> {
  if (!fileIds.length) return new Set();

  await ensureDeletedPhotosTable();
  const result = await pool.query<{ file_id: string }>(
    `SELECT file_id FROM deleted_imagekit_files WHERE file_id = ANY($1::text[])`,
    [fileIds],
  );
  return new Set(result.rows.map((row) => row.file_id));
}
