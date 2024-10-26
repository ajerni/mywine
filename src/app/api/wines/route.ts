// CRUD for wines

import { NextResponse, NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';
import { Wine } from '@/app/wine-cellar/types';

export const GET = authMiddleware(async (request: NextRequest) => {
  try {
    const client = await pool.connect();
    // @ts-ignore
    const userId = request.user.userId;

    const result = await client.query(`
      SELECT w.*, wn.note_text
      FROM wine_table w
      LEFT JOIN wine_notes wn ON w.id = wn.wine_id
      WHERE w.user_id = $1
    `, [userId]);
    
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Error fetching wines:', err);
    return NextResponse.json({ error: 'Failed to fetch wines' }, { status: 500 });
  }
});

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const wine: Omit<Wine, 'id' | 'user_id'> = await request.json();
    const client = await pool.connect();
    
    // @ts-ignore
    const userId = request.user.userId;

    const result = await client.query(
      'INSERT INTO wine_table (name, producer, grapes, country, region, year, price, quantity, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [wine.name, wine.producer, wine.grapes, wine.country, wine.region, wine.year, wine.price, wine.quantity, userId]
    );
    
    client.release();
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('Error adding wine:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const PUT = authMiddleware(async (request: NextRequest) => {
  try {
    const wine: Wine = await request.json();
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE wine_table SET name = $1, producer = $2, grapes = $3, country = $4, region = $5, year = $6, price = $7, quantity = $8 WHERE id = $9 RETURNING *',
      [wine.name, wine.producer, wine.grapes, wine.country, wine.region, wine.year, wine.price, wine.quantity, wine.id]
    );
    client.release();
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Wine not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const DELETE = authMiddleware(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Wine ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    // @ts-ignore
    const userId = request.user.userId;

    const result = await client.query('DELETE FROM wine_table WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    client.release();

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Wine not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Wine deleted successfully' });
  } catch (err) {
    console.error('Error deleting wine:', err);
    return NextResponse.json({ error: 'Failed to delete wine' }, { status: 500 });
  }
});
