'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface PhotoViewerPhoto {
  url: string;
  fileId: string;
}

interface PhotoViewerProps {
  photos: PhotoViewerPhoto[];
  wineName: string;
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SWIPE_THRESHOLD_PX = 48;

export function PhotoViewer({
  photos,
  wineName,
  initialIndex,
  open,
  onOpenChange,
}: PhotoViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) setIndex(Math.min(Math.max(initialIndex, 0), Math.max(photos.length - 1, 0)));
  }, [open, initialIndex, photos.length]);

  if (!photos.length) return null;

  const photo = photos[index] ?? photos[0];
  const canGoPrev = index > 0;
  const canGoNext = index < photos.length - 1;

  const goPrev = () => {
    if (canGoPrev) setIndex((current) => current - 1);
  };

  const goNext = () => {
    if (canGoNext) setIndex((current) => current + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 top-0 left-0 z-110 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black p-0 shadow-none sm:max-w-none data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goPrev();
          } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            goNext();
          }
        }}
      >
        <DialogTitle className="sr-only">Photos of {wineName}</DialogTitle>
        <DialogDescription className="sr-only">
          Photo {index + 1} of {photos.length}. Use arrow keys or swipe to browse.
        </DialogDescription>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          aria-label="Close photo viewer"
          className="absolute top-2 right-2 z-20 size-11 text-white hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" />
        </Button>

        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-12 pt-14 pb-16"
          onTouchStart={(event) => {
            touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const startX = touchStartXRef.current;
            const endX = event.changedTouches[0]?.clientX;
            touchStartXRef.current = null;
            if (startX == null || endX == null) return;

            const delta = endX - startX;
            if (delta > SWIPE_THRESHOLD_PX) goPrev();
            else if (delta < -SWIPE_THRESHOLD_PX) goNext();
          }}
        >
          <Image
            key={photo.fileId}
            src={photo.url}
            alt={`Photo ${index + 1} of ${wineName}`}
            fill
            sizes="100vw"
            unoptimized
            className="object-contain"
            priority
          />

          {photos.length > 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canGoPrev}
                onClick={goPrev}
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 z-10 size-11 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="size-7" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canGoNext}
                onClick={goNext}
                aria-label="Next photo"
                className="absolute top-1/2 right-2 z-10 size-11 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="size-7" />
              </Button>
            </>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <p className="rounded-full bg-black/55 px-3 py-1 text-sm text-white/90 tabular-nums">
            {index + 1} / {photos.length}
          </p>
          {photos.length > 1 ? (
            <div className="pointer-events-auto flex items-center gap-1.5">
              {photos.map((item, dotIndex) => (
                <button
                  key={item.fileId}
                  type="button"
                  onClick={() => setIndex(dotIndex)}
                  aria-label={`Go to photo ${dotIndex + 1}`}
                  aria-current={dotIndex === index}
                  className={
                    dotIndex === index
                      ? 'size-2 rounded-full bg-white'
                      : 'size-2 rounded-full bg-white/35 transition-colors hover:bg-white/60'
                  }
                />
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
