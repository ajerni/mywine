"use client"

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wine } from './types'
import { toast } from 'react-toastify'
import { X, Sparkles, Save, ChevronDown, ChevronUp, Camera } from "lucide-react"
import { PhotoGalleryModal } from './PhotoGalleryModal';
import Image from 'next/image';
import { AiSummaryModal } from './AiSummaryModal';
import { BOTTLE_SIZES } from './bottle_sizes'

interface WineDetailsModalProps {
  wine: Wine
  onClose: () => void
  onNoteUpdate: (wineId: number, newNote: string) => void
  onAiSummaryUpdate: (wineId: number, newSummary: string) => void
  userId: number
  onEdit: (wine: Wine) => void
  onDelete: (wine: Wine) => void
}

interface WinePhoto {
  url: string;
  fileId: string;
}

export function WineDetailsModal({ wine, onClose, onNoteUpdate, onAiSummaryUpdate, userId, onEdit, onDelete }: WineDetailsModalProps) {
  const [notes, setNotes] = useState<string>(wine.note_text ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [canFocusTextarea, setCanFocusTextarea] = useState(false)
  const dialogContentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [winePhotos, setWinePhotos] = useState<WinePhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>(wine.ai_summary ?? '')
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setNotes(wine.note_text ?? '')
    
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
      toast.success('Notes saved successfully', { autoClose: 1000 })
    } catch (error) {
      console.error('Error saving notes:', error)
      toast.error('Failed to save notes', { autoClose: 1000 })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    setWinePhotos(prev => [...prev, { url: imageUrl, fileId: Date.now().toString() }]);
  };

  const handleGetAiSummary = async () => {
    setShowAiSummary(true);
    setIsLoadingAiSummary(true);
    setAiSummaryError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/getaisummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          wine_id: wine.id,
          wine_name: wine.name,
          wine_producer: wine.producer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI summary');
      }

      const data = await response.json();
      setAiSummary(data.summary);
      onAiSummaryUpdate(wine.id, data.summary);
    } catch (error) {
      console.error('Error getting AI summary:', error);
      setAiSummaryError(error instanceof Error ? error.message : 'Failed to generate summary');
    } finally {
      setIsLoadingAiSummary(false);
    }
  };

  return (
    <Dialog open={true} modal={true} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent 
        ref={dialogContentRef}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl mx-auto rounded-lg bg-white shadow-lg ios-safe-height"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          height: 'calc(100vh - 180px)',
          overflowY: 'auto',
          width: '90vw',
          maxWidth: '42rem',
          margin: '0 auto',
          zIndex: 101,
          borderRadius: '0.5rem',
          WebkitOverflowScrolling: 'touch',
          padding: '0',
        }}
      >
        {/* Fixed header sections wrapper */}
        <div className="sticky top-0 z-[100] bg-white border-b shadow-sm">
          {/* Title Section */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle 
                ref={titleRef}
                tabIndex={-1}
                className="outline-none text-xl font-semibold"
              >
                <span>{wine.name}{wine.year ? ` ${wine.year}` : ''}</span>
              </DialogTitle>
              <button
                onClick={onClose}
                className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors outline-none focus:outline-none focus:ring-0"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="px-6 py-3">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onClose();
                  onEdit(wine);
                }}
                className="bg-green-500 hover:bg-green-600 text-white flex-1"
              >
                Edit
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  onDelete(wine);
                }}
                variant="destructive"
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Main content with proper padding to account for fixed header */}
        <div className="px-6 pt-4 pb-6">
          <div className="grid gap-6 sm:gap-4">
            {/* Details Section */}
            <div className="border rounded-lg p-4">
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="outline"
                size="sm"
                className="text-gray-500 hover:text-gray-600 mb-4"
              >
                {showDetails ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                {showDetails ? 'Hide details' : 'Show details'}
              </Button>

              {/* Animated collapsible details section */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-[500px]' : 'max-h-0'}`}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {wine.producer && (
                    <>
                      <span className="text-gray-500">Producer:</span>
                      <span>{wine.producer}</span>
                    </>
                  )}
                  {wine.grapes && (
                    <>
                      <span className="text-gray-500">Grapes:</span>
                      <span>{wine.grapes}</span>
                    </>
                  )}
                  {wine.country && (
                    <>
                      <span className="text-gray-500">Country:</span>
                      <span>{wine.country}</span>
                    </>
                  )}
                  {wine.region && (
                    <>
                      <span className="text-gray-500">Region:</span>
                      <span>{wine.region}</span>
                    </>
                  )}
                  {wine.year && (
                    <>
                      <span className="text-gray-500">Year:</span>
                      <span>{wine.year}</span>
                    </>
                  )}
                   {wine.bottle_size && (
                    <>
                      <span className="text-gray-500">Bottle Size:</span>
                      <span>
                        {wine.bottle_size ? 
                          BOTTLE_SIZES.find(size => Math.abs(size.value - wine.bottle_size!) < 0.001)?.text || `${wine.bottle_size}L`
                          : '-'
                        }
                      </span>
                    </>
                  )}
                  {wine.price && (
                    <>
                      <span className="text-gray-500">Price:</span>
                      <span>${wine.price}</span>
                    </>
                  )}
                 
                  <span className="text-gray-500">Quantity:</span>
                  <span>{wine.quantity || 0}</span>
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div className="border-2 border-blue-500 rounded-lg p-4">
              {winePhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {winePhotos.slice(0, 4).map((photo, index) => (
                    <div key={photo.fileId} className="relative w-full h-32">
                      <Image
                        src={photo.url}
                        alt={`Wine photo ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover rounded"
                        priority={index === 0}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        onError={(e) => {
                          console.error('Error loading image:', photo.url);
                          // Optionally set a fallback image
                          (e.target as HTMLImageElement).src = '/placeholder-wine.jpg';
                        }}
                        // Add these parameters to optimize ImageKit URLs
                        quality={75}
                        unoptimized={true} // Disable Next.js optimization since ImageKit handles it
                      />
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPhotoGallery(true);
                }}
                type="button"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 sm:h-10"
              >
                <Camera className="mr-2 h-4 w-4" />
                Photos
              </Button>
            </div>

            {/* Notes Section */}
            <div className="border-2 border-green-500 rounded-lg p-4">
              <span className="font-bold text-green-500">Own notes:</span>
              <div className="relative mt-2">
                <textarea
                  className="w-full border rounded min-h-[140px] resize-y p-4 pr-[70px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your tasting notes here..."
                  tabIndex={canFocusTextarea ? 0 : -1}
                  aria-hidden={!canFocusTextarea}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 px-2 py-1"
                  onClick={() => navigator.clipboard.writeText(notes)}
                >
                  copy
                </Button>
              </div>
              <Button 
                onClick={handleSaveNotes} 
                className="w-full bg-green-500 hover:bg-green-600 text-white h-12 sm:h-10 mt-4"
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save notes'}
              </Button>
            </div>
              
            {/* AI Summary Section */}
            <div className="border-2 border-purple-500 rounded-lg p-4">
              <span className="font-bold text-purple-500">AI summary:</span>
              <div className="relative mt-2">
                <textarea
                  className="w-full border rounded min-h-[140px] resize-y p-4 pr-[70px]"
                  value={aiSummary}
                  disabled
                  placeholder="AI-generated summary will appear here..."
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 px-2 py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.clipboard.writeText(aiSummary);
                  }}
                  type="button"
                >
                  copy
                </Button>
              </div>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGetAiSummary();
                }}
                type="button"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white h-12 sm:h-10 mt-4"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Summary
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {showPhotoGallery && (
        <PhotoGalleryModal
          wine={wine}
          onClose={() => setShowPhotoGallery(false)}
          onNoteUpdate={onNoteUpdate}
          userId={userId}
          closeParentModal={onClose}
        />
      )}

      {showAiSummary && (
        <AiSummaryModal
          isOpen={showAiSummary}
          onClose={() => setShowAiSummary(false)}
          summary={aiSummary}
          isLoading={isLoadingAiSummary}
          error={aiSummaryError}
          wineName={wine.name}
        />
      )}
    </Dialog>
  )
}