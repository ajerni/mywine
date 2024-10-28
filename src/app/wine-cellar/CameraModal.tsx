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
      console.log('Requesting camera access...');
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted:', mediaStream.getVideoTracks()[0].label);
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video is loaded
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          console.log('Video stream started');
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
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw the current video frame onto the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to base64 image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setIsCapturing(false);
        stopCamera(); // Stop the camera after capturing
        
        console.log('Photo captured successfully'); // Add logging
      }
    } else {
      console.error('Video or canvas reference not available');
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
      // Convert base64 to blob with proper MIME type
      const base64Data = capturedImage.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());

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

      const { url } = await uploadResponse.json();
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
                  onLoadedMetadata={() => {
                    console.log('Video metadata loaded');
                    if (videoRef.current) {
                      console.log('Video dimensions:', {
                        width: videoRef.current.videoWidth,
                        height: videoRef.current.videoHeight
                      });
                    }
                  }}
                  onError={(e) => {
                    console.error('Video error:', e);
                    toast.error('Error displaying camera feed');
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <Button 
                onClick={capturePhoto}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!stream}
              >
                <Camera className="mr-2 h-4 w-4" />
                {stream ? 'Capture Photo' : 'Starting Camera...'}
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