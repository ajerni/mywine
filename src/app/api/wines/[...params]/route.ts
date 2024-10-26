import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import pool from '@/lib/db';

export const GET = authMiddleware(async (req: NextRequest) => {
  try {
    const client = await pool.connect();
    // @ts-ignore
    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const result = await client.query('SELECT * FROM wine_table WHERE user_id = $1', [userId]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching wines:', error);
    return NextResponse.json({ error: 'Failed to fetch wines' }, { status: 500 });
  }
});

export const POST = authMiddleware(async (req: NextRequest) => {
  try {
    const wine = await req.json();
    const client = await pool.connect();
    // @ts-ignore
    const userId = req.user.userId;
    const result = await client.query(
      'INSERT INTO wine_table (name, producer, grapes, country, region, year, price, quantity, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [wine.name, wine.producer, wine.grapes, wine.country, wine.region, wine.year, wine.price, wine.quantity, userId]
    );
    client.release();
    console.log('Wine added:', result.rows[0]); // Add this line for debugging
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding wine:', error);
    return NextResponse.json({ error: 'Failed to add wine' }, { status: 500 });
  }
});

export const PUT = authMiddleware(async (req: NextRequest) => {
  try {
    const wine = await req.json();
    const client = await pool.connect();
    // @ts-ignore
    const userId = req.user.userId;
    const result = await client.query(
      'UPDATE wine_table SET name=$1, producer=$2, grapes=$3, country=$4, region=$5, year=$6, price=$7, quantity=$8 WHERE id=$9 AND user_id=$10 RETURNING *',
      [wine.name, wine.producer, wine.grapes, wine.country, wine.region, wine.year, wine.price, wine.quantity, wine.id, userId]
    );
    client.release();
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Wine not found or not owned by user' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating wine:', error);
    return NextResponse.json({ error: 'Failed to update wine' }, { status: 500 });
  }
});

export const DELETE = authMiddleware(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Wine ID is required' }, { status: 400 });
    }
    const client = await pool.connect();
    // @ts-ignore
    const userId = req.user.userId;
    const result = await client.query('DELETE FROM wine_table WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId]);
    client.release();
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Wine not found or not owned by user' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Wine deleted successfully' });
  } catch (error) {
    console.error('Error deleting wine:', error);
    return NextResponse.json({ error: 'Failed to delete wine' }, { status: 500 });
  }
});
