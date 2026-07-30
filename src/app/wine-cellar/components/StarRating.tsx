"use client"

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
} as const;

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  className,
}: StarRatingProps) {
  if (readonly) {
    return (
      <div
        className={cn('flex items-center gap-0.5', className)}
        role="img"
        aria-label={rating ? `Rated ${rating} out of 5` : 'Not rated'}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            aria-hidden
            className={cn(
              SIZES[size],
              star <= rating
                ? 'fill-accent text-accent'
                : 'text-muted-foreground/35 fill-none',
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === rating}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onRatingChange?.(star)}
          className="rounded-sm p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              SIZES[size],
              star <= rating
                ? 'fill-accent text-accent'
                : 'text-muted-foreground/35 fill-none',
            )}
          />
        </button>
      ))}
    </div>
  );
}
