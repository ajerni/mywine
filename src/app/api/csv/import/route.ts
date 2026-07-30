import { NextResponse } from 'next/server';
import type { PoolClient } from 'pg';
import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth';
import pool from '@/lib/db';
import { CsvImportError, parseAndValidateCSV, type WineRecord } from '@/lib/services/csv-parser';

/**
 * An import replaces the whole cellar: rows carrying a known wine_id keep their
 * id — and therefore their photo folder — everything else is created, and any
 * wine missing from the file is deleted.
 */
async function replaceCellar(client: PoolClient, userId: number, records: WineRecord[]) {
  const { rows: existing } = await client.query<{ id: number }>(
    'SELECT id FROM wine_table WHERE user_id = $1',
    [userId],
  );
  const existingIds = new Set(existing.map((row) => row.id));
  const keptIds: number[] = [];
  let created = 0;

  for (const record of records) {
    const values = [
      record.wine_name,
      record.producer,
      record.grapes,
      record.country,
      record.region,
      record.year,
      record.price,
      record.quantity,
      record.bottle_size,
      record.rating,
    ];

    let wineId: number;
    if (record.wine_id !== null && existingIds.has(record.wine_id)) {
      wineId = record.wine_id;
      await client.query(
        `UPDATE wine_table
         SET name = $1, producer = $2, grapes = $3, country = $4, region = $5,
             year = $6, price = $7, quantity = $8, bottle_size = $9, rating = $10
         WHERE id = $11 AND user_id = $12`,
        [...values, wineId, userId],
      );
    } else {
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO wine_table
           (name, producer, grapes, country, region, year, price, quantity, bottle_size, rating, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [...values, userId],
      );
      wineId = rows[0].id;
      created += 1;
    }

    keptIds.push(wineId);
    await upsertOrClear(client, 'wine_notes', 'note_text', wineId, record.note_text);
    await upsertOrClear(client, 'wine_aisummaries', 'summary', wineId, record.ai_summary);
  }

  const { rows: removed } = await client.query<{ id: number }>(
    'DELETE FROM wine_table WHERE user_id = $1 AND NOT (id = ANY($2::int[])) RETURNING id',
    [userId, keptIds],
  );

  return { created, updated: records.length - created, removed: removed.map((row) => row.id) };
}

/**
 * A blank cell means the user cleared the note, so it has to delete rather than
 * leave the previous text in place.
 */
async function upsertOrClear(
  client: PoolClient,
  table: 'wine_notes' | 'wine_aisummaries',
  column: 'note_text' | 'summary',
  wineId: number,
  value: string | null,
) {
  if (value === null) {
    await client.query(`DELETE FROM ${table} WHERE wine_id = $1`, [wineId]);
    return;
  }
  await client.query(
    `INSERT INTO ${table} (wine_id, ${column}) VALUES ($1, $2)
     ON CONFLICT (wine_id) DO UPDATE SET ${column} = EXCLUDED.${column}`,
    [wineId, value],
  );
}

export const POST = authMiddleware(async (request: AuthenticatedRequest) => {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  let records: WineRecord[];
  try {
    records = parseAndValidateCSV(await file.text());
  } catch (error) {
    if (error instanceof CsvImportError) {
      return NextResponse.json({ error: 'Import failed', details: error.message }, { status: 400 });
    }
    throw error;
  }

  const client = await pool.connect();
  let result: Awaited<ReturnType<typeof replaceCellar>>;
  try {
    await client.query('BEGIN');
    result = await replaceCellar(client, request.user.userId, records);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed', details: 'The file could not be imported.' },
      { status: 500 },
    );
  } finally {
    client.release();
  }

  // Only once the rows are committed, and never fatal: an orphaned photo folder
  // is a smaller problem than an import that reports failure after succeeding.
  const origin = new URL(request.url).origin;
  const authorization = request.headers.get('Authorization') ?? '';
  await Promise.all(
    result.removed.map((wineId) =>
      fetch(`${origin}/api/deletepicfolder?wineId=${wineId}`, {
        method: 'DELETE',
        headers: { Authorization: authorization },
      }).catch(() => undefined),
    ),
  );

  return NextResponse.json({
    success: true,
    created: result.created,
    updated: result.updated,
    removed: result.removed.length,
  });
});
