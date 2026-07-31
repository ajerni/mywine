import { NextResponse } from 'next/server';

import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth';
import { cleanupWineMedia } from '@/lib/cleanup-wine-media';
import pool from '@/lib/db';
import { assertWineOwnedByUser } from '@/lib/wine-photos';

export const DELETE = authMiddleware(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user?.userId;
    const wineIdParam = new URL(request.url).searchParams.get('wineId');
    const wineId = wineIdParam ? Number(wineIdParam) : NaN;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    if (!Number.isFinite(wineId) || wineId <= 0) {
      return NextResponse.json({ error: 'Wine ID is required' }, { status: 400 });
    }

    const owns = await assertWineOwnedByUser(wineId, userId);
    if (!owns) {
      // CSV import deletes the wine row first, then cleans media. Allow that
      // orphan path only when the wine is already gone.
      const existing = await pool.query('SELECT 1 FROM wine_table WHERE id = $1 LIMIT 1', [
        wineId,
      ]);
      if (existing.rows.length > 0) {
        return NextResponse.json(
          { error: 'Wine not found or unauthorized' },
          { status: 404 },
        );
      }
    }

    await cleanupWineMedia(wineId, userId);

    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
});
