"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"

interface AiSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  summary: string | null
  isLoading: boolean
  error: string | null
  wineName: string
}

export function AiSummaryModal({ isOpen, onClose, summary, isLoading, error, wineName }: AiSummaryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg mx-auto w-[95%] sm:w-full px-6">
        <div className="flex items-center justify-between mb-4">
          <DialogTitle className="text-xl font-semibold">
            AI Summary for {wineName}
          </DialogTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="min-h-[150px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm text-gray-500">Generating summary...</p>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : summary ? (
            <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
          ) : (
            <p className="text-gray-500">No summary available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 