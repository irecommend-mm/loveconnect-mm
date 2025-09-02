
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMatches } from '@/hooks/useMatches';
import { useAppState } from '@/hooks/useAppState';
import { useAppMode } from '@/hooks/useAppMode';
import { useGeolocation } from '@/hooks/useGeolocation';
import Auth from './Auth';
import ProfileSetup from '@/components/ProfileSetup';
import MainContent from '@/components/MainContent';
import FDHeader from '@/components/FDHeader';
import MobileNavigation from '@/components/MobileNavigation';
import PremiumFeatures from '@/components/PremiumFeatures';
import ProfileModal from '@/components/ProfileModal';
import NotificationCenter from '@/components/NotificationCenter';
import VideoCallModal from '@/components/VideoCallModal';
import { User as UserType } from '@/types/User';
import { LocationData } from '@/types/FriendDateTypes';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentMode, switchMode } = useAppMode();
  const { hasProfile, loading: profileLoading, currentUserProfile, checkUserProfile } = useUserProfile(user);
  const { matches, users, loading: matchesLoading } = useMatches(user);
  const { location, loading: locationLoading } = useGeolocation();
  const {
    activeTab,
    selectedMatchId,
    selectedOtherUser,
    showProfile,
    showPremium,
    showNotifications,
    showVideoCall,
    setShowProfile,
    setShowPremium,
    setShowNotifications,
    setShowVideoCall,
    handleTabChange,
    setSelectedMatchId,
    setSelectedOtherUser,
  } = useAppState();

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Loading your experience...</p>
        </div>
      </div>
    );
  }

  // Authentication required
  if (!user) {
    return <Auth />;
  }

  // Profile setup required
  if (!hasProfile) {
    return (
      <ProfileSetup 
        onComplete={async () => {
          await checkUserProfile(user.id);
        }}
      />
    );
  }

  const handleChatSelect = (selectedUser: UserType) => {
    // Find the match between current user and selected user
    const match = matches.find(m => 
      (m.users.includes(user.id) && m.users.includes(selectedUser.id))
    );
    
    if (match) {
      console.log('Found match:', match.id, 'for user:', selectedUser.name);
      setSelectedMatchId(match.id);
      setSelectedOtherUser(selectedUser);
      handleTabChange('chat');
    } else {
      console.error('No match found between users:', user.id, selectedUser.id);
    }
  };

  const handleVideoCall = (selectedUser: UserType) => {
    setSelectedOtherUser(selectedUser);
    setShowVideoCall(true);
  };

  // Map geolocation to LocationData format
  const mappedLocation: LocationData | undefined = location ? {
    latitude: location.lat,
    longitude: location.lng,
    city: location.city,
    country: location.country,
  } : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <FDHeader 
        currentMode={currentMode}
        onModeSwitch={switchMode}
        onNotificationsClick={() => setShowNotifications(true)}
        onFiltersClick={() => {
          // This will open filters for the current active tab
          if (activeTab === 'discover' || activeTab === 'browse') {
            // We need to trigger the filter modal in MainContent
            // For now, we'll use a custom event to communicate
            window.dispatchEvent(new CustomEvent('openFilters'));
          }
        }}
        userProfile={currentUserProfile}
      />

      {/* Main Content */}
      <MainContent
        activeTab={activeTab}
        currentMode={currentMode}
        user={user}
        matches={matches}
        users={users}
        selectedMatchId={selectedMatchId}
        selectedOtherUser={selectedOtherUser}
        currentUserProfile={currentUserProfile}
        location={mappedLocation}
        onChatSelect={handleChatSelect}
        onVideoCall={handleVideoCall}
        onEditProfile={() => setShowProfile(true)}
        onShowPremium={() => setShowPremium(true)}
        onTabChange={handleTabChange}
      />

      {/* Mobile Navigation */}
      <MobileNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentMode={currentMode}
      />

      {/* Modals */}
      {showProfile && currentUserProfile && (
        <ProfileModal
          user={currentUserProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showPremium && (
        <PremiumFeatures 
          onClose={() => setShowPremium(false)} 
          onUpgrade={() => {
            console.log('Premium upgrade clicked');
            setShowPremium(false);
          }}
        />
      )}

      {showNotifications && (
        <NotificationCenter onClose={() => setShowNotifications(false)} />
      )}

      {showVideoCall && selectedOtherUser && (
        <VideoCallModal
          isOpen={showVideoCall}
          otherUserName={selectedOtherUser.name}
          otherUserPhoto={selectedOtherUser.photos?.[0] || ''}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
};

export default Index;
