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

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required');
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
        toast.error('Failed to load photos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [wine.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let uploadStartTime = Date.now();
    let photoAdded = false;
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

    try {
      setIsUploading(true);
      
      if (isIOS) {
        const reader = new FileReader();
        
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(file);
        });

        const token = localStorage.getItem('token');
        if (!token) return;

        // Add retry logic for iOS uploads
        const maxRetries = 3;
        let attempt = 0;
        let uploadResponse;

        while (attempt < maxRetries) {
          try {
            uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                base64Image: base64Data,
                wineId: wine.id.toString(),
                fileName: file.name,
                isIOS: true,
                timestamp: uploadStartTime
              }),
            });

            if (uploadResponse.ok) break;
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          } catch (error) {
            console.error(`Upload attempt ${attempt + 1} failed:`, error);
            if (attempt === maxRetries - 1) throw error;
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }

        if (!uploadResponse || !uploadResponse.ok) {
          throw new Error('Failed to upload after multiple attempts');
        }

        const responseText = await uploadResponse.text();
        let parsedData: UploadResponse | null = null;

        try {
          parsedData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Parse error:', parseError, 'Response text:', responseText);
          throw new Error('Failed to parse server response');
        }

        if (parsedData?.url && parsedData?.fileId) {
          // Update photos with retry logic
          let updateAttempt = 0;
          const maxUpdateRetries = 3;
          
          while (updateAttempt < maxUpdateRetries) {
            try {
              setPhotos(prev => {
                const isDuplicate = prev.some(p => p.fileId === parsedData?.fileId);
                if (!isDuplicate) {
                  photoAdded = true;
                  return [...prev, { url: parsedData!.url, fileId: parsedData!.fileId }];
                }
                return prev;
              });

              // Verify the update
              await new Promise(resolve => setTimeout(resolve, 100));
              const photoExists = photos.some(p => p.fileId === parsedData.fileId);
              
              if (photoExists || photoAdded) {
                break;
              }
              
              updateAttempt++;
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (updateError) {
              console.error(`Photo update attempt ${updateAttempt + 1} failed:`, updateError);
              if (updateAttempt === maxUpdateRetries - 1) throw updateError;
              updateAttempt++;
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          if (photoAdded) {
            setHasModifiedPhotos(true);
            // Longer delay for iOS success message
            setTimeout(() => {
              toast.success('Photo uploaded successfully', { autoClose: 3000 });
            }, 1000);

            // Force a re-fetch of photos after upload
            await fetchPhotos();
          }
        }
      } else {
        // Existing non-iOS code
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
      
      if (!isIOS && !photoAdded) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
        toast.error(errorMessage, { autoClose: 2000 });
      }
    } finally {
      if (isIOS) {
        // Longer delay for iOS to ensure UI is stable
        setTimeout(() => {
          setIsUploading(false);
        }, 2000);
      } else {
        setIsUploading(false);
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
      // Close both modals if photos were modified (uploaded or deleted)
      closeParentModal();
    } else {
      // Only close the photo gallery modal if no modifications were made
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