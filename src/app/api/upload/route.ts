import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import sharp from 'sharp';

import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth';
import { assertWineOwnedByUser, insertWinePhoto } from '@/lib/wine-photos';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

async function compressImage(
  buffer: Buffer,
  mimeType: string,
  maxSizeKB: number = 150,
): Promise<Buffer> {
  let quality = 90;
  let compressedBuffer: Buffer;

  const sharpInstance = sharp(buffer).rotate();
  const format = mimeType === 'image/png' ? 'png' : 'jpeg';

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

async function uploadToImageKit(input: {
  buffer: Buffer;
  wineId: number;
  fileName: string;
}) {
  const uploadResponse = await imagekit.upload({
    file: input.buffer,
    fileName: input.fileName,
    folder: `/wines/${input.wineId}`,
    useUniqueFileName: true,
  });

  if (!uploadResponse.url || !uploadResponse.fileId) {
    throw new Error('ImageKit did not return a file id');
  }

  return {
    url: uploadResponse.url,
    fileId: uploadResponse.fileId,
  };
}

export const POST = authMiddleware(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') ?? '';
    let wineId: number;
    let compressedBuffer: Buffer;
    let fileNamePrefix: string;

    if (contentType.includes('application/json')) {
      const { base64Image, wineId: rawWineId } = await request.json();
      wineId = Number(rawWineId);

      if (!base64Image || !Number.isFinite(wineId) || wineId <= 0) {
        return NextResponse.json(
          { error: 'Image data and a valid wine ID are required' },
          { status: 400 },
        );
      }

      const base64Data = String(base64Image).includes('base64,')
        ? String(base64Image).split('base64,')[1]
        : String(base64Image);
      const buffer = Buffer.from(base64Data, 'base64');
      compressedBuffer = await compressImage(buffer, 'image/jpeg', 300);
      fileNamePrefix = `wine_${wineId}_ios`;
    } else {
      const formData = await request.formData();
      const file = formData.get('file');
      const rawWineId = formData.get('wineId');
      wineId = Number(rawWineId);

      if (
        !(file instanceof Blob) ||
        file.size === 0 ||
        !Number.isFinite(wineId) ||
        wineId <= 0
      ) {
        return NextResponse.json(
          { error: 'File and a valid wine ID are required' },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      compressedBuffer = await compressImage(buffer, 'image/jpeg');
      fileNamePrefix = `wine_${wineId}`;
    }

    if (!(await assertWineOwnedByUser(wineId, userId))) {
      return NextResponse.json(
        { error: 'Wine not found or unauthorized' },
        { status: 404 },
      );
    }

    const uploaded = await uploadToImageKit({
      buffer: compressedBuffer,
      wineId,
      fileName: `${fileNamePrefix}_${Date.now()}.jpg`,
    });

    // Persist immediately so listings do not wait on ImageKit's search index.
    await insertWinePhoto({
      wineId,
      userId,
      url: uploaded.url,
      fileId: uploaded.fileId,
    });

    return NextResponse.json(uploaded);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});
