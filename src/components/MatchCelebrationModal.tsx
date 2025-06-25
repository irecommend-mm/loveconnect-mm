
import React, { useEffect } from 'react';
import { Heart, Sparkles, X } from 'lucide-react';
import { User as UserType } from '../types/User';

interface MatchCelebrationModalProps {
  isOpen: boolean;
  matchedUser: UserType;
  currentUserPhoto?: string;
  onChatNow: () => void;
  onContinueBrowsing: () => void;
  onClose: () => void;
}

const MatchCelebrationModal = ({ 
  isOpen, 
  matchedUser, 
  currentUserPhoto,
  onChatNow, 
  onContinueBrowsing,
  onClose 
}: MatchCelebrationModalProps) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/95 via-purple-600/95 to-red-500/95 animate-fade-in">
        {/* Floating Hearts Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Heart className="h-4 w-4 text-white/30 fill-current" />
            </div>
          ))}
        </div>
      </div>

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-sm mx-4 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-20"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center text-white border border-white/20">
          {/* Celebration Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Heart className="h-10 w-10 text-white fill-current" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto">
              <Sparkles className="absolute top-0 right-0 h-6 w-6 text-yellow-300 animate-ping" />
              <Sparkles className="absolute bottom-0 left-0 h-4 w-4 text-yellow-300 animate-ping" style={{ animationDelay: '0.5s' }} />
              <Sparkles className="absolute top-1/2 left-0 h-5 w-5 text-yellow-300 animate-ping" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          {/* Match Text */}
          <h1 className="text-4xl font-bold mb-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            It's a Match!
          </h1>
          <p className="text-lg mb-8 opacity-90 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            You and {matchedUser.name} liked each other
          </p>

          {/* User Photos */}
          <div className="flex justify-center items-center space-x-6 mb-8 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            {/* Current User Photo */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white/50 overflow-hidden bg-gradient-to-br from-pink-400 to-purple-500">
                {currentUserPhoto ? (
                  <img
                    src={currentUserPhoto}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">You</span>
                  </div>
                )}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Heart className="h-4 w-4 text-white fill-current" />
              </div>
            </div>

            {/* Heart in the middle */}
            <div className="flex-shrink-0 animate-pulse">
              <Heart className="h-8 w-8 text-white fill-current" />
            </div>

            {/* Matched User Photo */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white/50 overflow-hidden">
                <img
                  src={matchedUser.photos[0]}
                  alt={matchedUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Heart className="h-4 w-4 text-white fill-current" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <button
              onClick={onChatNow}
              className="w-full py-4 bg-white text-pink-600 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
            >
              💬 Send Message
            </button>
            <button
              onClick={onContinueBrowsing}
              className="w-full py-4 bg-white/20 text-white rounded-2xl font-medium hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCelebrationModal;
