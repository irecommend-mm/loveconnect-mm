
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
    return <ProfileSetup onProfileComplete={async () => await checkUserProfile(user.id)} />;
  }

  const handleChatSelect = (selectedUser: UserType) => {
    const match = matches.find(m => 
      (m.users[0] === user.id && users.find(u => u.id === m.users[1])?.id === selectedUser.id) ||
      (m.users[1] === user.id && users.find(u => u.id === m.users[0])?.id === selectedUser.id)
    );
    
    if (match) {
      setSelectedMatchId(match.id);
      setSelectedOtherUser(selectedUser);
      handleTabChange('chat');
    }
  };

  const handleVideoCall = (selectedUser: UserType) => {
    setSelectedOtherUser(selectedUser);
    setShowVideoCall(true);
  };

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
        location={location}
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
          onSave={() => {
            setShowProfile(false);
            if (user) checkUserProfile(user.id);
          }}
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
          otherUser={selectedOtherUser}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
};

export default Index;
