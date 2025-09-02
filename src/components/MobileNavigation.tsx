
import React from 'react';
import { Heart, MessageCircle, Compass, Settings, Sparkles, Eye, Calendar, Users } from 'lucide-react';
import { AppMode } from '@/types/FriendDateTypes';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentMode: AppMode;
}

const MobileNavigation = ({ activeTab, onTabChange, currentMode }: MobileNavigationProps) => {
  const tabs = [
    { 
      id: 'discover', 
      label: 'Discover', 
      icon: Sparkles,
      color: currentMode === 'friend' ? 'text-blue-500' : 'text-pink-500'
    },
    { 
      id: 'browse', 
      label: 'Browse', 
      icon: Compass,
      color: currentMode === 'friend' ? 'text-blue-500' : 'text-pink-500'
    },
    { 
      id: 'stories', 
      label: 'Stories', 
      icon: Sparkles,
      color: 'text-purple-500'
    },
    { 
      id: 'events', 
      label: 'Events', 
      icon: Calendar,
      color: currentMode === 'friend' ? 'text-blue-500' : 'text-pink-500'
    },
    { 
      id: 'likes', 
      label: 'Likes', 
      icon: Heart,
      color: currentMode === 'friend' ? 'text-blue-500' : 'text-pink-500'
    },
    { 
      id: 'visitors', 
      label: 'Visitors', 
      icon: Eye,
      color: 'text-purple-500'
    },
    { 
      id: 'matches', 
      label: 'Matches', 
      icon: MessageCircle,
      color: currentMode === 'friend' ? 'text-blue-500' : 'text-pink-500'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      color: 'text-gray-500'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? `${tab.color} bg-opacity-10` 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon 
                className={`h-5 w-5 mb-1 ${
                  isActive ? tab.color : ''
                }`} 
              />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
