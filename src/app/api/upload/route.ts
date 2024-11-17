import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import ImageKit from 'imagekit';
import sharp from 'sharp';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

// Helper function to compress image using sharp
async function compressImage(buffer: Buffer, mimeType: string, maxSizeKB: number = 150): Promise<Buffer> {
  let quality = 90;
  let compressedBuffer: Buffer;
  
  // Create sharp instance and automatically rotate based on EXIF orientation
  const sharpInstance = sharp(buffer).rotate();
  
  // Get image metadata to check orientation
  const metadata = await sharpInstance.metadata();
  
  // Determine format based on mime type
  const format = mimeType === 'image/png' ? 'png' : 'jpeg';
  
  // First compression attempt with orientation correction
  if (format === 'png') {
    compressedBuffer = await sharpInstance
      .withMetadata({ orientation: undefined })
      .png({ quality })
      .toBuffer();
  } else {
    compressedBuffer = await sharpInstance
      .withMetadata({ orientation: undefined })
      .jpeg({ quality })
      .toBuffer();
  }
  
  // Progressively compress if needed
  while (compressedBuffer.length > maxSizeKB * 1024 && quality > 10) {
    quality -= 10;
    if (format === 'png') {
      compressedBuffer = await sharp(buffer)
        .rotate()
        .withMetadata({ orientation: undefined })
        .png({ quality })
        .toBuffer();
    } else {
      compressedBuffer = await sharp(buffer)
        .rotate()
        .withMetadata({ orientation: undefined })
        .jpeg({ quality })
        .toBuffer();
    }
  }
  
  return compressedBuffer;
}

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const wineId = formData.get('wineId') as string;
    
    if (!file || !wineId) {
      return NextResponse.json({ error: 'File and wine ID are required' }, { status: 400 });
    }

    // Validate mime type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG and PNG images are allowed' }, { status: 400 });
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Compress image before upload
    const compressedBuffer = await compressImage(buffer, file.type);
    
    // Generate a timestamp-based filename with correct extension
    const timestamp = Date.now();
    const extension = file.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `wine_${wineId}_${timestamp}.${extension}`;

    // Upload to the wine-specific folder
    const uploadResponse = await imagekit.upload({
      file: compressedBuffer,
      fileName: fileName,
      folder: `/wines/${wineId}`,
    });

    return NextResponse.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
}; 