"use client"

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wine } from './types';
import { Upload, X } from "lucide-react"
import Image from 'next/image';
import { toast } from 'react-toastify';

interface PhotoGalleryModalProps {
  wine: Wine;
  onClose: () => void;
  onNoteUpdate: (wineId: number, newNote: string) => void;
  userId: number;
}

export function PhotoGalleryModal({ wine, onClose, onNoteUpdate, userId }: PhotoGalleryModalProps) {
  const [winePhotos, setWinePhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        const response = await fetch(`/api/photos/${wine.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }

        const data = await response.json();
        setWinePhotos(data.photos || []);
      } catch (error) {
        console.error('Error fetching photos:', error);
        toast.error('Failed to load photos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [wine.id]);

  const handlePhotoTaken = (newPhotoUrl: string) => {
    setWinePhotos(prev => [newPhotoUrl, ...prev]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('wineId', wine.id.toString());

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    const uploadToast = toast.loading('Uploading photo...');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const { url } = await response.json();
      handlePhotoTaken(url);
      
      toast.update(uploadToast, {
        render: 'Photo uploaded successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.update(uploadToast, {
        render: 'Failed to upload photo',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-[90%] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-semibold">
              Photos of {wine.name}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Upload className="mr-2 h-4 w-4" />
                Add Picture
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = '';
                }}
              />
            </div>

            {isLoading ? (
              <div className="text-center py-4">Loading photos...</div>
            ) : winePhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {winePhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={photo}
                      alt={`Wine photo ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No photos yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}