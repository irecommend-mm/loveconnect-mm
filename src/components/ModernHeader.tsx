import React from 'react';
import { Bell, Filter, Heart, Users } from 'lucide-react';
import { AppMode } from '@/types/FriendDateTypes';

interface ModernHeaderProps {
  mode: AppMode;
  onModeSwitch: (mode: AppMode) => void;
  onNotificationClick: () => void;
  onFilterClick: () => void;
}

const ModernHeader = ({ mode, onModeSwitch, onNotificationClick, onFilterClick }: ModernHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and App Name */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            LoveConnect
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => onModeSwitch('friend')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              mode === 'friend'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            Friends
          </button>
          <button
            onClick={() => onModeSwitch('date')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              mode === 'date'
                ? 'bg-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Heart className="w-4 h-4 inline mr-1" />
            Dating
          </button>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onNotificationClick}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onFilterClick}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernHeader;
