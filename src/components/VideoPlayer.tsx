
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, X, MessageCircle, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  autoPlay?: boolean;
  muted?: boolean;
  onLike?: () => void;
  onPass?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
  className?: string;
  isLiked?: boolean;
  showControls?: boolean;
}

const VideoPlayer = ({
  videoUrl,
  thumbnailUrl,
  autoPlay = false,
  muted = true,
  onLike,
  onPass,
  onMessage,
  onShare,
  className = '',
  isLiked = false,
  showControls = true
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showPoster, setShowPoster] = useState(!!thumbnailUrl);

  useEffect(() => {
    if (videoRef.current) {
      if (autoPlay) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play was prevented
            setIsPlaying(false);
          });
        }
      }
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.log('Play failed');
          });
        }
      }
      setIsPlaying(!isPlaying);
      setShowPoster(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`relative w-full h-full bg-black rounded-2xl overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={showPoster ? thumbnailUrl : undefined}
        className="w-full h-full object-cover"
        muted={isMuted}
        loop
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setIsPlaying(true);
          setShowPoster(false);
        }}
        onPause={() => setIsPlaying(false)}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Button
            onClick={togglePlay}
            size="lg"
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0"
          >
            <Play className="h-8 w-8 text-white ml-1" />
          </Button>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <>
          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              onClick={toggleMute}
              size="sm"
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 border-0"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-3">
            {onLike && (
              <Button
                onClick={onLike}
                size="sm"
                className={`w-12 h-12 rounded-full ${
                  isLiked 
                    ? 'bg-pink-500 hover:bg-pink-600' 
                    : 'bg-black/50 backdrop-blur-sm hover:bg-black/70'
                } border-0`}
              >
                <Heart className={`h-6 w-6 ${isLiked ? 'text-white fill-current' : 'text-white'}`} />
              </Button>
            )}

            {onPass && (
              <Button
                onClick={onPass}
                size="sm"
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 border-0"
              >
                <X className="h-6 w-6 text-white" />
              </Button>
            )}

            {onMessage && (
              <Button
                onClick={onMessage}
                size="sm"
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 border-0"
              >
                <MessageCircle className="h-6 w-6 text-white" />
              </Button>
            )}

            {onShare && (
              <Button
                onClick={onShare}
                size="sm"
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 border-0"
              >
                <Share className="h-6 w-6 text-white" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
