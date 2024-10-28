import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wine } from './types'

interface DeleteConfirmationModalProps {
  wine: Wine;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({ wine, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-left mb-8">
            Are you sure you want to delete "{wine.name}"?
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={onConfirm}
              variant="destructive"
              className="w-24"
            >
              Delete
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-24"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
