import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const wineId = formData.get('wineId') as string;
    
    if (!file || !wineId) {
      return NextResponse.json({ error: 'File and wine ID are required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate a timestamp-based filename
    const timestamp = Date.now();
    const fileName = `wine_${wineId}_${timestamp}`;

    // Upload to the wine-specific folder
    const result = await imagekit.upload({
      file: buffer,
      fileName: fileName,
      folder: `/wines/${wineId}`,  // Organize by wine ID
    });

    return NextResponse.json({
      url: result.url,
      fileId: result.fileId
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
}; 