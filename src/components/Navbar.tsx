
import React from 'react';
import { Heart, MessageCircle, User, Settings, Users } from 'lucide-react';
import { User as UserType } from '../types/User';

interface NavbarProps {
  onProfileClick: () => void;
  matches: UserType[];
  onChatClick: (user: UserType) => void;
  onSettingsClick: () => void;
  onMatchesClick: () => void;
}

const Navbar = ({ onProfileClick, matches, onChatClick, onSettingsClick, onMatchesClick }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-pink-100 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-pink-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            LoveConnect
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg relative"
            onClick={onMatchesClick}
          >
            <Users className="h-5 w-5" />
            {matches.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {matches.length}
              </span>
            )}
          </button>

          <button 
            className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg relative"
            onClick={() => matches.length > 0 && onChatClick(matches[0])}
          >
            <MessageCircle className="h-5 w-5" />
            {matches.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {matches.length}
              </span>
            )}
          </button>
          
          <button 
            className="p-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
            onClick={onSettingsClick}
          >
            <Settings className="h-5 w-5" />
          </button>

          <button 
            className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
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
