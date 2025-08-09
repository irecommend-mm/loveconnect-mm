
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useAppState } from '@/hooks/useAppState';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import MobileNavigation from '@/components/MobileNavigation';
import MobileHeader from '@/components/MobileHeader';
import MainContent from '@/components/MainContent';
import ProfileModal from '@/components/ProfileModal';
import NotificationModal from '@/components/NotificationModal';
import EventsModal from '@/components/EventsModal';
import FiltersModal from '@/components/FiltersModal';
import VideoCallModal from '@/components/VideoCallModal';
import VirtualChatRoom from '@/components/VirtualChatRoom';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { location, loading: locationLoading } = useLocation();
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
    setActiveTab,
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
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [showChatRoom, setShowChatRoom] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatches();
      fetchUsers();
      fetchCurrentUserProfile();
    }
  }, [user]);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

    if (error) {
      console.error('Error fetching matches:', error);
    } else {
      setMatches(data || []);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user?.id);

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
  };

  const fetchCurrentUserProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (error) {
      console.error('Error fetching current user profile:', error);
    } else {
      setCurrentUserProfile(data || null);
    }
  };

  const handleChatSelect = (user: any) => {
    setSelectedMatchId(user.id);
    setSelectedOtherUser(user);
    setActiveTab('chat');
  };

  const handleVideoCall = (user: any) => {
    setSelectedOtherUser(user);
    setShowVideoCall(true);
  };

  const handleEditProfile = () => {
    setShowProfile(true);
  };

  const AuthCheck = ({ children }: { children: React.ReactNode }) => {
    if (authLoading || locationLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
        </div>
      );
    }

    if (!user) {
      window.location.href = '/auth';
      return null;
    }

    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthCheck>
        <>
          {/* Mobile Header */}
          <div className="md:hidden">
            <MobileHeader
              title={
                activeTab === 'discover' ? 'Discover' :
                activeTab === 'browse' ? 'Browse' :
                activeTab === 'likes' ? 'Likes' :
                activeTab === 'matches' ? 'Matches' :
                activeTab === 'settings' ? 'Settings' : 'LoveConnect'
              }
              onNotificationsClick={() => setShowNotifications(true)}
              onEventsClick={() => setShowEvents(true)}
              onFilterClick={activeTab === 'browse' ? () => setShowFilters(true) : undefined}
              onChatRoomClick={() => setShowChatRoom(true)}
              showLocation={activeTab === 'discover' || activeTab === 'browse'}
              location={location?.city}
            />
          </div>

          {/* Desktop Navbar */}
          <div className="hidden md:block">
            <Navbar
              onProfileClick={() => setActiveTab('profile')}
              matches={matches}
              onChatClick={handleChatSelect}
              onSettingsClick={() => setActiveTab('settings')}
              onMatchesClick={() => setActiveTab('matches')}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onFiltersClick={() => setShowFilters(true)}
              onNotificationsClick={() => setShowNotifications(true)}
              onEventsClick={() => setShowEvents(true)}
              onChatRoomClick={() => setShowChatRoom(true)}
            />
          </div>

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
            onEditProfile={handleEditProfile}
            onShowPremium={() => setShowPremium(true)}
            onTabChange={handleTabChange}
          />

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Profile Modal */}
          {showProfile && currentUserProfile && (
            <ProfileModal
              user={currentUserProfile}
              onClose={() => setShowProfile(false)}
              onEdit={handleEditProfile}
              isCurrentUser={true}
            />
          )}

          {/* Premium Modal */}
          {showPremium && (
            <ProfileModal
              user={currentUserProfile}
              onClose={() => setShowPremium(false)}
              isCurrentUser={true}
            />
          )}

          {/* Notifications Modal */}
          <NotificationModal
            open={showNotifications}
            onClose={() => setShowNotifications(false)}
          />

          {/* Events Modal */}
          <EventsModal
            open={showEvents}
            onClose={() => setShowEvents(false)}
          />

          {/* Filters Modal */}
          <FiltersModal
            open={showFilters}
            onClose={() => setShowFilters(false)}
          />

          {/* Video Call Modal */}
          <VideoCallModal
            isOpen={showVideoCall}
            onClose={() => setShowVideoCall(false)}
            user={selectedOtherUser}
          />

          {/* Virtual ChatRoom Modal */}
          <VirtualChatRoom
            isOpen={showChatRoom}
            onClose={() => setShowChatRoom(false)}
          />
        </>
      </AuthCheck>
    </div>
  );
};

export default Index;
