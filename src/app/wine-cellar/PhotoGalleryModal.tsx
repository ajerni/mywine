"use client"

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wine } from './types';
import { toast } from 'react-toastify';
import { X, Loader2, Upload, Camera } from "lucide-react";
import Image from 'next/image';
import { DeletePhotoConfirmationModal } from './DeletePhotoConfirmationModal';

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

interface UploadResponse {
  url: string;
  fileId: string;
  error?: string;
}

export function PhotoGalleryModal({ wine, onClose, onNoteUpdate, userId, closeParentModal }: PhotoGalleryModalProps) {
  const [photos, setPhotos] = useState<WinePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [hasModifiedPhotos, setHasModifiedPhotos] = useState(false);

  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/photos/${wine.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }

      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPhotos();
  }, [wine.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

      if (isIOS) {
        const reader = new FileReader();
        
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(file);
        });

        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base64Image: base64Data,
            wineId: wine.id,
          }),
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const responseData = await uploadResponse.json();
        if (responseData?.url && responseData?.fileId) {
          setPhotos(prev => [...prev, { url: responseData.url, fileId: responseData.fileId }]);
          setHasModifiedPhotos(true);
          toast.success('Photo uploaded successfully');
        }
      } else {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('wineId', wine.id.toString());

        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const { url, fileId } = await uploadResponse.json();
        setPhotos(prev => [...prev, { url, fileId }]);
        setHasModifiedPhotos(true);
        toast.success('Photo uploaded successfully', { autoClose: 1000 });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
      toast.error(errorMessage, { autoClose: 2000 });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (fileId: string) => {
    setPhotoToDelete(fileId);
  };

  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/deletesinglephoto?fileId=${photoToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      setPhotos(prev => prev.filter(photo => photo.fileId !== photoToDelete));
      setHasModifiedPhotos(true);
      toast.success('Photo deleted successfully', { autoClose: 1000 });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo', { autoClose: 1000 });
    } finally {
      setPhotoToDelete(null);
    }
  };

  const handleClose = () => {
    if (hasModifiedPhotos) {
      closeParentModal();
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={handleClose}>
        <DialogContent 
          className="sm:max-w-[425px] rounded-lg mx-auto w-[95%] sm:w-full px-6 ios-modal-content"
          style={{
            ...((/iPhone|iPad|iPod/.test(navigator.userAgent)) && {
              WebkitTransform: 'translate(-50%, -50%)',
              transform: 'translate(-50%, -50%)',
              maxHeight: '85vh',
              width: '92%',
              maxWidth: '425px',
              left: '50%',
              right: 'auto',
              margin: '0 auto',
              padding: '24px',
              position: 'fixed',
              top: '50%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 20px))'
            })
          }}
        >
          {/* Fixed Header */}
          <div className="ios-modal-header">
            <div className="flex items-center justify-between mb-6 sm:mb-4">
              <DialogTitle className="text-xl font-semibold">
                Photos of {wine.name}
              </DialogTitle>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                variant="ghost"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex justify-end gap-2 mb-6 sm:mb-4">
              <Button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="bg-green-500 hover:bg-green-600 text-white h-12 sm:h-10"
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
                    Upload Photo
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
          </div>

          {/* Scrollable Content */}
          <div className="ios-modal-scroll-content" style={{
            ...((/iPhone|iPad|iPod/.test(navigator.userAgent)) && {
              paddingBottom: 'env(safe-area-inset-bottom, 20px)'
            })
          }}>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No photos yet. Add some pictures!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-4 pb-6">
                {photos.map((photo) => (
                  <div key={photo.fileId} className="relative group">
                    <div className="relative aspect-square">
                      <Image
                        src={photo.url}
                        alt="Wine photo"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <Button
                      onClick={() => handleDeletePhoto(photo.fileId)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <DeletePhotoConfirmationModal
        isOpen={!!photoToDelete}
        onClose={() => setPhotoToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}