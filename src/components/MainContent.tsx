
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
import { AdvancedFilters } from './filters/AdvancedFilters';
// import StoriesPage from './stories/StoriesPage';
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

  const handleApplyFilters = (filters: UserFilters) => {
    setActiveFilters(filters);
    console.log('Filters applied:', filters);
  };

  // Listen for filter open event from header
  useEffect(() => {
    const handleOpenFilters = () => {
      setShowFilters(true);
    };

    window.addEventListener('openFilters', handleOpenFilters);
    return () => window.removeEventListener('openFilters', handleOpenFilters);
  }, []);

  // Convert LocationData to expected format for DiscoveryGrid
  const convertLocationForGrid = (location: LocationData | null) => {
    if (!location) return null;
    return {
      lat: location.latitude,
      lng: location.longitude
    };
  };

  return (
    <main className="pt-16 pb-24 sm:pb-28 md:pb-32 lg:pb-36 min-h-screen bg-gray-50">
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
              userLocation={convertLocationForGrid(location)}
            />
          </div>
        )}
        
        {/* Stories Tab - User Stories */}
        {activeTab === 'stories' && (
          <div className="px-2 sm:px-4 py-4">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Stories Coming Soon</h3>
              <p className="text-gray-600">
                Share your moments with stories feature coming soon!
              </p>
            </div>
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
            <WhoVisitedYouPage />
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
          onApply={handleApplyFilters}
          currentFilters={{
            ageRange: [18, 50],
            maxDistance: 50,
            showMe: 'everyone',
            interests: [],
            verifiedOnly: false,
            onlineOnly: false,
            hasPhotos: true,
            hasBio: true
          }}
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
