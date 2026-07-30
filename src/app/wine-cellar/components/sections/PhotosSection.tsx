'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, ImagePlus, Images, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch, errorMessage } from '@/lib/api';
import { beginFilePick, endFilePick } from '@/lib/file-picker-guard';
import {
  fileToDataUrl,
  prepareImageForUpload,
  prefersMobilePhotoUpload,
} from '@/lib/prepare-image-for-upload';
import { DeleteConfirmationModal } from '../../DeleteConfirmationModal';
import { SectionCard } from './SectionCard';
import type { Wine } from '../../types';

interface WinePhoto {
  url: string;
  fileId: string;
}

// ImageKit lists files from a search index that trails writes by a few seconds:
// a deleted photo keeps being listed, a fresh upload is not listed yet. The modal
// unmounts on close, so these module-level records outlive it and patch each
// listing until the index catches up.
const deletedFileIds = new Set<string>();
const pendingUploads = new Map<number, WinePhoto[]>();

function reconcile(wineId: number, listed: WinePhoto[]): WinePhoto[] {
  const indexed = new Set(listed.map((photo) => photo.fileId));
  const pending = (pendingUploads.get(wineId) ?? []).filter(
    (photo) => !indexed.has(photo.fileId) && !deletedFileIds.has(photo.fileId),
  );

  if (pending.length) pendingUploads.set(wineId, pending);
  else pendingUploads.delete(wineId);

  // Newest first, matching the DESC_CREATED order the listing comes back in.
  return [...pending, ...listed.filter((photo) => !deletedFileIds.has(photo.fileId))];
}

async function uploadPreparedImage(file: File, wineId: number): Promise<WinePhoto> {
  // Mobile Safari/WebViews are unreliable with multipart FormData from dialogs;
  // the existing JSON/base64 upload path was already built for that case.
  if (prefersMobilePhotoUpload()) {
    const base64Image = await fileToDataUrl(file);
    return apiFetch<WinePhoto>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ base64Image, wineId }),
    });
  }

  const body = new FormData();
  body.append('file', file);
  body.append('wineId', String(wineId));
  return apiFetch<WinePhoto>('/api/upload', { method: 'POST', body });
}

/** Visually hidden but not display:none — mobile browsers ignore .click() on display:none inputs. */
const visuallyHiddenFileInput = 'sr-only';

export function PhotosSection({ wine }: { wine: Wine }) {
  const [photos, setPhotos] = useState<WinePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<WinePhoto | null>(null);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const activePickIdRef = useRef<number | null>(null);

  useEffect(() => {
    setShowMobileActions(prefersMobilePhotoUpload());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    apiFetch<{ photos?: WinePhoto[] }>(`/api/photos/${wine.id}`)
      .then((data) => {
        if (!cancelled) setPhotos(reconcile(wine.id, data.photos ?? []));
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

  const openPicker = (input: HTMLInputElement | null) => {
    if (!input || isUploading) return;

    const pickId = beginFilePick();
    activePickIdRef.current = pickId;
    input.value = '';
    input.click();

    // User cancelled the system picker: focus returns without a change event.
    const release = () => {
      window.setTimeout(() => {
        if (activePickIdRef.current === pickId) {
          endFilePick(pickId);
          activePickIdRef.current = null;
        }
      }, 800);
    };
    window.addEventListener('focus', release, { once: true });
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    const pickId = activePickIdRef.current;
    // Clear the ref so the focus-return timeout does not end the guard mid-upload.
    activePickIdRef.current = null;

    if (!file) {
      if (pickId !== null) endFilePick(pickId);
      return;
    }

    setIsUploading(true);
    try {
      const prepared = await prepareImageForUpload(file);
      const uploaded = await uploadPreparedImage(prepared, wine.id);
      pendingUploads.set(wine.id, [uploaded, ...(pendingUploads.get(wine.id) ?? [])]);
      setPhotos((prev) => [uploaded, ...prev]);
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not upload the photo.'));
    } finally {
      setIsUploading(false);
      if (pickId !== null) endFilePick(pickId);
    }
  };

  const handleDelete = async () => {
    if (!photoToDelete) return;

    try {
      await apiFetch(`/api/deletesinglephoto?fileId=${photoToDelete.fileId}`, {
        method: 'DELETE',
      });
      deletedFileIds.add(photoToDelete.fileId);
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
                className="absolute top-1 right-1 size-7 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Gallery / library — no capture attribute so the system offers the photo library. */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className={visuallyHiddenFileInput}
        tabIndex={-1}
        onChange={handleUpload}
      />
      {/* Camera — capture forces the camera app on Android / iOS. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={visuallyHiddenFileInput}
        tabIndex={-1}
        onChange={handleUpload}
      />

      {showMobileActions ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => openPicker(cameraInputRef.current)}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <Camera />}
            {isUploading ? 'Uploading…' : 'Take photo'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => openPicker(galleryInputRef.current)}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <Images />}
            {isUploading ? 'Uploading…' : 'Choose photo'}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => openPicker(galleryInputRef.current)}
          disabled={isUploading}
          className="mt-3 w-full"
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {isUploading ? 'Uploading…' : 'Add photo'}
        </Button>
      )}

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
