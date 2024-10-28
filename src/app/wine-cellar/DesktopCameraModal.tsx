import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smartphone } from "lucide-react"

interface DesktopCameraModalProps {
  onClose: () => void;
}

export function DesktopCameraModal({ onClose }: DesktopCameraModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="text-xl font-semibold mb-4">Mobile Feature Only</DialogTitle>
        <div className="flex flex-col items-center gap-4 py-4">
          <Smartphone className="h-16 w-16 text-gray-400" />
          <p className="text-center text-gray-600">
            This feature is only available on mobile devices. Please use your smartphone to take photos of your wines.
          </p>
        </div>
        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
} 