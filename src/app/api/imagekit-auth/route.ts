import { NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import crypto from 'crypto';

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? '';

export const GET = authMiddleware(async () => {
  try {
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400;
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    return NextResponse.json({
      token,
      expire,
      signature,
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    );
  }
}); 