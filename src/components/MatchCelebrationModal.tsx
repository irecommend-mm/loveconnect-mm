
import React from 'react';
import { Heart, MessageCircle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types/User';

interface MatchCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: User;
  onStartChat: () => void;
  onKeepSwiping: () => void;
}

const MatchCelebrationModal = ({ 
  isOpen, 
  onClose, 
  matchedUser, 
  onStartChat, 
  onKeepSwiping 
}: MatchCelebrationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-0 shadow-2xl max-w-md w-full">
        <CardContent className="p-8 text-center relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50 hover:bg-white/70 flex items-center justify-center transition-all duration-200"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>

          {/* Celebration Animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-lg animate-pulse">
              <Heart className="h-10 w-10 text-white fill-current" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-bounce" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Sparkles className="h-4 w-4 text-pink-400 animate-bounce delay-300" />
            </div>
          </div>

          {/* Celebration Text */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 It's a Match!
          </h2>
          <p className="text-gray-600 mb-6">
            You and <span className="font-semibold text-pink-600">{matchedUser.name}</span> liked each other!
          </p>

          {/* User Info */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-16 h-16 rounded-full border-4 border-pink-200 overflow-hidden shadow-lg">
              {matchedUser.photos && matchedUser.photos.length > 0 ? (
                <img 
                  src={matchedUser.photos[0]} 
                  alt={matchedUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-pink-500" />
                </div>
              )}
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="h-4 w-4 text-white fill-current animate-pulse" />
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-purple-200 overflow-hidden shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xl">You</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onStartChat}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Chatting
            </Button>
            
            <Button
              onClick={onKeepSwiping}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              Keep Swiping
            </Button>
          </div>

          {/* Fun fact */}
          <p className="text-xs text-gray-500 mt-6">
            💡 Start the conversation within 24 hours for the best results!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchCelebrationModal;
