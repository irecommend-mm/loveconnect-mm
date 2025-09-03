
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40">
      {/* Mobile Layout - Compact and proportional */}
      <div className="block sm:hidden">
        <div className="flex justify-around items-center px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? `${tab.color} bg-opacity-10` 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
                               <Icon 
                   className={`h-4 w-4 mb-1 ${
                     isActive ? tab.color : ''
                   }`} 
                 />
                <span className="text-xs font-medium leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tablet Layout - Balanced sizing */}
      <div className="hidden sm:block md:hidden">
        <div className="flex justify-around items-center px-4 py-2.5 max-w-2xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? `${tab.color} bg-opacity-10` 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                                 <Icon 
                   className={`h-4 w-4 mb-1.5 ${
                     isActive ? tab.color : ''
                   }`} 
                 />
                <span className="text-xs font-medium leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Layout - Professional sizing */}
      <div className="hidden md:block lg:hidden">
        <div className="flex justify-around items-center px-6 py-3 max-w-4xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? `${tab.color} bg-opacity-10` 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                                 <Icon 
                   className={`h-5 w-5 mb-2 ${
                     isActive ? tab.color : ''
                   }`} 
                 />
                <span className="text-sm font-medium leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Large Desktop Layout - Enhanced but proportional */}
      <div className="hidden lg:block">
        <div className="flex justify-around items-center px-8 py-4 max-w-6xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? `${tab.color} bg-opacity-10` 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                                 <Icon 
                   className={`h-6 w-6 mb-2 ${
                     isActive ? tab.color : ''
                   }`} 
                 />
                <span className="text-sm font-medium leading-tight">{tab.label}</span>
            </button>
          );
        })}
        </div>
      </div>
    </nav>
  );
};

export default MobileNavigation;
