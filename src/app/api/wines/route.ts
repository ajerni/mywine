import { NextResponse } from 'next/server';
import pool from '@/lib/db';

type Wine = {
  id: number;
  name: string;
  producer: string | null;
  grapes: string | null;
  country: string | null;
  region: string | null;
  year: number | null;
  price: number | null;
  quantity: number;
};

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM wine_table');
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Error fetching wines:', err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const wine: Omit<Wine, 'id'> = await request.json();
    console.log('Received wine data:', wine);
    
    const client = await pool.connect();
    console.log('Connected to database');
    
    const result = await client.query(
      'INSERT INTO wine_table (name, producer, grapes, country, region, year, price, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [wine.name, wine.producer, wine.grapes, wine.country, wine.region, wine.year, wine.price, wine.quantity]
    );
    console.log('Query executed successfully');
    
    client.release();
    console.log('Database connection released');
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('Error adding wine:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const client = await pool.connect();
    const result = await client.query('DELETE FROM wine_table WHERE id = $1 RETURNING *', [id]);
    client.release();
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Wine not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Wine deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
