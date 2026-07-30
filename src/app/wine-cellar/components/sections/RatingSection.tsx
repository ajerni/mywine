'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { apiFetch, errorMessage } from '@/lib/api';
import { useWines } from '../../WineProvider';
import { StarRating } from '../StarRating';
import { SectionCard } from './SectionCard';
import type { Wine } from '../../types';

export function RatingSection({ wine }: { wine: Wine }) {
  const { patchWine } = useWines();
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (rating: number) => {
    const previous = wine.rating ?? 0;
    patchWine(wine.id, { rating });
    setIsSaving(true);

    try {
      await apiFetch('/api/rating', {
        method: 'POST',
        body: JSON.stringify({ wine_id: wine.id, rating }),
      });
    } catch (error) {
      patchWine(wine.id, { rating: previous });
      toast.error(errorMessage(error, 'Could not save the rating.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard title="Your rating">
      <div className="flex items-center gap-3">
        <StarRating rating={wine.rating ?? 0} onRatingChange={handleChange} size="lg" />
        <span className="text-muted-foreground text-sm" aria-live="polite">
          {isSaving ? 'Saving…' : wine.rating ? `${wine.rating} / 5` : 'Not rated yet'}
        </span>
      </div>
    </SectionCard>
  );
}
