import { NextResponse, NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import ImageKit from 'imagekit';
import pool from '@/lib/db';

// Define the ImageKit response type
interface ImageKitResponse {
  url: string;
  fileId: string;
  name: string;
  size: number;
  filePath: string;
  tags?: string[];
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT ?? '',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const wineId = formData.get('wineId');
    
    if (!file || !wineId || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const user = (request as any).user;
    const userId = user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const client = await pool.connect();
    try {
      // Begin transaction
      await client.query('BEGIN');

      // Delete any existing photo for this wine/user combination
      await client.query(
        'DELETE FROM wine_photos WHERE wine_id = $1 AND user_id = $2',
        [wineId, userId]
      );

      // Upload new photo to ImageKit
      const uploadResult = await imagekit.upload({
        file: buffer,
        fileName: file instanceof File ? file.name : `wine_${wineId}_${Date.now()}.jpg`,
        folder: `/wine-photos/${userId}/${wineId}`,
        useUniqueFileName: true,
        tags: [`wine_${wineId}`, `user_${userId}`],
      });

      // Insert new photo record
      await client.query(
        'INSERT INTO wine_photos (wine_id, user_id, image_url, created_at) VALUES ($1, $2, $3, NOW())',
        [wineId, userId, uploadResult.url]
      );

      // Commit transaction
      await client.query('COMMIT');
      
      return NextResponse.json({ url: uploadResult.url });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}); 