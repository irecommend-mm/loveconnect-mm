
import React, { useState } from 'react';
import { Heart, MessageCircle, User, Users, Filter, Settings, Zap, Eye } from 'lucide-react';
import { User as UserType } from '../types/User';
import VideoCallModal from './VideoCallModal';
import ProfileVerification from './ProfileVerification';

interface NavbarProps {
  onProfileClick: () => void;
  matches: UserType[];
  onChatClick: (user: UserType) => void;
  onSettingsClick: () => void;
  onMatchesClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFiltersClick: () => void;
}

const Navbar = ({ 
  onProfileClick, 
  matches, 
  onChatClick, 
  onSettingsClick, 
  onMatchesClick,
  activeTab,
  onTabChange,
  onFiltersClick
}: NavbarProps) => {
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const handleVideoCall = () => {
    if (matches.length > 0) {
      setShowVideoCall(true);
    }
  };

  const handleFiltersClick = () => {
    onFiltersClick();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-40 border-b border-gray-100">
        <div className="container mx-auto px-4">
          {/* Header with Logo and Action Buttons */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                LoveConnect
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowVerification(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Get Verified"
              >
                <Eye className="h-5 w-5 text-gray-600" />
              </button>
              
              <button
                onClick={handleFiltersClick}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Advanced Filters"
              >
                <Filter className="h-5 w-5 text-gray-600" />
              </button>

              <button
                onClick={handleVideoCall}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Video Call"
              >
                <Zap className="h-5 w-5 text-gray-600" />
              </button>

              <button
                onClick={() => onChatClick(matches[0])}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                title="Messages"
              >
                <MessageCircle className="h-5 w-5 text-gray-600" />
                {matches.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {matches.length}
                  </span>
                )}
              </button>

              <button
                onClick={onSettingsClick}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-t border-gray-100">
            {[
              { id: 'discover', label: 'Discover', icon: Heart },
              { id: 'browse', label: 'Browse', icon: Eye },
              { id: 'matches', label: 'Matches', icon: Users },
              { id: 'profile', label: 'Profile', icon: User }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-pink-600 border-b-2 border-pink-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Modals */}
      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        otherUserName={matches[0]?.name || 'Unknown User'}
        otherUserPhoto={matches[0]?.photos?.[0] || '/placeholder.svg'}
      />

      <ProfileVerification
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onComplete={() => {
          console.log('Verification completed');
        }}
      />
    </>
  );
};

export default Navbar;
