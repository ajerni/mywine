'use client';

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface EmptyNameFieldModalProps {
  onClose: () => void;
}

export function EmptyNameFieldModal({ onClose }: EmptyNameFieldModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg mx-auto w-[95%] sm:w-full px-6">
        <DialogTitle className="text-lg font-semibold px-4 pt-4">
          Please enter a name for the wine
        </DialogTitle>
        
        <div className="px-4">
          <p className="text-base mt-2 text-muted-foreground">
            The Name field cannot be empty.
          </p>
        </div>
        
        <div className="flex justify-center px-4 pb-4 mt-4">
          <Button
            onClick={onClose}
            className="w-24"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 