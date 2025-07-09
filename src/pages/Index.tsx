
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import MobileHeader from '@/components/MobileHeader';
import MobileNavigation from '@/components/MobileNavigation';
import MainContent from '@/components/MainContent';
import LocationBanner from '@/components/LocationBanner';
import ProfileSetup from '@/components/ProfileSetup';
import PremiumFeatures from '@/components/PremiumFeatures';
import NotificationCenter from '@/components/NotificationCenter';
import GroupEvents from '@/components/GroupEvents';
import VideoCallModal from '@/components/VideoCallModal';
import AdvancedFilters from '@/components/AdvancedFilters';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAppState } from '@/hooks/useAppState';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMatches } from '@/hooks/useMatches';
import { User as UserType } from '@/types/User';
import { X } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  
  // Custom hooks for state management
  const {
    activeTab,
    selectedMatchId,
    selectedOtherUser,
    showProfile,
    showPremium,
    showNotifications,
    showEvents,
    showFilters,
    showVideoCall,
    setSelectedMatchId,
    setSelectedOtherUser,
    setShowProfile,
    setShowPremium,
    setShowNotifications,
    setShowEvents,
    setShowFilters,
    setShowVideoCall,
    handleTabChange,
  } = useAppState();

  const {
    hasProfile,
    loading,
    currentProfile,
    currentUserProfile,
    setHasProfile,
    checkUserProfile,
    loadCurrentUserProfile,
  } = useUserProfile(user);

  const { matches, users, loadMatches } = useMatches(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load matches when switching to matches tab
  useEffect(() => {
    if (activeTab === 'matches' && user) {
      loadMatches(user.id);
    }
  }, [activeTab, user]);

  const handleProfileComplete = () => {
    setHasProfile(true);
    setShowProfile(false);
    if (user) {
      checkUserProfile(user.id);
      loadCurrentUserProfile(user.id);
    }
  };

  const handleChatSelect = (matchedUser: UserType) => {
    const match = matches.find(m => 
      m.users.includes(matchedUser.id)
    );
    
    if (match) {
      setSelectedMatchId(match.id);
      setSelectedOtherUser(matchedUser);
      handleTabChange('chat');
    }
  };

  const handleVideoCall = (matchedUser: UserType) => {
    setSelectedOtherUser(matchedUser);
    setShowVideoCall(true);
  };

  const handleLocationEnable = async () => {
    if (location && user) {
      try {
        await supabase
          .from('profiles')
          .update({
            latitude: location.lat,
            longitude: location.lng,
            last_active: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        window.location.reload();
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
  };

  const handleUpgrade = (plan: string) => {
    console.log('Upgrading to plan:', plan);
    setShowPremium(false);
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!hasProfile && !showProfile) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      {/* Mobile Header */}
      <MobileHeader 
        title="VibeConnect"
        onNotificationsClick={() => setShowNotifications(true)}
        onEventsClick={() => setShowEvents(true)}
        onFilterClick={() => setShowFilters(true)}
        showLocation={activeTab === 'discover' || activeTab === 'browse'}
        location={currentProfile?.location}
      />
      
      {/* Location Permission Banner */}
      <LocationBanner
        location={location}
        locationLoading={locationLoading}
        activeTab={activeTab}
        onLocationEnable={handleLocationEnable}
      />

      {/* Main Content */}
      <MainContent
        activeTab={activeTab}
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
      />

      {/* Profile Setup Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
            <ProfileSetup 
              onComplete={handleProfileComplete}
              existingProfile={currentProfile}
            />
          </div>
        </div>
      )}

      {/* Premium Modal */}
      {showPremium && (
        <PremiumFeatures 
          onClose={() => setShowPremium(false)}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <NotificationCenter onClose={() => setShowNotifications(false)} />
      )}

      {/* Group Events Modal */}
      {showEvents && (
        <GroupEvents onClose={() => setShowEvents(false)} />
      )}

      {/* Discovery Filters Modal */}
      {showFilters && (
        <AdvancedFilters 
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
        />
      )}

      {/* Video Call Modal */}
      {showVideoCall && selectedOtherUser && (
        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          otherUserName={selectedOtherUser.name}
          otherUserPhoto={selectedOtherUser.photos[0] || ''}
          isIncoming={false}
        />
      )}
    </div>
  );
};

export default Index;
