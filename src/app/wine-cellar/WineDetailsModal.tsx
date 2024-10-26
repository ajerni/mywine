"use client"

import { useState, ChangeEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wine } from './types'

interface WineDetailsModalProps {
  wine: Wine
  onClose: () => void
}

export function WineDetailsModal({ wine, onClose }: WineDetailsModalProps) {
  const [notes, setNotes] = useState('')

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{wine.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Producer:</span>
            <span className="col-span-3">{wine.producer || ''}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Grapes:</span>
            <span className="col-span-3">{wine.grapes || ''}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Country:</span>
            <span className="col-span-3">{wine.country || ''}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Region:</span>
            <span className="col-span-3">{wine.region || ''}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Year:</span>
            <span className="col-span-3">{wine.year || ''}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Price:</span>
            <span className="col-span-3">{wine.price || ''}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Quantity:</span>
            <span className="col-span-3">{wine.quantity}</span>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="notes" className="font-bold">
            Notes:
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            placeholder="Add your tasting notes here..."
            className="w-full h-24 p-2 border border-gray-300 rounded-md"
          />
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
