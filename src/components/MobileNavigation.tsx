
import React from 'react';
import { Heart, Search, Users, MessageCircle, Settings } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const navItems = [
    { id: 'discover', icon: Heart, label: 'Discover' },
    { id: 'browse', icon: Search, label: 'Browse' },
    { id: 'likes', icon: Users, label: 'Likes' },
    { id: 'matches', icon: MessageCircle, label: 'Matches' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center p-2 transition-colors ${
              activeTab === item.id
                ? 'text-pink-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
