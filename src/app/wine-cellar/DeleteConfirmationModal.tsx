'use client';

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react";

interface DeleteConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteConfirmationModal({ title, message, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[90vw] max-w-md mx-auto rounded-lg">
        <DialogTitle className="text-lg font-semibold px-4 pt-4">
          {title}
        </DialogTitle>
        
        <div className="px-4">
          <p className="text-base mt-2 text-muted-foreground">
            {message}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 px-4 pb-4 mt-4">
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}