
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
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          currentMode === 'friend'
            ? 'bg-blue-500 text-white shadow-md'
            : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
        }`}
        title="Friend Mode"
      >
        <Users className="h-5 w-5" />
      </button>
      
      <button
        onClick={() => onModeChange('date')}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          currentMode === 'date'
            ? 'bg-pink-500 text-white shadow-md'
            : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50'
        }`}
        title="Date Mode"
      >
        <Heart className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ModeToggle;
