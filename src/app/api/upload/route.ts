import { NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import ImageKit from 'imagekit';
import pool from '@/lib/db';
import { headers } from 'next/headers';

// Initialize ImageKit with error handling
let imagekit: ImageKit | null = null;
try {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
  });
} catch (error) {
  console.error('Failed to initialize ImageKit:', error);
}

// Configure CORS headers for Vercel deployment
const corsHeaders = {
  'Access-Control-Allow-Origin': '*.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export const POST = authMiddleware(async (request) => {
  // Check if ImageKit is properly initialized
  if (!imagekit) {
    return NextResponse.json(
      { error: 'Image upload service not configured' }, 
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const wineId = formData.get('wineId') as string;
    
    if (!file || !wineId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // @ts-ignore
    const userId = request.user.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify wine belongs to user
    const client = await pool.connect();
    try {
      const wineCheck = await client.query(
        'SELECT id FROM wine_table WHERE id = $1 AND user_id = $2',
        [parseInt(wineId), userId]
      );

      if (wineCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Wine not found or not owned by user' }, 
          { status: 404, headers: corsHeaders }
        );
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to ImageKit
      const uploadResult = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: '/wine-photos',
        useUniqueFileName: true,
        tags: [`wine_${wineId}`, `user_${userId}`]
      });

      // Store the image reference in database
      await client.query(
        'INSERT INTO wine_photos (wine_id, user_id, image_url, image_id) VALUES ($1, $2, $3, $4)',
        [parseInt(wineId), userId, uploadResult.url, uploadResult.fileId]
      );

      return NextResponse.json({ 
        url: uploadResult.url,
        fileId: uploadResult.fileId 
      }, { 
        headers: corsHeaders 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}); 