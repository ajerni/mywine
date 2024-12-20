import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';
import { parseAndValidateCSV } from '@/lib/services/csv-parser';
import { upsertWineRecord } from '@/lib/services/wine-db';

export const POST = authMiddleware(async (request: NextRequest) => {
  const client = await pool.connect();
  
  try {
    // @ts-ignore -- user is added by authMiddleware
    const userId = request.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse and validate CSV
    const csvText = await file.text();
    const records = parseAndValidateCSV(csvText);

    // Start transaction
    await client.query('BEGIN');

    // Get existing wine IDs
    const { rows: existingWines } = await client.query(
      'SELECT id FROM wine_table WHERE user_id = $1',
      [userId]
    );
    const existingWineIds = new Set(existingWines.map(row => row.id));
    const processedWineIds = new Set<number>();

    // Process records
    for (const record of records) {
      let wineId: number;
      
      // Validate and convert numeric fields - handle both string and number inputs
      const year = record.year && String(record.year).trim() ? parseInt(String(record.year).trim(), 10) : null;
      const price = record.price && String(record.price).trim() ? parseFloat(String(record.price).trim()) : null;
      const quantity = record.quantity ? parseInt(String(record.quantity).trim(), 10) : 0;
      const bottleSize = record.bottle_size && String(record.bottle_size).trim() ? parseFloat(String(record.bottle_size).trim()) : 0.75;
      
      // Modified rating validation: if invalid or out of range (1-5), set to null
      let rating = null;
      if (record.rating && String(record.rating).trim()) {
        const parsedRating = parseInt(String(record.rating).trim(), 10);
        if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
          rating = parsedRating;
        }
      }

      // Validate the conversions when values are present (removed rating check)
      if ((record.year && isNaN(year!)) || 
          (record.price && isNaN(price!)) || 
          (record.quantity && isNaN(quantity)) || 
          (record.bottle_size && isNaN(bottleSize))) {
        throw new Error(`Invalid numeric values in record: ${JSON.stringify(record)}`);
      }

      // Standardize empty string handling for text fields
      const producer = record.producer?.trim() || '';
      const grapes = record.grapes?.trim() || '';
      const country = record.country?.trim() || '';
      const region = record.region?.trim() || '';

      if (record.wine_id && !isNaN(parseInt(String(record.wine_id), 10)) && 
          existingWineIds.has(parseInt(String(record.wine_id), 10))) {
        // Update existing wine using wine_id
        wineId = parseInt(String(record.wine_id), 10);
        await client.query(`
          UPDATE wine_table 
          SET 
            name = $1,
            producer = $2,
            grapes = $3,
            country = $4,
            region = $5,
            year = $6,
            price = $7,
            quantity = $8,
            bottle_size = $9,
            rating = $10
          WHERE id = $11 AND user_id = $12
        `, [
          record.wine_name,
          producer,
          grapes,
          country,
          region,
          year,
          price,
          quantity,
          bottleSize,
          rating,
          wineId,
          userId
        ]);
      } else {
        // Insert new wine
        const { rows } = await client.query(`
          INSERT INTO wine_table (
            name, producer, grapes, country, region, year, 
            price, quantity, bottle_size, rating, user_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `, [
          record.wine_name,
          producer,
          grapes,
          country,
          region,
          year,
          price,
          quantity,
          bottleSize,
          rating,
          userId
        ]);
        wineId = rows[0].id;
      }
      
      processedWineIds.add(wineId);

      // Handle notes and summaries
      if (record.note_text) {
        await client.query(`
          INSERT INTO wine_notes (wine_id, note_text)
          VALUES ($1, $2)
          ON CONFLICT (wine_id) 
          DO UPDATE SET note_text = EXCLUDED.note_text
        `, [wineId, record.note_text]);
      }

      if (record.ai_summary) {
        await client.query(`
          INSERT INTO wine_aisummaries (wine_id, summary)
          VALUES ($1, $2)
          ON CONFLICT (wine_id) 
          DO UPDATE SET summary = EXCLUDED.summary
        `, [wineId, record.ai_summary]);
      }
    }

    // Delete wines that were not in the CSV file
    if (existingWineIds.size > 0) {
      const wineIdsToKeep = Array.from(processedWineIds);
      const wineIdsToDelete = Array.from(existingWineIds).filter(id => !processedWineIds.has(id));
      
      // Delete the wines from the database
      await client.query(`
        DELETE FROM wine_table 
        WHERE user_id = $1 
        AND id NOT IN (${wineIdsToKeep.join(',')})
      `, [userId]);

      // Delete the picture folders for each deleted wine
      const token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
      const host = request.headers.get('host') || 'mywine.info';
      
      await Promise.all(wineIdsToDelete.map(async (wineId) => {
        try {
          const url = `${protocol}://${host}/api/deletepicfolder?wineId=${wineId}`;
          await fetch(url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error(`Failed to delete picture folder for wine ${wineId}:`, error);
        }
      }));
    }

    await client.query('COMMIT');
    
    return NextResponse.json({ 
      success: true,
      message: `Processed ${records.length} records successfully`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Import error:', error);
    
    return NextResponse.json({ 
      error: 'Import failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    
  } finally {
    client.release();
  }
}); 