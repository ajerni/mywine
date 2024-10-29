import { NextResponse, NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import { ImageKitClient } from 'imagekitio-next';
import pool from '@/lib/db';

// Initialize ImageKit client with proper type checking
if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 
    !process.env.IMAGEKIT_PRIVATE_KEY || 
    !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  throw new Error('Missing required ImageKit environment variables');
}

// Initialize ImageKit with all required parameters
const imagekit = new ImageKitClient({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  transformationPosition: 'path',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://mywine-git-images-ajernis-projects.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
} as const;

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Function to get ImageKit authentication parameters
async function getImageKitAuthParams() {
  const authResponse = await fetch('http://localhost:3000/api/imagekit-auth');
  if (!authResponse.ok) {
    throw new Error('Failed to get ImageKit authentication parameters');
  }
  return authResponse.json();
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
    const base64Image = buffer.toString('base64');

    // Get ImageKit authentication parameters
    const authParams = await getImageKitAuthParams();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Upload image to ImageKit with authentication parameters
      const uploadResult = await imagekit.upload({
        file: base64Image,
        fileName: file instanceof File ? file.name : `wine_${wineId}_${Date.now()}.jpg`,
        folder: `/wine-photos/${userId}/${wineId}`,
        useUniqueFileName: true,
        tags: [`wine_${wineId}`, `user_${userId}`],
        signature: authParams.signature,
        token: authParams.token,
        expire: authParams.expire,
      });

      if (!uploadResult || typeof uploadResult !== 'object') {
        throw new Error('Invalid upload response');
      }

      const { url, fileId } = uploadResult as { url: string; fileId: string };

      // Insert new photo record with all required fields
      await client.query(
        `INSERT INTO wine_photos 
         (wine_id, user_id, image_url, image_id, imagekit_file_id) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          wineId, 
          userId, 
          url, 
          fileId,
          fileId
        ]
      );

      await client.query('COMMIT');
      
      return NextResponse.json({
        url,
        fileId
      }, { headers: corsHeaders });

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