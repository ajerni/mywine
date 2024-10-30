import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

// Helper function to compress image
async function compressImage(file: Blob, maxSizeKB: number = 150): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = new OffscreenCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        let quality = 0.9;
        let iteration = 0;
        const maxIterations = 10;

        const compress = () => {
          canvas.convertToBlob({ type: 'image/jpeg', quality }).then(blob => {
            if (blob.size > maxSizeKB * 1024 && iteration < maxIterations) {
              quality = Math.max(0.1, quality - 0.1);
              iteration++;
              compress();
            } else {
              resolve(blob);
            }
          });
        };

        compress();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const wineId = formData.get('wineId') as string;
    
    if (!file || !wineId) {
      return NextResponse.json({ error: 'File and wine ID are required' }, { status: 400 });
    }

    // Compress image before upload
    const compressedFile = await compressImage(file);
    const buffer = Buffer.from(await compressedFile.arrayBuffer());
    
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