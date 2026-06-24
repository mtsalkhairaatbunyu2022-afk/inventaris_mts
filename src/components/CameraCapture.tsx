/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Image as ImageIcon, X, Check } from 'lucide-react';

interface CameraCaptureProps {
  onImageCaptured: (base64Image: string) => void;
  onClose?: () => void;
  currentImageUrl?: string;
}

export default function CameraCapture({ onImageCaptured, onClose, currentImageUrl }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(currentImageUrl || null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop video stream when unmounted
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    try {
      // Release any active stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Make sure play is triggered
        videoRef.current.play().catch(err => {
          console.error("Video play failed:", err);
        });
      }
    } catch (err: any) {
      console.warn("Camera getUserMedia blocked or unavailable, using native fallback", err);
      setCameraError(
        "Kamera in-app tidak dapat diakses (bisa karena izin browser atau kendala iframe). Jangan khawatir, Anda tetap bisa memotret langsung memakai tombol Kamera HP di bawah!"
      );
      setCameraActive(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    // Restart camera with new facing mode
    setTimeout(() => {
      if (cameraActive) {
        startCamera();
      }
    }, 100);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Match dimensions
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Mirror if user-facing
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Restore canvas state if mirrored
        if (facingMode === 'user') {
          context.setTransform(1, 0, 0, 1, 0, 0);
        }

        // Compress image to 0.7 jpeg quality for lightweight saving (~40kb)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Process standard file uploads / native mobile camera capture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          // Resize uploaded image to keep layout small
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 640;
            const MAX_HEIGHT = 480;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
            setCapturedImage(compressedUrl);
            setCameraError(null);
          };
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    if (capturedImage) {
      onImageCaptured(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm" id="camera_container">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-sans font-medium text-sm text-gray-800 flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-600" />
          Kamera / Pemindai Gambar Aset
        </h3>
        {onClose && (
          <button 
            type="button"
            onClick={() => { stopCamera(); onClose(); }} 
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="relative bg-black rounded-xl overflow-hidden aspect-4/3 flex flex-col items-center justify-center border border-gray-800 min-h-[220px]">
        {/* Canvas for rendering captures */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 1. Live stream if camera active */}
        {cameraActive && !capturedImage && (
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        )}

        {/* 2. Show captured image if exists */}
        {capturedImage && (
          <img src={capturedImage} alt="Captured Aset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        )}

        {/* 3. Empty state (camera not run yet) */}
        {!cameraActive && !capturedImage && (
          <div className="text-center p-6 text-gray-400">
            <ImageIcon className="w-12 h-12 stroke-[1.2] mx-auto mb-2 text-gray-600 animate-pulse" />
            <p className="text-xs max-w-[240px] leading-relaxed mb-4">
              Gunakan kamera untuk memindai barang atau potret langsung kondisi aset.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center justify-center gap-1 bg-emerald-600 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                Nyalakan Kamera In-App
              </button>
            </div>
          </div>
        )}

        {/* Camera warning or fallback details */}
        {cameraError && !capturedImage && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-95 p-4 flex flex-col items-center justify-center text-center">
            <p className="text-amber-400 font-medium text-xs mb-3 max-w-[280px]">
              {cameraError}
            </p>
            <label className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-bold text-xs px-4 py-2.5 rounded-lg transition shadow-md cursor-pointer">
              <Upload className="w-4 h-4" />
              Potret Sekarang (Kamera HP)
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Mini overlays for active camera */}
        {cameraActive && !capturedImage && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
            <button
              type="button"
              onClick={capturePhoto}
              className="w-12 h-12 bg-white rounded-full border-4 border-emerald-500 hover:scale-105 active:scale-95 transition shadow-lg flex items-center justify-center cursor-pointer"
            >
              <span className="w-8 h-8 rounded-full bg-emerald-600" />
            </button>
            
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="w-10 h-10 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full transition flex items-center justify-center shadow-md cursor-pointer"
              title="Putar Kamera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Upload files fallback shown underneath */}
      <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
        <label className="text-xs text-slate-500 text-left">
          Atau unggah gambar yang sudah ada:
        </label>
        <label className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-sans text-xs font-semibold px-2.5 py-1.5 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition rounded-lg cursor-pointer">
          <Upload className="w-3 h-3" />
          Pilih File Gambar
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {capturedImage && (
        <div className="mt-4 flex gap-2 border-t border-gray-200 pt-3">
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white font-sans text-xs font-semibold py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            <Check className="w-4 h-4" />
            Pakai Foto Ini
          </button>
          
          <button
            type="button"
            onClick={handleRetake}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans text-xs font-semibold py-2 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Foto Ulang
          </button>
        </div>
      )}
    </div>
  );
}
