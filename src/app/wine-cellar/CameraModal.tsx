"use client"

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Image as ImageIcon, RotateCcw, X } from "lucide-react"
import { toast } from 'react-toastify'

interface CameraModalProps {
  onClose: () => void;
  wineId: number;
  wineName: string;
  userId: number;
  onPhotoTaken: (imageUrl: string) => void;
}

export function CameraModal({ onClose, wineId, wineName, userId, onPhotoTaken }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera');
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video dimensions
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Flip horizontally if using front camera (optional)
        // context.scale(-1, 1);
        // context.translate(-canvas.width, 0);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8); // Added quality parameter
        setCapturedImage(imageData);
        setIsCapturing(false);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCapturing(true);
    startCamera();
  };

  const savePhoto = async () => {
    if (!capturedImage) return;

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Create form data with consistent naming convention
      const formData = new FormData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `wine_${wineId}_user_${userId}_${timestamp}.jpg`;
      
      formData.append('file', blob, fileName);
      formData.append('wineId', wineId.toString());
      formData.append('userId', userId.toString());

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        onClose();
        return;
      }

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include',
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const { url } = await uploadResponse.json();
      onPhotoTaken(url);
      toast.success('Photo saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save photo');
    }
  };

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-center justify-between mb-4">
          <DialogTitle className="text-xl font-semibold">
            Take a Photo
          </DialogTitle>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6 text-black" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4">
          {isCapturing ? (
            <>
              <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <Button 
                onClick={capturePhoto}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
            </>
          ) : (
            <>
              <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button 
                  onClick={savePhoto}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Save Photo
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 