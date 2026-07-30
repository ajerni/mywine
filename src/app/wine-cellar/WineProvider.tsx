'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ApiError, apiFetch, errorMessage } from '@/lib/api';
import { getCurrentUser } from '@/app/auth/authHandlers';
import type { User, Wine } from './types';

export type WineInput = Omit<Wine, 'id' | 'user_id'>;

type Status = 'loading' | 'ready' | 'error';

interface WineContextValue {
  wines: Wine[];
  user: User | null;
  status: Status;
  error: string | null;
  reload: () => Promise<void>;
  addWine: (input: WineInput) => Promise<boolean>;
  updateWine: (id: number, input: WineInput) => Promise<boolean>;
  deleteWine: (wine: Wine) => Promise<boolean>;
  /** Local-only patch for fields owned by their own endpoints (notes, rating, summary). */
  patchWine: (id: number, patch: Partial<Wine>) => void;
}

const WineContext = createContext<WineContextValue | null>(null);

export function useWines() {
  const context = useContext(WineContext);
  if (!context) {
    throw new Error('useWines must be used inside a WineProvider');
  }
  return context;
}

export function WineProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [wines, setWines] = useState<Wine[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    router.push('/login');
  }, [router]);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        handleUnauthorized();
        return;
      }
      setUser(currentUser);
      setWines(await apiFetch<Wine[]>('/api/wines'));
      setStatus('ready');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(errorMessage(err, 'Could not load your wine collection.'));
      setStatus('error');
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  const patchWine = useCallback((id: number, patch: Partial<Wine>) => {
    setWines((prev) =>
      prev.map((wine) => (wine.id === id ? { ...wine, ...patch } : wine)),
    );
  }, []);

  const addWine = useCallback(async (input: WineInput) => {
    // A placeholder id keeps the row keyed and rendered until the server answers.
    const optimisticId = -Date.now();
    setWines((prev) => [...prev, { ...input, id: optimisticId }]);

    try {
      const created = await apiFetch<Wine>('/api/wines', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setWines((prev) =>
        prev.map((wine) => (wine.id === optimisticId ? created : wine)),
      );
      toast.success(`Added ${created.name}`);
      return true;
    } catch (err) {
      setWines((prev) => prev.filter((wine) => wine.id !== optimisticId));
      toast.error(errorMessage(err, 'Could not add the wine.'));
      return false;
    }
  }, []);

  const updateWine = useCallback(async (id: number, input: WineInput) => {
    let snapshot: Wine | undefined;
    setWines((prev) =>
      prev.map((wine) => {
        if (wine.id !== id) return wine;
        snapshot = wine;
        return { ...wine, ...input };
      }),
    );

    try {
      const updated = await apiFetch<Wine>('/api/wines', {
        method: 'PUT',
        body: JSON.stringify({ ...input, id }),
      });
      // The update endpoint does not return the joined note, summary or rating.
      setWines((prev) =>
        prev.map((wine) =>
          wine.id === id
            ? {
                ...updated,
                note_text: wine.note_text,
                ai_summary: wine.ai_summary,
                rating: wine.rating,
              }
            : wine,
        ),
      );
      toast.success(`Saved ${updated.name}`);
      return true;
    } catch (err) {
      if (snapshot) {
        const restored = snapshot;
        setWines((prev) => prev.map((wine) => (wine.id === id ? restored : wine)));
      }
      toast.error(errorMessage(err, 'Could not save your changes.'));
      return false;
    }
  }, []);

  const deleteWine = useCallback(async (wine: Wine) => {
    setWines((prev) => prev.filter((candidate) => candidate.id !== wine.id));

    try {
      await apiFetch(`/api/wines?id=${wine.id}`, { method: 'DELETE' });
      // Photos live in ImageKit with no database link, so they are cleaned up
      // separately. A failure here leaves orphaned files, not a broken cellar.
      apiFetch(`/api/deletepicfolder?wineId=${wine.id}`, { method: 'DELETE' }).catch(
        () => undefined,
      );
      toast.success(`Deleted ${wine.name}`);
      return true;
    } catch (err) {
      setWines((prev) => [...prev, wine]);
      toast.error(errorMessage(err, 'Could not delete the wine.'));
      return false;
    }
  }, []);

  return (
    <WineContext.Provider
      value={{
        wines,
        user,
        status,
        error,
        reload: load,
        addWine,
        updateWine,
        deleteWine,
        patchWine,
      }}
    >
      {children}
    </WineContext.Provider>
  );
}
