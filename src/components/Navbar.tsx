
import React from 'react';
import { Heart, MessageCircle, User } from 'lucide-react';
import { User as UserType } from '../types/User';

interface NavbarProps {
  onProfileClick: () => void;
  matches: UserType[];
  onChatClick: (user: UserType) => void;
}

const Navbar = ({ onProfileClick, matches, onChatClick }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-pink-100 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-pink-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            LoveConnect
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              onClick={() => matches.length > 0 && onChatClick(matches[0])}
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            {matches.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {matches.length}
              </span>
            )}
          </div>
          
          <button 
            className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
            onClick={onProfileClick}
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
