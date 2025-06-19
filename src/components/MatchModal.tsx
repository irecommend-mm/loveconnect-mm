
import React from 'react';
import { Heart } from 'lucide-react';
import { User as UserType } from '../types/User';

interface MatchModalProps {
  user: UserType;
  onClose: () => void;
  onChat: () => void;
}

const MatchModal = ({ user, onClose, onChat }: MatchModalProps) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-500/90 to-purple-600/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-sm w-full animate-scale-in">
        {/* Celebration Hearts */}
        <div className="relative mb-8">
          <Heart className="h-20 w-20 mx-auto text-white fill-current animate-pulse" />
          <div className="absolute inset-0 animate-ping">
            <Heart className="h-20 w-20 mx-auto text-white/50 fill-current" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-2">It's a Match!</h1>
        <p className="text-xl mb-8 opacity-90">
          You and {user.name} liked each other
        </p>

        {/* User Photos */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400"
              alt="You"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden">
            <img
              src={user.photos[0]}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onChat}
            className="w-full py-4 bg-white text-pink-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Send Message
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 bg-white/20 text-white rounded-full font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
