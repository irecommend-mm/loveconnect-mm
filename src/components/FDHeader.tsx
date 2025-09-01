
import React from 'react';
import { Bell, Settings, Sparkles } from 'lucide-react';
import ModeToggle from './ModeToggle';
import { AppMode } from '@/types/FriendDateTypes';

interface FDHeaderProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onNotifications: () => void;
  onSettings: () => void;
  notificationCount?: number;
}

const FDHeader = ({ 
  currentMode, 
  onModeChange, 
  onNotifications, 
  onSettings,
  notificationCount = 0 
}: FDHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
              F & D
            </h1>
            <p className="text-xs text-gray-500 -mt-1">Friend & Date</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <ModeToggle currentMode={currentMode} onModeChange={onModeChange} />

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onNotifications}
            className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          
          <button
            onClick={onSettings}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default FDHeader;
