"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wine } from './types'

interface WineDetailsModalProps {
  wine: Wine
  onClose: () => void
}

export function WineDetailsModal({ wine, onClose }: WineDetailsModalProps) {
  const [notes, setNotes] = useState<string>('')

  const handleSaveNotes = () => {
    // TODO: Implement saving notes functionality
    console.log('Saving notes:', notes)
    // After saving, you might want to close the modal
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{wine.name}</DialogTitle>
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
            >
              Save notes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
