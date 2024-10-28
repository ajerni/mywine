import { NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import ImageKit from 'imagekit';
import pool from '@/lib/db';

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

export const POST = authMiddleware(async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const wineId = formData.get('wineId') as string;
    
    if (!file || !wineId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: '/wine-photos'
    });

    // Store the image reference in your database
    const client = await pool.connect();
    // @ts-ignore
    const userId = request.user.userId;
    
    await client.query(
      'INSERT INTO wine_photos (wine_id, user_id, image_url, image_id) VALUES ($1, $2, $3, $4)',
      [parseInt(wineId), userId, result.url, result.fileId]
    );
    
    client.release();

    return NextResponse.json({ 
      url: result.url,
      fileId: result.fileId 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}); 