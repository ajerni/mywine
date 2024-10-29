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

interface UploadResponse {
  url: string;
  fileId: string;
}

export function CameraModal({ onClose, wineId, wineName, userId, onPhotoTaken }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsVideoReady(true);
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to access camera');
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
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      toast.error('Camera not ready yet');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    try {
      // Set canvas dimensions to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Draw the current video frame onto the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to base64 image data
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      setCapturedImage(imageData);
      setIsCapturing(false);
      stopCamera();
    } catch (error) {
      console.error('Error during photo capture:', error);
      toast.error('Failed to capture photo');
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
      const base64Data = capturedImage.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());

      const formData = new FormData();
      const timestamp = Date.now();
      const fileName = `wine_${wineId}_${timestamp}`;
      
      formData.append('file', blob, fileName);
      formData.append('wineId', wineId.toString());

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        onClose();
        return;
      }

      toast.info('Uploading photo...');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const { url, fileId }: UploadResponse = await uploadResponse.json();
      
      if (!url.includes('ik.imagekit.io/mywine/wines')) {
        throw new Error('Invalid image URL format received');
      }

      // Save photo details to database
      const savePhotoResponse = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wineId,
          imageUrl: url,
          imageId: fileName,
          imagekitFileId: fileId,
        }),
      });

      if (!savePhotoResponse.ok) {
        const errorData = await savePhotoResponse.json();
        throw new Error(errorData.error || 'Failed to save photo details');
      }

      onPhotoTaken(url);
      toast.success('Photo uploaded successfully');
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
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <Button 
                onClick={capturePhoto}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!stream || !isVideoReady}
              >
                <Camera className="mr-2 h-4 w-4" />
                {!stream ? 'Starting Camera...' : !isVideoReady ? 'Preparing Camera...' : 'Capture Photo'}
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