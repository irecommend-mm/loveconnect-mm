
import React from 'react';
import { Heart, Users } from 'lucide-react';
import { AppMode } from '@/types/FriendDateTypes';

interface ModeToggleProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const ModeToggle = ({ currentMode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200 flex">
      <button
        onClick={() => onModeChange('friend')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
          currentMode === 'friend'
            ? 'bg-blue-500 text-white shadow-md'
            : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
        }`}
      >
        <Users className="h-4 w-4" />
        <span className="font-medium text-sm">Friend</span>
      </button>
      
      <button
        onClick={() => onModeChange('date')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
          currentMode === 'date'
            ? 'bg-pink-500 text-white shadow-md'
            : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50'
        }`}
      >
        <Heart className="h-4 w-4" />
        <span className="font-medium text-sm">Date</span>
      </button>
    </div>
  );
};

export default ModeToggle;
