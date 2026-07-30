'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DetailsSection } from './components/sections/DetailsSection';
import { RatingSection } from './components/sections/RatingSection';
import { PhotosSection } from './components/sections/PhotosSection';
import { NotesSection } from './components/sections/NotesSection';
import { AiSummarySection } from './components/sections/AiSummarySection';
import type { Wine } from './types';

interface WineDetailsModalProps {
  wine: Wine;
  onClose: () => void;
  onEdit: (wine: Wine) => void;
  onDelete: (wine: Wine) => void;
}

export function WineDetailsModal({
  wine,
  onClose,
  onEdit,
  onDelete,
}: WineDetailsModalProps) {
  const subtitle = [wine.producer, wine.region, wine.country]
    .filter(Boolean)
    .join(' · ');

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-2xl grid-rows-[auto_1fr] gap-0 overflow-hidden p-0">
        <DialogHeader className="bg-background border-b px-6 py-4 pr-14 text-left">
          <DialogTitle className="font-display text-2xl leading-tight font-semibold">
            {wine.name}
            {wine.year ? <span className="text-muted-foreground"> {wine.year}</span> : null}
          </DialogTitle>
          <DialogDescription>{subtitle || 'No producer recorded'}</DialogDescription>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(wine)}>
              <Pencil />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(wine)}>
              <Trash2 className="text-destructive" />
              Delete
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-3 overflow-y-auto px-6 py-4">
          <DetailsSection wine={wine} />
          <RatingSection wine={wine} />
          <PhotosSection wine={wine} />
          <NotesSection wine={wine} />
          <AiSummarySection wine={wine} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
