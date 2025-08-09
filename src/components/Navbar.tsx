
import React, { useState } from 'react';
import { Heart, Search, MessageCircle, User, Bell, Calendar, Users, Filter } from 'lucide-react';
import { User as UserType } from '@/types/User';

interface NavbarProps {
  onProfileClick: () => void;
  matches: UserType[];
  onChatClick: (user: UserType) => void;
  onSettingsClick: () => void;
  onMatchesClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFiltersClick: () => void;
  onNotificationsClick: () => void;
  onEventsClick: () => void;
  onChatRoomClick: () => void;
}

const Navbar = ({ 
  onProfileClick, 
  matches, 
  onChatClick, 
  onSettingsClick, 
  onMatchesClick,
  activeTab,
  onTabChange,
  onFiltersClick,
  onNotificationsClick,
  onEventsClick,
  onChatRoomClick
}: NavbarProps) => {
  const [showMatchesDropdown, setShowMatchesDropdown] = useState(false);

  const navItems = [
    { id: 'discover', icon: Heart, label: 'Discover' },
    { id: 'browse', icon: Search, label: 'Browse' },
    { id: 'matches', icon: MessageCircle, label: 'Matches' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              LoveConnect
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-pink-100 text-pink-600'
                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Filters */}
            <button
              onClick={onFiltersClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Filter className="h-5 w-5 text-gray-600" />
            </button>

            {/* Virtual ChatRoom */}
            <button
              onClick={onChatRoomClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Users className="h-5 w-5 text-gray-600" />
            </button>

            {/* Local Events */}
            <button
              onClick={onEventsClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Calendar className="h-5 w-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <button
              onClick={onNotificationsClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <User className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-center mt-4">
          <div className="flex items-center space-x-6 bg-gray-100 rounded-full px-6 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                <item.icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
