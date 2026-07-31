import pool from '@/lib/db';

export interface StoredWinePhoto {
  url: string;
  fileId: string;
}

/**
 * Canonical photo records. ImageKit remains the blob store; this table is what
 * the app lists so we are not dependent on ImageKit's laggy search index.
 *
 * Schema is owned by the database — create/alter tables manually, not from app code.
 */

export async function assertWineOwnedByUser(
  wineId: number,
  userId: number,
): Promise<boolean> {
  const result = await pool.query(
    'SELECT id FROM wine_table WHERE id = $1 AND user_id = $2',
    [wineId, userId],
  );
  return result.rows.length > 0;
}

export async function insertWinePhoto(input: {
  wineId: number;
  userId: number;
  url: string;
  fileId: string;
}): Promise<void> {
  const existing = await pool.query(
    'SELECT id FROM wine_photos WHERE imagekit_file_id = $1 LIMIT 1',
    [input.fileId],
  );

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE wine_photos
          SET image_url = $1, wine_id = $2, user_id = $3
        WHERE imagekit_file_id = $4`,
      [input.url, input.wineId, input.userId, input.fileId],
    );
    return;
  }

  await pool.query(
    `INSERT INTO wine_photos
       (wine_id, user_id, image_url, image_id, imagekit_file_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [input.wineId, input.userId, input.url, input.fileId, input.fileId],
  );
}

export async function listWinePhotos(wineId: number): Promise<StoredWinePhoto[]> {
  const result = await pool.query<{ image_url: string; imagekit_file_id: string }>(
    `SELECT image_url, imagekit_file_id
       FROM wine_photos
      WHERE wine_id = $1
      ORDER BY id DESC`,
    [wineId],
  );
  return result.rows.map((row) => ({
    url: row.image_url,
    fileId: row.imagekit_file_id,
  }));
}

export async function deleteWinePhotoByFileId(fileId: string): Promise<void> {
  await pool.query('DELETE FROM wine_photos WHERE imagekit_file_id = $1', [fileId]);
}

export async function deleteWinePhotosForWine(wineId: number): Promise<string[]> {
  const result = await pool.query<{ imagekit_file_id: string }>(
    `DELETE FROM wine_photos WHERE wine_id = $1 RETURNING imagekit_file_id`,
    [wineId],
  );
  return result.rows.map((row) => row.imagekit_file_id);
}
