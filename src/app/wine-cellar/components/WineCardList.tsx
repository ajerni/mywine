'use client';

import { ChevronRight } from 'lucide-react';

import { BOTTLE_SIZES } from '../bottle_sizes';
import { StarRating } from './StarRating';
import type { Wine } from '../types';

function bottleLabel(size?: number) {
  if (!size) return null;
  const match = BOTTLE_SIZES.find((entry) => Math.abs(entry.value - size) < 0.001);
  return match ? match.text.split(' - ')[0] : `${size} L`;
}

function subtitle(wine: Wine) {
  return [wine.producer, wine.region ?? wine.country].filter(Boolean).join(' · ');
}

export function WineCardList({
  wines,
  onSelect,
}: {
  wines: Wine[];
  onSelect: (wine: Wine) => void;
}) {
  return (
    <ul className="divide-border divide-y lg:hidden">
      {wines.map((wine) => {
        const size = bottleLabel(wine.bottle_size);
        const meta = subtitle(wine);

        return (
          <li key={wine.id}>
            <button
              type="button"
              onClick={() => onSelect(wine)}
              className="hover:bg-secondary/50 active:bg-secondary flex w-full items-center gap-3 px-1 py-4 text-left transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate font-medium">{wine.name}</span>
                  {wine.year && (
                    <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
                      {wine.year}
                    </span>
                  )}
                </div>

                {meta && (
                  <p className="text-muted-foreground mt-0.5 truncate text-sm">{meta}</p>
                )}

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {wine.rating ? (
                    <StarRating rating={wine.rating} readonly size="sm" />
                  ) : null}
                  {size && (
                    <span className="text-muted-foreground text-xs">{size}</span>
                  )}
                  {wine.price ? (
                    <span className="text-muted-foreground text-xs tabular-nums">
                      ${wine.price}
                    </span>
                  ) : null}
                </div>
              </div>

              <span className="bg-secondary text-secondary-foreground shrink-0 rounded-full px-2.5 py-1 text-sm font-medium tabular-nums">
                {wine.quantity ?? 0}
              </span>
              <ChevronRight className="text-muted-foreground size-4 shrink-0" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
