"use client"

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wine } from './types'
import { toast } from 'react-toastify'

interface WineDetailsModalProps {
  wine: Wine
  onClose: () => void
  onNoteUpdate: (wineId: number, newNote: string) => void
}

export function WineDetailsModal({ wine, onClose, onNoteUpdate }: WineDetailsModalProps) {
  const [notes, setNotes] = useState<string>(wine.note_text || '')
  const [isSaving, setIsSaving] = useState(false)
  const dialogContentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        ref={dialogContentRef}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle 
            ref={titleRef}
            tabIndex={-1} // Make it focusable but not in tab order
            className="outline-none" // Remove focus outline
          >
            {wine.name}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Producer:</span>
            <span className="col-span-3">{wine.producer}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Grapes:</span>
            <span className="col-span-3">{wine.grapes}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Country:</span>
            <span className="col-span-3">{wine.country}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Region:</span>
            <span className="col-span-3">{wine.region}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Year:</span>
            <span className="col-span-3">{wine.year}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Price:</span>
            <span className="col-span-3">{wine.price}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Quantity:</span>
            <span className="col-span-3">{wine.quantity}</span>
          </div>
          <div className="grid gap-2">
            <span className="font-bold">Notes:</span>
            <textarea
              className="w-full border rounded min-h-[180px] resize-y p-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your tasting notes here..."
            />
            <Button 
              onClick={handleSaveNotes} 
              className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save notes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
