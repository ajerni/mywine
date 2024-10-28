'use client';

import { Wine } from './types';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationModalProps {
  wine: Wine;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({ wine, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="fixed left-1/2 -translate-x-1/2 sm:translate-x-0 sm:relative sm:left-0 sm:max-w-md mx-6 sm:mx-auto rounded-lg max-w-[calc(100%-48px)]">
        <DialogTitle className="text-lg sm:text-xl font-semibold px-4 sm:px-6 pt-4 sm:pt-6">
          Confirm Deletion
        </DialogTitle>
        
        <div className="px-4 sm:px-6">
          <p className="text-base sm:text-lg mt-2 text-muted-foreground">
            Are you sure you want to delete &quot;{wine.name}&quot;?
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 px-4 sm:px-6 pb-4 sm:pb-6 mt-4">
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={onConfirm}
          >
            Delete
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
