
import React from 'react';
import { User } from '@supabase/supabase-js';
import SwipeStack from './SwipeStack';
import DiscoveryGrid from './DiscoveryGrid';
import LikesYouPage from './LikesYouPage';
import MatchesList from './MatchesList';
import SettingsPage from './SettingsPage';
import ChatInterface from './ChatInterface';
import { Match, User as UserType } from '@/types/User';

interface MainContentProps {
  activeTab: string;
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
        {/* Discover Tab - Swipe Mode */}
        {activeTab === 'discover' && (
          <div className="px-2 sm:px-4">
            <SwipeStack />
          </div>
        )}
        
        {/* Browse Tab - Discovery Grid */}
        {activeTab === 'browse' && (
          <div className="px-2 sm:px-4">
            <DiscoveryGrid currentUserId={user.id} userLocation={location} />
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="px-2 sm:px-4">
            <SettingsPage 
              currentUserProfile={currentUserProfile}
              onEditProfile={onEditProfile}
              onShowPremium={onShowPremium}
            />
          </div>
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
