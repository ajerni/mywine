"use client"

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wine } from './types'
import { toast } from 'react-toastify'
import { X, Camera, Sparkles, Save, Upload, Image as ImageIcon } from "lucide-react"
import { PhotoGalleryModal } from './PhotoGalleryModal'

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
                  onClick={() => setShowPhotoGallery(true)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  type="button"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  View Photo Gallery
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