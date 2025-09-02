
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import EnhancedSwipeStack from './EnhancedSwipeStack';
import DiscoveryGrid from './DiscoveryGrid';
import WhoLikesYouPage from './WhoLikesYouPage';
import WhoVisitedYouPage from './WhoVisitedYouPage';
import MatchesList from './MatchesList';
import ModernSettingsPage from './ModernSettingsPage';
import ChatInterface from './ChatInterface';
import LocalEvents from './LocalEvents';
import EventCreationModal from './EventCreationModal';
import AdvancedFilters from './filters/AdvancedFilters';
import { Match, User as UserType } from '@/types/User';
import { AppMode, LocationData, UserFilters } from '@/types/FriendDateTypes';
import { Button } from '@/components/ui/button';
import { Filter, Plus, Calendar } from 'lucide-react';

interface MainContentProps {
  activeTab: string;
  currentMode: AppMode;
  user: User;
  matches: Match[];
  users: UserType[];
  selectedMatchId: string | null;
  selectedOtherUser: UserType | null;
  currentUserProfile: UserType | null;
  location: LocationData | null;
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
  const [showLocalEvents, setShowLocalEvents] = useState(false);
  const [activeFilters, setActiveFilters] = useState<UserFilters | null>(null);

  const handleApplyFilters = (filters: any) => {
    // Convert FilterPreferences to UserFilters format
    const userFilters: UserFilters = {
      ageRange: filters.ageRange,
      maxDistance: filters.maxDistance,
      showMe: 'everyone', // Default value
      relationshipType: filters.relationshipType?.[0] as 'serious' | 'casual' | 'friends' | 'unsure',
      interests: filters.interests,
      verifiedOnly: filters.verified,
      onlineOnly: filters.onlineOnly,
      hasPhotos: true,
      hasBio: false
    };
    setActiveFilters(userFilters);
    console.log('Filters applied:', userFilters);
  };

  // Listen for filter open event from header
  useEffect(() => {
    const handleOpenFilters = () => {
      setShowFilters(true);
    };

    window.addEventListener('openFilters', handleOpenFilters);
    return () => window.removeEventListener('openFilters', handleOpenFilters);
  }, []);

  return (
    <main className="pt-16 pb-20 min-h-screen bg-gray-50">
      <div className="h-full">
        {/* Discover Tab - Enhanced Swipe Mode with F&D */}
        {activeTab === 'discover' && (
          <div className="px-2 sm:px-4 relative">
            <EnhancedSwipeStack mode={currentMode} filters={activeFilters} />
          </div>
        )}
        
        {/* Browse Tab - Discovery Grid */}
        {activeTab === 'browse' && (
          <div className="px-2 sm:px-4 relative">
            <DiscoveryGrid 
              currentUserId={user.id} 
              userLocation={location} 
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
            
            {/* Events List View */}
            <div className="space-y-4">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Local Events & Meetups</h3>
                <p className="text-gray-500 mb-4">Discover and join exciting events in your area</p>
                <Button
                  onClick={() => setShowLocalEvents(true)}
                  className={`${
                    currentMode === 'friend'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-pink-500 hover:bg-pink-600'
                  } text-white`}
                >
                  Browse Events
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Likes Tab - Who Likes You */}
        {activeTab === 'likes' && (
          <div className="px-2 sm:px-4">
            <WhoLikesYouPage onShowPremium={onShowPremium} />
          </div>
        )}

        {/* Visitors Tab - Who Visited You */}
        {activeTab === 'visitors' && (
          <div className="px-2 sm:px-4">
            <WhoVisitedYouPage onShowPremium={onShowPremium} />
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
        {activeTab === 'chat' && selectedOtherUser && selectedMatchId && (
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
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApplyFilters={handleApplyFilters}
        />
      )}

      {showEventCreation && (
        <EventCreationModal
          isOpen={showEventCreation}
          onClose={() => setShowEventCreation(false)}
          onEventCreated={() => {
            setShowEventCreation(false);
            // Optionally refresh events
          }}
        />
      )}

      {showLocalEvents && (
        <LocalEvents
          onClose={() => setShowLocalEvents(false)}
          currentMode={currentMode}
          currentUserId={user.id}
        />
      )}
    </main>
  );
};

export default MainContent;
