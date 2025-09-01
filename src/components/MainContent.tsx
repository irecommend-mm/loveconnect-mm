
import React from 'react';
import { User } from '@supabase/supabase-js';
import EnhancedSwipeStack from './EnhancedSwipeStack';
import DiscoveryGrid from './DiscoveryGrid';
import LikesYouPage from './LikesYouPage';
import MatchesList from './MatchesList';
import ModernSettingsPage from './ModernSettingsPage';
import ChatInterface from './ChatInterface';
import LocalEvents from './LocalEvents';
import { Match, User as UserType } from '@/types/User';
import { AppMode } from '@/types/FriendDateTypes';

interface MainContentProps {
  activeTab: string;
  currentMode: AppMode;
  user: User;
  matches: Match[];
  users: UserType[];
  selectedMatchId: string | null;
  selectedOtherUser: UserType | null;
  currentUserProfile: UserType | null;
  location: any;
  onChatSelect: (user: UserType) => void;
  onVideoCall: (user: UserType) => void;
  onEditProfile: () => void;
  onShowPremium: () => void;
  onTabChange: (tab: string) => void;
}

const MainContent = ({
  activeTab,
  currentMode,
  user,
  matches,
  users,
  selectedMatchId,
  selectedOtherUser,
  currentUserProfile,
  location,
  onChatSelect,
  onVideoCall,
  onEditProfile,
  onShowPremium,
  onTabChange,
}: MainContentProps) => {
  return (
    <main className="pt-16 pb-20 min-h-screen bg-gray-50">
      <div className="h-full">
        {/* Discover Tab - Enhanced Swipe Mode with F&D */}
        {activeTab === 'discover' && (
          <div className="px-2 sm:px-4">
            <EnhancedSwipeStack mode={currentMode} />
          </div>
        )}
        
        {/* Browse Tab - Discovery Grid */}
        {activeTab === 'browse' && (
          <div className="px-2 sm:px-4">
            <DiscoveryGrid currentUserId={user.id} userLocation={location} />
          </div>
        )}
        
        {/* Events Tab - Local Events & Meetups */}
        {activeTab === 'events' && (
          <div className="px-2 sm:px-4 py-4">
            <LocalEvents onClose={() => {}} />
          </div>
        )}
        
        {/* Likes Tab */}
        {activeTab === 'likes' && (
          <div className="px-2 sm:px-4">
            <LikesYouPage onShowPremium={onShowPremium} />
          </div>
        )}
        
        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="px-2 sm:px-4 py-4">
            <MatchesList 
              matches={matches}
              users={users}
              onChatClick={onChatSelect}
              onVideoCall={onVideoCall}
              currentUserId={user.id}
            />
          </div>
        )}

        {/* Settings Tab - Using Modern Settings Page */}
        {activeTab === 'settings' && (
          <ModernSettingsPage 
            currentUserProfile={currentUserProfile}
            onEditProfile={onEditProfile}
            onShowPremium={onShowPremium}
          />
        )}
        
        {/* Chat Interface */}
        {activeTab === 'chat' && selectedMatchId && selectedOtherUser && (
          <ChatInterface 
            matchId={selectedMatchId}
            otherUser={selectedOtherUser}
            onBack={() => onTabChange('matches')}
            onVideoCall={() => onVideoCall(selectedOtherUser)}
          />
        )}
      </div>
    </main>
  );
};

export default MainContent;
