import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';
import { parse } from 'csv-parse/sync';

export const POST = authMiddleware(async (request: NextRequest) => {
  const client = await pool.connect();
  try {
    // @ts-ignore - user is added by authMiddleware
    const userId = request.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read and parse CSV
    const csvText = await file.text();
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true
    });

    // Start a transaction
    await client.query('BEGIN');

    try {
      // Get all existing wine IDs for this user
      const existingWinesResult = await client.query(
        'SELECT id FROM wine_table WHERE user_id = $1',
        [userId]
      );
      const existingWineIds = new Set<number>(existingWinesResult.rows.map(row => row.id));
      
      // Track which wines are in the CSV
      const csvWineIds = new Set<number>();

      // Process each record in the CSV
      for (const record of records) {
        let wineId: number;
        const recordWineId = record.wine_id ? parseInt(record.wine_id) : null;
        
        // If wine_id exists and belongs to user, update; otherwise insert
        if (recordWineId && existingWineIds.has(recordWineId)) {
          // Update existing wine
          wineId = recordWineId;
          await client.query(`
            UPDATE wine_table 
            SET name = $1, producer = $2, grapes = $3, country = $4, 
                region = $5, year = $6, price = $7, quantity = $8, 
                bottle_size = $9
            WHERE id = $10 AND user_id = $11
          `, [
            record.wine_name,
            record.producer,
            record.grapes,
            record.country,
            record.region,
            record.year || null,
            record.price || null,
            record.quantity || 0,
            record.bottle_size || null,
            wineId,
            userId
          ]);
        } else {
          // Insert new wine
          const wineResult = await client.query(`
            INSERT INTO wine_table (
              name, producer, grapes, country, region, year, 
              price, quantity, bottle_size, user_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
          `, [
            record.wine_name,
            record.producer,
            record.grapes,
            record.country,
            record.region,
            record.year || null,
            record.price || null,
            record.quantity || 0,
            record.bottle_size || null,
            userId
          ]);
          wineId = wineResult.rows[0].id;
        }

        csvWineIds.add(wineId);

        // Handle notes using UPSERT
        if (record.note_text) {
          await client.query(`
            INSERT INTO wine_notes (wine_id, note_text)
            VALUES ($1, $2)
            ON CONFLICT (wine_id) 
            DO UPDATE SET note_text = EXCLUDED.note_text
          `, [wineId, record.note_text]);
        } else {
          // Delete note if it exists and CSV field is empty
          await client.query(
            'DELETE FROM wine_notes WHERE wine_id = $1',
            [wineId]
          );
        }

        // Handle AI summaries using UPSERT
        if (record.ai_summary) {
          await client.query(`
            INSERT INTO wine_aisummaries (wine_id, summary)
            VALUES ($1, $2)
            ON CONFLICT (wine_id) 
            DO UPDATE SET summary = EXCLUDED.summary
          `, [wineId, record.ai_summary]);
        } else {
          // Delete AI summary if it exists and CSV field is empty
          await client.query(
            'DELETE FROM wine_aisummaries WHERE wine_id = $1',
            [wineId]
          );
        }
      }

      // Delete wines that are not in the CSV
      const existingWineIdsArray = Array.from(existingWineIds);
      for (const existingId of existingWineIdsArray) {
        if (!csvWineIds.has(existingId)) {
          // Delete associated notes and summaries first (if foreign key constraints exist)
          await client.query('DELETE FROM wine_notes WHERE wine_id = $1', [existingId]);
          await client.query('DELETE FROM wine_aisummaries WHERE wine_id = $1', [existingId]);
          await client.query('DELETE FROM wine_table WHERE id = $1 AND user_id = $2', [existingId, userId]);
        }
      }

      // Commit transaction
      await client.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: 'Data imported successfully' 
      });

    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json({ 
      error: 'Failed to import data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    client.release();
  }
}); 