"use client"

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Image as ImageIcon, RotateCcw } from "lucide-react"
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
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
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

      // Create form data
      const formData = new FormData();
      const fileName = `wine_${wineId}_${userId}_${Date.now()}.jpg`;
      formData.append('file', blob, fileName);
      formData.append('wineId', wineId.toString());
      formData.append('userId', userId.toString());

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Upload to your API endpoint
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await uploadResponse.json();
      onPhotoTaken(url);
      toast.success('Photo saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error('Failed to save photo');
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
        <DialogTitle className="text-xl font-semibold mb-4">
          Take a Photo
        </DialogTitle>
        <div className="flex flex-col items-center gap-4">
          {isCapturing ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-[3/4] bg-black rounded-lg"
              />
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
              <canvas
                ref={canvasRef}
                className="w-full aspect-[3/4] bg-black rounded-lg"
              />
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