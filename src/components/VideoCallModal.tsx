
import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  otherUserName: string;
  otherUserPhoto: string;
  isIncoming?: boolean;
}

const VideoCallModal = ({ 
  isOpen, 
  onClose, 
  otherUserName, 
  otherUserPhoto,
  isIncoming = false 
}: VideoCallModalProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(isIncoming);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = () => {
    setIsRinging(false);
    setIsConnected(true);
    toast({
      title: "Call connected",
      description: `You're now on a video call with ${otherUserName}`,
    });
  };

  const handleDecline = () => {
    onClose();
    toast({
      title: "Call declined",
      description: `You declined the call from ${otherUserName}`,
    });
  };

  const handleEndCall = () => {
    onClose();
    toast({
      title: "Call ended",
      description: `Call with ${otherUserName} ended after ${formatTime(callDuration)}`,
    });
  };

  const handleStartCall = () => {
    setIsRinging(true);
    // Simulate call being answered after 3 seconds
    setTimeout(() => {
      setIsRinging(false);
      setIsConnected(true);
      toast({
        title: "Call connected",
        description: `${otherUserName} answered your call`,
      });
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <img
            src={otherUserPhoto}
            alt={otherUserName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{otherUserName}</h3>
            <p className="text-sm opacity-75">
              {isRinging ? (isIncoming ? 'Incoming call...' : 'Calling...') : 
               isConnected ? formatTime(callDuration) : 'Connecting...'}
            </p>
          </div>
        </div>
        
        {!isRinging && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {isConnected ? (
          <div className="w-full h-full relative">
            {/* Main video (other user) */}
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <img
                src={otherUserPhoto}
                alt={otherUserName}
                className="w-32 h-32 rounded-full"
              />
            </div>
            
            {/* Picture in picture (self) */}
            <div className="absolute top-20 right-4 w-24 h-32 bg-gray-700 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
            <div className="text-center text-white">
              <img
                src={otherUserPhoto}
                alt={otherUserName}
                className="w-32 h-32 rounded-full mx-auto mb-6"
              />
              <h2 className="text-2xl font-bold mb-2">{otherUserName}</h2>
              <p className="text-lg opacity-75">
                {isRinging ? (isIncoming ? 'Incoming video call...' : 'Calling...') : 'Connecting...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-4 right-4">
        {isRinging && isIncoming ? (
          // Incoming call controls
          <div className="flex justify-center space-x-8">
            <Button
              onClick={handleDecline}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="h-8 w-8 text-white" />
            </Button>
            <Button
              onClick={handleAnswer}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600"
            >
              <Phone className="h-8 w-8 text-white" />
            </Button>
          </div>
        ) : isRinging && !isIncoming ? (
          // Outgoing call controls
          <div className="flex justify-center">
            <Button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="h-8 w-8 text-white" />
            </Button>
          </div>
        ) : !isConnected && !isRinging ? (
          // Start call button
          <div className="flex justify-center">
            <Button
              onClick={handleStartCall}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600"
            >
              <Video className="h-8 w-8 text-white" />
            </Button>
          </div>
        ) : (
          // In-call controls
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-14 h-14 rounded-full ${isMicOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {isMicOn ? (
                <Mic className="h-6 w-6 text-white" />
              ) : (
                <MicOff className="h-6 w-6 text-white" />
              )}
            </Button>
            
            <Button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="h-8 w-8 text-white" />
            </Button>
            
            <Button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-14 h-14 rounded-full ${isVideoOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {isVideoOn ? (
                <Video className="h-6 w-6 text-white" />
              ) : (
                <VideoOff className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallModal;
