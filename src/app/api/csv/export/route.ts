import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';
import { stringify } from 'csv-stringify/sync';

export const GET = authMiddleware(async (request: NextRequest) => {
  const client = await pool.connect();
  try {
    // @ts-ignore - user is added by authMiddleware
    const userId = request.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Fetch all wine data including notes and AI summaries
    const result = await client.query(`
      SELECT 
        wt.id::text AS wine_id,
        wt.name AS wine_name,
        wt.producer,
        wt.grapes,
        wt.country,
        wt.region,
        wt.year::text AS year,
        wt.price::text AS price,
        wt.quantity::text AS quantity,
        wt.bottle_size::text AS bottle_size,
        wn.note_text,
        was.summary AS ai_summary
      FROM 
        wine_table wt
      LEFT JOIN 
        wine_notes wn ON wt.id = wn.wine_id
      LEFT JOIN 
        wine_aisummaries was ON wt.id = was.wine_id
      WHERE 
        wt.user_id = $1
      ORDER BY 
        wt.id
    `, [userId]);

    // Convert to CSV with all fields as strings
    const csv = stringify(result.rows, {
      header: true,
      columns: [
        'wine_id',
        'wine_name',
        'producer',
        'grapes',
        'country',
        'region',
        'year',
        'price',
        'quantity',
        'bottle_size',
        'note_text',
        'ai_summary'
      ]
    });

    // Return CSV as a downloadable file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=wine-cellar-export-${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  } finally {
    client.release();
  }
}); 