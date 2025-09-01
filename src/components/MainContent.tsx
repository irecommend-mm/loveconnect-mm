
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import EnhancedSwipeStack from './EnhancedSwipeStack';
import DiscoveryGrid from './DiscoveryGrid';
import LikesYouPage from './LikesYouPage';
import MatchesList from './MatchesList';
import ModernSettingsPage from './ModernSettingsPage';
import ChatInterface from './ChatInterface';
import LocalEvents from './LocalEvents';
import EventCreationModal from './EventCreationModal';
import AdvancedFilters from './AdvancedFilters';
import { Match, User as UserType } from '@/types/User';
import { AppMode } from '@/types/FriendDateTypes';
import { Button } from '@/components/ui/button';
import { Filter, Plus } from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);
  const [showEventCreation, setShowEventCreation] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
    console.log('Filters applied:', filters);
  };

  return (
    <main className="pt-16 pb-20 min-h-screen bg-gray-50">
      <div className="h-full">
        {/* Discover Tab - Enhanced Swipe Mode with F&D */}
        {activeTab === 'discover' && (
          <div className="px-2 sm:px-4 relative">
            {/* Filter Button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={() => setShowFilters(true)}
                size="sm"
                variant="outline"
                className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {activeFilters && (
                  <div className="ml-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </div>
            <EnhancedSwipeStack mode={currentMode} filters={activeFilters} />
          </div>
        )}
        
        {/* Browse Tab - Discovery Grid */}
        {activeTab === 'browse' && (
          <div className="px-2 sm:px-4 relative">
            {/* Filter Button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={() => setShowFilters(true)}
                size="sm"
                variant="outline"
                className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {activeFilters && (
                  <div className="ml-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </div>
            <DiscoveryGrid 
              currentUserId={user.id} 
              userLocation={location} 
              filters={activeFilters}
              currentMode={currentMode}
            />
          </div>
        )}
        
        {/* Events Tab - Local Events & Meetups */}
        {activeTab === 'events' && (
          <div className="px-2 sm:px-4 py-4 relative">
            {/* Create Event Button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={() => setShowEventCreation(true)}
                size="sm"
                className={`${
                  currentMode === 'friend'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-pink-500 hover:bg-pink-600'
                } shadow-lg`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Event
              </Button>
            </div>
            <LocalEvents 
              onClose={() => {}} 
              currentMode={currentMode}
              currentUserId={user.id}
            />
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

      {/* Modals */}
      {showFilters && (
        <AdvancedFilters
          currentMode={currentMode}
          onClose={() => setShowFilters(false)}
          onApplyFilters={handleApplyFilters}
        />
      )}

      {showEventCreation && (
        <EventCreationModal
          onClose={() => setShowEventCreation(false)}
          onEventCreated={() => {
            setShowEventCreation(false);
            // Optionally refresh events
          }}
          currentMode={currentMode}
        />
      )}
    </main>
  );
};

export default MainContent;
