"use client"

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wine } from './types';
import { Upload, X, Loader2 } from "lucide-react"
import Image from 'next/image';
import { toast } from 'react-toastify';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface PhotoGalleryModalProps {
  wine: Wine;
  onClose: () => void;
  onNoteUpdate: (wineId: number, newNote: string) => void;
  userId: number;
  closeParentModal: () => void;
}

interface WinePhoto {
  url: string;
  fileId: string;
}

export function PhotoGalleryModal({ wine, onClose, onNoteUpdate, userId, closeParentModal }: PhotoGalleryModalProps) {
  const [winePhotos, setWinePhotos] = useState<WinePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoForDeletion, setSelectedPhotoForDeletion] = useState<WinePhoto | null>(null);

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

  const handlePhotoTaken = (newPhoto: WinePhoto) => {
    setWinePhotos(prev => [newPhoto, ...prev]);
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

    setIsUploading(true);

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

      const { url, fileId } = await response.json();
      handlePhotoTaken({ url, fileId });
      
      toast.success('Photo uploaded successfully', {
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onClose();
    closeParentModal();
  };

  const handlePhotoClick = (photo: WinePhoto) => {
    setSelectedPhotoForDeletion(photo);
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhotoForDeletion) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/deletesinglephoto?fileId=${selectedPhotoForDeletion.fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      setWinePhotos(prev => prev.filter(photo => photo.fileId !== selectedPhotoForDeletion.fileId));
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    } finally {
      setSelectedPhotoForDeletion(null);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={handleClose}>
        <DialogContent className="max-w-[90%] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-semibold">
              Photos of {wine.name}
            </DialogTitle>
            <button
              onClick={handleClose}
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
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Picture
                  </>
                )}
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
                  <div 
                    key={index} 
                    className="relative aspect-square cursor-pointer group"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <Image
                      src={photo.url}
                      alt={`Wine photo ${index + 1}`}
                      fill
                      className="object-cover rounded-lg transition-opacity group-hover:opacity-75"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-8 w-8 text-white bg-red-500 rounded-full p-1" />
                    </div>
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

      {selectedPhotoForDeletion && (
        <DeleteConfirmationModal
          title="Delete Photo"
          message="Are you sure you want to delete this photo?"
          onConfirm={handleDeletePhoto}
          onCancel={() => setSelectedPhotoForDeletion(null)}
        />
      )}
    </>
  );
}