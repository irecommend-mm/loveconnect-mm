
import React from 'react';
import { Bell, Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ModeToggle from './ModeToggle';
import { AppMode } from '@/types/FriendDateTypes';
import { User as UserType } from '@/types/User';

interface FDHeaderProps {
  currentMode: AppMode;
  onModeSwitch: (mode: AppMode) => void;
  onNotificationsClick: () => void;
  userProfile: UserType | null;
}

const FDHeader = ({ currentMode, onModeSwitch, onNotificationsClick, userProfile }: FDHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F&D</span>
          </div>
          <span className="font-bold text-lg text-gray-800">FriendDate</span>
        </div>

        {/* Mode Toggle */}
        <ModeToggle currentMode={currentMode} onModeChange={onModeSwitch} />

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationsClick}
            className="relative p-2"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={userProfile?.photos?.[0]} 
              alt={userProfile?.name || 'User'} 
            />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default FDHeader;
