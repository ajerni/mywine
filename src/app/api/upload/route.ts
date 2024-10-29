import { NextResponse, NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import { ImageKitClient } from 'imagekitio-next';
import pool from '@/lib/db';
import crypto from 'crypto';

if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 
    !process.env.IMAGEKIT_PRIVATE_KEY || 
    !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  throw new Error('Missing required ImageKit environment variables');
}

const imagekit = new ImageKitClient({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  transformationPosition: 'path',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// Helper function to generate authentication parameters
function getAuthenticationParameters() {
  const token = crypto.randomBytes(32).toString('hex');
  const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY!;
  
  const signatureString = `${token}${expire}`;
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(signatureString)
    .digest('hex');

  return { token, expire, signature };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const wineId = formData.get('wineId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Convert File to base64 for ImageKit
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Get authentication parameters
    const { token, expire, signature } = getAuthenticationParameters();

    // Upload to ImageKit with authentication parameters
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: file.name,
      folder: `/wine-photos/${wineId}`,
      useUniqueFileName: true,
      token,
      expire,
      signature,
    });

    // Get user from middleware
    const user = (request as any).user;
    const userId = user?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Save to database
    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO wine_photos (wine_id, user_id, image_url, file_id) VALUES ($1, $2, $3, $4)',
        [wineId, userId, uploadResponse.url, uploadResponse.fileId]
      );
    } finally {
      client.release();
    }

    return NextResponse.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500, headers: corsHeaders }
    );
  }
}); 