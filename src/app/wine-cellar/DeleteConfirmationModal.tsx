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
      <DialogContent className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[90vw] max-w-md mx-auto rounded-lg">
        <DialogTitle className="text-lg font-semibold px-4 pt-4">
          Confirm Deletion
        </DialogTitle>
        
        <div className="px-4">
          <p className="text-base mt-2 text-muted-foreground">
            Are you sure you want to delete &quot;{wine.name}&quot;?
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 px-4 pb-4 mt-4">
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
