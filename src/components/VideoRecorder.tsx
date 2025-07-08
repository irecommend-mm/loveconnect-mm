
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Square, RotateCcw, Upload, Play, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob, thumbnailBlob: Blob) => void;
  maxDuration?: number; // in seconds
  promptQuestion?: string;
  className?: string;
}

const VideoRecorder = ({ 
  onVideoRecorded, 
  maxDuration = 30, 
  promptQuestion,
  className = '' 
}: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 720, height: 1280 },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);
      
      // Generate thumbnail
      generateThumbnail(videoUrl, (thumbnailBlob) => {
        onVideoRecorded(videoBlob, thumbnailBlob);
      });
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= maxDuration) {
          stopRecording();
        }
        return newTime;
      });
    }, 1000);
  }, [maxDuration, onVideoRecorded]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    stopCamera();
  }, [stopCamera]);

  const generateThumbnail = (videoUrl: string, callback: (blob: Blob) => void) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.currentTime = 1; // Capture at 1 second
    
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) callback(blob);
        }, 'image/jpeg', 0.8);
      }
    };
  };

  const retake = useCallback(() => {
    setRecordedVideo(null);
    setRecordingTime(0);
    startCamera();
  }, [startCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setRecordedVideo(videoUrl);
      
      generateThumbnail(videoUrl, (thumbnailBlob) => {
        onVideoRecorded(file, thumbnailBlob);
      });
    }
  };

  const togglePreview = () => {
    if (previewRef.current) {
      if (isPreviewPlaying) {
        previewRef.current.pause();
      } else {
        previewRef.current.play();
      }
      setIsPreviewPlaying(!isPreviewPlaying);
    }
  };

  React.useEffect(() => {
    if (!recordedVideo) {
      startCamera();
    }
    
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordedVideo, startCamera, stopCamera]);

  return (
    <div className={`bg-black rounded-2xl overflow-hidden ${className}`}>
      {promptQuestion && (
        <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600">
          <p className="text-white font-medium text-center">{promptQuestion}</p>
        </div>
      )}

      <div className="relative aspect-[9/16] bg-black">
        {recordedVideo ? (
          // Preview recorded video
          <div className="relative w-full h-full">
            <video
              ref={previewRef}
              src={recordedVideo}
              className="w-full h-full object-cover"
              onPlay={() => setIsPreviewPlaying(true)}
              onPause={() => setIsPreviewPlaying(false)}
            />
            
            {!isPreviewPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button
                  onClick={togglePreview}
                  size="lg"
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0"
                >
                  <Play className="h-8 w-8 text-white ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Camera view
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Progress bar */}
        {isRecording && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-red-500 transition-all duration-1000"
              style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-black">
        {recordedVideo ? (
          <div className="flex space-x-3">
            <Button
              onClick={retake}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-6">
            {/* Upload button */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <Upload className="h-6 w-6 text-white" />
              </div>
            </label>

            {/* Record button */}
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              className={`w-20 h-20 rounded-full ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white hover:bg-gray-100'
              } border-4 border-white/20`}
            >
              {isRecording ? (
                <Square className="h-8 w-8 text-white" />
              ) : (
                <Camera className="h-8 w-8 text-black" />
              )}
            </Button>

            {/* Placeholder for symmetry */}
            <div className="w-12 h-12" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
