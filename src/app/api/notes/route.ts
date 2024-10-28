import { NextResponse, NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const { note_text, wine_id } = await request.json();
    
    // Type assertion for user from middleware
    const user = (request as any).user;
    const userId = user?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const client = await pool.connect();
    
    // First, check if the wine belongs to the user
    const wineCheck = await client.query(
      'SELECT id FROM wine_table WHERE id = $1 AND user_id = $2',
      [wine_id, userId]
    );

    if (wineCheck.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Wine not found or not owned by user' }, { status: 404 });
    }

    // Check if a note already exists for this wine
    const existingNote = await client.query(
      'SELECT id FROM wine_notes WHERE wine_id = $1',
      [wine_id]
    );

    let result;
    if (existingNote.rows.length > 0) {
      // Update existing note
      result = await client.query(
        'UPDATE wine_notes SET note_text = $1 WHERE wine_id = $2 RETURNING id',
        [note_text, wine_id]
      );
    } else {
      // Insert new note
      result = await client.query(
        'INSERT INTO wine_notes (note_text, wine_id) VALUES ($1, $2) RETURNING id',
        [note_text, wine_id]
      );
    }
    
    client.release();
    
    return NextResponse.json({ id: result.rows[0].id }, { status: 200 });
  } catch (error) {
    console.error('Error saving note:', error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
});
