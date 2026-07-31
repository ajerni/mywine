'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Expand, ImagePlus, Images, Loader2, Trash2 } from 'lucide-react';
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
import { PhotoViewer } from './PhotoViewer';
import { SectionCard } from './SectionCard';
import type { Wine } from '../../types';

interface WinePhoto {
  url: string;
  fileId: string;
}

// ImageKit's list index lags behind writes. Client maps still give instant UI on
// the device that changed photos; the API also persists rows in wine_photos and
// records deletions so other devices stay in sync.
const deletedFileIds = new Set<string>();
const pendingUploads = new Map<number, WinePhoto[]>();

function reconcile(wineId: number, listed: WinePhoto[]): WinePhoto[] {
  const indexed = new Set(listed.map((photo) => photo.fileId));
  const pending = (pendingUploads.get(wineId) ?? []).filter(
    (photo) => !indexed.has(photo.fileId) && !deletedFileIds.has(photo.fileId),
  );

  if (pending.length) pendingUploads.set(wineId, pending);
  else pendingUploads.delete(wineId);

  // Newest first, matching the DESC_CREATED / created_at order listings use.
  return [...pending, ...listed.filter((photo) => !deletedFileIds.has(photo.fileId))];
}

function forgetPendingUpload(wineId: number, fileId: string) {
  const remaining = (pendingUploads.get(wineId) ?? []).filter(
    (photo) => photo.fileId !== fileId,
  );
  if (remaining.length) pendingUploads.set(wineId, remaining);
  else pendingUploads.delete(wineId);
}

async function uploadPreparedImage(file: File, wineId: number): Promise<WinePhoto> {
  // Prefer JSON/base64 on phones: multipart FormData from in-dialog pickers is
  // unreliable on Mobile Safari / Android WebViews.
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
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
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

    apiFetch<{ photos?: WinePhoto[] }>(`/api/photos/${wine.id}`, { cache: 'no-store' })
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

    if (!Number.isFinite(wine.id) || wine.id <= 0) {
      if (pickId !== null) endFilePick(pickId);
      toast.error('Save the wine before adding photos.');
      return;
    }

    setIsUploading(true);
    try {
      const prepared = await prepareImageForUpload(file);
      const uploaded = await uploadPreparedImage(prepared, wine.id);
      if (!uploaded?.url || !uploaded?.fileId) {
        throw new Error('Upload did not return a saved photo.');
      }
      pendingUploads.set(wine.id, [uploaded, ...(pendingUploads.get(wine.id) ?? [])]);
      setPhotos((prev) => [uploaded, ...prev.filter((photo) => photo.fileId !== uploaded.fileId)]);
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

    const removing = photoToDelete;
    try {
      await apiFetch(
        `/api/deletesinglephoto?fileId=${encodeURIComponent(removing.fileId)}&wineId=${wine.id}`,
        { method: 'DELETE' },
      );
      deletedFileIds.add(removing.fileId);
      forgetPendingUpload(wine.id, removing.fileId);
      setPhotos((prev) => prev.filter((photo) => photo.fileId !== removing.fileId));
      setViewerIndex((current) => {
        if (current === null) return null;
        const nextLength = photos.filter((photo) => photo.fileId !== removing.fileId).length;
        if (nextLength === 0) return null;
        return Math.min(current, nextLength - 1);
      });
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
              <button
                type="button"
                onClick={() => setViewerIndex(index)}
                className="absolute inset-0 overflow-hidden rounded-md focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-hidden"
                aria-label={`View photo ${index + 1} of ${wine.name}`}
              >
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1} of ${wine.name}`}
                  fill
                  sizes="(max-width: 640px) 33vw, 160px"
                  unoptimized
                  className="object-cover"
                />
              </button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setPhotoToDelete(photo)}
                aria-label={`Delete photo ${index + 1}`}
                className="absolute top-1 right-1 z-10 size-7 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
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

      <div className="mt-3 grid gap-2">
        {photos.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setViewerIndex(0)}
            className="w-full"
          >
            <Expand />
            View photos
          </Button>
        ) : null}

        {showMobileActions ? (
          <div className="grid gap-2 sm:grid-cols-2">
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
            className="w-full"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {isUploading ? 'Uploading…' : 'Add photo'}
          </Button>
        )}
      </div>

      <PhotoViewer
        photos={photos}
        wineName={wine.name}
        initialIndex={viewerIndex ?? 0}
        open={viewerIndex !== null}
        onOpenChange={(open) => {
          if (!open) setViewerIndex(null);
        }}
      />

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
