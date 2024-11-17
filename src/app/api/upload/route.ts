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
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle iOS base64 upload
      const { base64Image, wineId, isIOS } = await request.json();
      
      if (!base64Image || !wineId) {
        return NextResponse.json({ error: 'Image data and wine ID are required' }, { status: 400 });
      }

      try {
        // Remove the data:image/jpeg;base64, prefix if present
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Process image with a higher quality for iOS
        const compressedBuffer = await compressImage(buffer, 'image/jpeg', 300); // Increased size limit for iOS
        
        // Generate filename with timestamp to prevent caching issues
        const timestamp = Date.now();
        const fileName = `wine_${wineId}_ios_${timestamp}.jpg`;

        // Upload to ImageKit with explicit content type
        const uploadResponse = await imagekit.upload({
          file: compressedBuffer,
          fileName: fileName,
          folder: `/wines/${wineId}`,
          useUniqueFileName: true,
          responseFields: ['url', 'fileId'],
        });

        return NextResponse.json({
          url: uploadResponse.url,
          fileId: uploadResponse.fileId
        }, { status: 200 });
      } catch (processError) {
        console.error('Error processing iOS image:', processError);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
      }
    } else {
      // Handle regular FormData upload
      const formData = await request.formData();
      const file = formData.get('file') as Blob;
      const wineId = formData.get('wineId') as string;
      
      if (!file || !wineId) {
        return NextResponse.json({ error: 'File and wine ID are required' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const compressedBuffer = await compressImage(buffer, 'image/jpeg');
      
      const timestamp = Date.now();
      const fileName = `wine_${wineId}_${timestamp}.jpg`;

      const uploadResponse = await imagekit.upload({
        file: compressedBuffer,
        fileName: fileName,
        folder: `/wines/${wineId}`,
      });

      return NextResponse.json({
        url: uploadResponse.url,
        fileId: uploadResponse.fileId
      });
    }
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