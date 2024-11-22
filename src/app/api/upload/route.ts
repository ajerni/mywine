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
async function compressImage(buffer: Buffer, mimeType: string, isIOS: boolean = false): Promise<Buffer> {
  const maxSizeKB = isIOS ? 300 : 150; // Higher quality for iOS
  let quality = isIOS ? 95 : 90; // Start with higher quality for iOS
  
  // Create sharp instance and automatically rotate based on EXIF orientation
  const sharpInstance = sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .withMetadata({ orientation: undefined }); // Clear orientation after rotating
  
  // Force JPEG for iOS
  const format = isIOS ? 'jpeg' : (mimeType === 'image/png' ? 'png' : 'jpeg');
  
  // First compression attempt
  let compressedBuffer = await sharpInstance[format]({
    quality,
    mozjpeg: true, // Use mozjpeg for better compression
  }).toBuffer();
  
  // Progressive compression if needed
  while (compressedBuffer.length > maxSizeKB * 1024 && quality > 10) {
    quality -= 5; // More gradual quality reduction
    compressedBuffer = await sharp(buffer)
      .rotate()
      .withMetadata({ orientation: undefined })
      [format]({
        quality,
        mozjpeg: true,
      })
      .toBuffer();
  }
  
  return compressedBuffer;
}

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle iOS upload
      const { base64Image, wineId, isIOS } = await request.json();
      
      if (!base64Image || !wineId) {
        return NextResponse.json({ error: 'Image data and wine ID are required' }, { status: 400 });
      }

      try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Use iOS-specific compression settings
        const compressedBuffer = await compressImage(buffer, 'image/jpeg', true);
        
        const timestamp = Date.now();
        const fileName = `wine_${wineId}_ios_${timestamp}.jpg`;

        const uploadResponse = await imagekit.upload({
          file: compressedBuffer,
          fileName,
          folder: `/wines/${wineId}`,
          useUniqueFileName: true,
          responseFields: ['url', 'fileId'],
        });

        return NextResponse.json({
          url: uploadResponse.url,
          fileId: uploadResponse.fileId
        });
      } catch (processError) {
        console.error('Error processing iOS image:', processError);
        return NextResponse.json({ 
          error: processError instanceof Error ? processError.message : 'Failed to process image' 
        }, { status: 500 });
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
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload file' 
    }, { status: 500 });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
}; 