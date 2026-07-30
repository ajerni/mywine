'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch, errorMessage } from '@/lib/api';
import { DeleteConfirmationModal } from '../../DeleteConfirmationModal';
import { SectionCard } from './SectionCard';
import type { Wine } from '../../types';

interface WinePhoto {
  url: string;
  fileId: string;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function PhotosSection({ wine }: { wine: Wine }) {
  const [photos, setPhotos] = useState<WinePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<WinePhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    apiFetch<{ photos?: WinePhoto[] }>(`/api/photos/${wine.id}`)
      .then((data) => {
        if (!cancelled) setPhotos(data.photos ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load photos.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wine.id]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('Images must be smaller than 10 MB.');
      return;
    }

    const body = new FormData();
    body.append('file', file);
    body.append('wineId', String(wine.id));

    setIsUploading(true);
    try {
      const uploaded = await apiFetch<WinePhoto>('/api/upload', { method: 'POST', body });
      setPhotos((prev) => [...prev, uploaded]);
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not upload the photo.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!photoToDelete) return;

    try {
      await apiFetch(`/api/deletesinglephoto?fileId=${photoToDelete.fileId}`, {
        method: 'DELETE',
      });
      setPhotos((prev) => prev.filter((photo) => photo.fileId !== photoToDelete.fileId));
      toast.success('Photo deleted');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete the photo.'));
    } finally {
      setPhotoToDelete(null);
    }
  };

  return (
    <SectionCard title="Photos">
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-md" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No photos yet — add a shot of the label or the cork.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <li key={photo.fileId} className="group relative aspect-square">
              <Image
                src={photo.url}
                alt={`Photo ${index + 1} of ${wine.name}`}
                fill
                sizes="(max-width: 640px) 33vw, 160px"
                unoptimized
                className="rounded-md object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setPhotoToDelete(photo)}
                aria-label={`Delete photo ${index + 1}`}
                className="absolute top-1 right-1 size-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="mt-3 w-full"
      >
        {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        {isUploading ? 'Uploading…' : 'Add photo'}
      </Button>

      {photoToDelete && (
        <DeleteConfirmationModal
          title="Delete photo"
          message="This photo will be removed permanently."
          onConfirm={handleDelete}
          onCancel={() => setPhotoToDelete(null)}
        />
      )}
    </SectionCard>
  );
}
