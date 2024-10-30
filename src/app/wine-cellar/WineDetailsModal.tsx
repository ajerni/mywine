"use client"

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wine } from './types'
import { toast } from 'react-toastify'
import { X, Camera, Sparkles, Save, Upload } from "lucide-react"
import { CameraModal } from './CameraModal'
import Image from 'next/image';
import { PhotoGalleryModal } from './PhotoGalleryModal';

interface WineDetailsModalProps {
  wine: Wine
  onClose: () => void
  onNoteUpdate: (wineId: number, newNote: string) => void
  userId: number
}

export function WineDetailsModal({ wine, onClose, onNoteUpdate, userId }: WineDetailsModalProps) {
  const [notes, setNotes] = useState<string>(wine.note_text || '')
  const [isSaving, setIsSaving] = useState(false)
  const [canFocusTextarea, setCanFocusTextarea] = useState(false)
  const dialogContentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showCamera, setShowCamera] = useState(false);
  const [winePhotos, setWinePhotos] = useState<string[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [showPictureOptions, setShowPictureOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);

  useEffect(() => {
    setNotes(wine.note_text || '')
    
    // Focus on the title and scroll to top when modal opens
    if (titleRef.current) {
      titleRef.current.focus()
    }
    
    // For mobile devices, ensure the modal content is scrolled to top
    if (dialogContentRef.current) {
      setTimeout(() => {
        dialogContentRef.current?.scrollTo(0, 0)
      }, 100)
    }

    // Allow textarea focus after a short delay
    const timer = setTimeout(() => {
      setCanFocusTextarea(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [wine.note_text])

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoadingPhotos(true);
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
        console.log('Fetched photos:', data);
        setWinePhotos(data.photos || []);
      } catch (error) {
        console.error('Error fetching photos:', error);
        toast.error('Failed to load photos');
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    fetchPhotos();
  }, [wine.id]);

  const handleSaveNotes = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          note_text: notes,
          wine_id: wine.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save notes')
      }

      onNoteUpdate(wine.id, notes)
      toast.success('Notes saved successfully')
      onClose()
    } catch (error) {
      console.error('Error saving notes:', error)
      toast.error('Failed to save notes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Close the picture options dialog
    setShowPictureOptions(false);

    try {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // 10MB max size
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('wineId', wine.id.toString());

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const uploadToast = toast.loading('Uploading photo...');

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

      const { url } = await uploadResponse.json();
      handlePhotoTaken(url);
      toast.update(uploadToast, {
        render: 'Photo uploaded successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
    }
  };

  const handlePhotoTaken = (imageUrl: string) => {
    console.log('New photo taken:', imageUrl);
    setWinePhotos(prev => [...prev, imageUrl]);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent 
          ref={dialogContentRef}
          className="sm:max-w-[425px]"
        >
          <div className="flex items-center justify-between mb-4">
            <DialogTitle 
              ref={titleRef}
              tabIndex={-1}
              className="outline-none text-xl font-semibold"
            >
              {wine.name}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors outline-none focus:outline-none focus:ring-0"
              aria-label="Close dialog"
            >
              <X className="h-6 w-6 text-black" />
            </button>
          </div>

          {/* Moved Photos section here */}
          {winePhotos.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Photos:</h3>
                <Button
                  onClick={() => setShowPhotoGallery(true)}
                  variant="outline"
                  size="sm"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Photos
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {winePhotos.slice(0, 4).map((photo, index) => (
                  <div key={index} className="relative w-full h-32">
                    <Image
                      src={photo}
                      alt={`Wine photo ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover rounded"
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-2 py-2">
            <div className="grid grid-cols-4 items-center gap-2">
              <span className="font-bold">Producer:</span>
              <span className="col-span-3">{wine.producer}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <span className="font-bold">Grapes:</span>
              <span className="col-span-3">{wine.grapes}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <span className="font-bold">Country:</span>
              <span className="col-span-3">{wine.country}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <span className="font-bold">Region:</span>
              <span className="col-span-3">{wine.region}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <span className="font-bold">Year:</span>
              <span className="col-span-3">{wine.year}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <span className="font-bold">Price:</span>
              <span className="col-span-3">{wine.price}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <span className="font-bold">Quantity:</span>
              <span className="col-span-3">{wine.quantity}</span>
            </div>
            <div className="grid gap-2 mt-2">
              <span className="font-bold text-green-500">Notes:</span>
              <textarea
                className="w-full border rounded min-h-[140px] resize-y p-2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your tasting notes here..."
                tabIndex={canFocusTextarea ? 0 : -1}
                aria-hidden={!canFocusTextarea}
              />
              <div className="space-y-2">
                <Button 
                  onClick={handleSaveNotes} 
                  className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white"
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save notes'}
                </Button>
                <Button
                  onClick={() => {/* TODO: Implement AI summary functionality */}}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  type="button"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Summary
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keep the rest of the modals */}
      {/* Picture Options Dialog */}
      <Dialog open={showPictureOptions} onOpenChange={setShowPictureOptions}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogTitle className="text-xl font-semibold mb-4">
            Add Picture
          </DialogTitle>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                setShowPictureOptions(false);
                setShowCamera(true);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <Button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload from Gallery
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
              onClick={(e) => {
                // Reset the input value to allow selecting the same file again
                (e.target as HTMLInputElement).value = '';
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {showCamera && (
        <CameraModal
          onClose={() => setShowCamera(false)}
          wineId={wine.id}
          wineName={wine.name}
          userId={userId}
          onPhotoTaken={handlePhotoTaken}
        />
      )}

      {showPhotoGallery && (
        <PhotoGalleryModal
          wine={wine}
          onClose={() => setShowPhotoGallery(false)}
          onNoteUpdate={onNoteUpdate}
          userId={userId}
        />
      )}
    </>
  )
}