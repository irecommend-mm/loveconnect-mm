import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import MobileHeader from '@/components/MobileHeader';
import MobileNavigation from '@/components/MobileNavigation';
import SwipeStack from '@/components/SwipeStack';
import DiscoveryGrid from '@/components/DiscoveryGrid';
import MatchesList from '@/components/MatchesList';
import ChatInterface from '@/components/ChatInterface';
import ProfileSetup from '@/components/ProfileSetup';
import SettingsPage from '@/components/SettingsPage';
import LikesYouPage from '@/components/LikesYouPage';
import PremiumFeatures from '@/components/PremiumFeatures';
import NotificationCenter from '@/components/NotificationCenter';
import GroupEvents from '@/components/GroupEvents';
import VideoCallModal from '@/components/VideoCallModal';
import AdvancedFilters from '@/components/AdvancedFilters';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';
import { User as UserType, Match, UserSettings } from '@/types/User';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<UserType | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserType | null>(null);
  const { location, error: locationError, loading: locationLoading } = useGeolocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkUserProfile(session.user.id);
        loadMatches(session.user.id);
        loadCurrentUserProfile(session.user.id);
      } else {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkUserProfile(session.user.id);
        loadMatches(session.user.id);
        loadCurrentUserProfile(session.user.id);
      } else {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        setHasProfile(true);
        setCurrentProfile(profile);
        if (location && !profile.latitude && !profile.longitude) {
          await supabase
            .from('profiles')
            .update({
              latitude: location.lat,
              longitude: location.lng,
              last_active: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserProfile = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        const { data: photosData } = await supabase
          .from('photos')
          .select('url')
          .eq('user_id', userId)
          .order('position');

        const { data: interestsData } = await supabase
          .from('interests')
          .select('interest')
          .eq('user_id', userId);

        const userProfile: UserType = {
          id: profileData.user_id,
          name: profileData.name,
          age: profileData.age,
          bio: profileData.bio || '',
          photos: photosData?.map(p => p.url) || [],
          interests: interestsData?.map(i => i.interest) || [],
          location: profileData.location || '',
          job: profileData.job || '',
          education: profileData.education || '',
          verified: profileData.verified || false,
          lastActive: new Date(profileData.last_active || profileData.created_at),
          height: profileData.height || '',
          zodiacSign: profileData.zodiac_sign || '',
          relationshipType: (profileData.relationship_type === 'friendship' ? 'friends' : profileData.relationship_type || 'serious') as 'casual' | 'serious' | 'friends' | 'unsure',
          children: (profileData.children || 'unsure') as 'have' | 'want' | 'dont_want' | 'unsure',
          smoking: (profileData.smoking || 'no') as 'yes' | 'no' | 'sometimes',
          drinking: (profileData.drinking || 'sometimes') as 'yes' | 'no' | 'sometimes',
          exercise: (profileData.exercise || 'sometimes') as 'often' | 'sometimes' | 'never',
          isOnline: false,
        };

        setCurrentUserProfile(userProfile);
      }
    } catch (error) {
      console.error('Error loading current user profile:', error);
    }
  };

  const loadMatches = async (userId: string) => {
    try {
      console.log('Loading matches for user:', userId);
      
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true);

      if (matchesError) {
        console.error('Error loading matches:', matchesError);
        return;
      }

      console.log('Raw matches data:', matchesData);

      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        setUsers([]);
        return;
      }

      const otherUserIds = matchesData.map(match => 
        match.user1_id === userId ? match.user2_id : match.user1_id
      );

      console.log('Other user IDs:', otherUserIds);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', otherUserIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      const usersWithPhotos = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: photosData } = await supabase
            .from('photos')
            .select('url')
            .eq('user_id', profile.user_id)
            .order('position');

          const { data: interestsData } = await supabase
            .from('interests')
            .select('interest')
            .eq('user_id', profile.user_id);

          return {
            id: profile.user_id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
            photos: photosData?.map(p => p.url) || [],
            interests: interestsData?.map(i => i.interest) || [],
            location: profile.location || '',
            job: profile.job || '',
            education: profile.education || '',
            verified: profile.verified || false,
            lastActive: new Date(profile.last_active || profile.created_at),
            height: profile.height || '',
            zodiacSign: profile.zodiac_sign || '',
            relationshipType: (profile.relationship_type === 'friendship' ? 'friends' : profile.relationship_type || 'serious') as 'casual' | 'serious' | 'friends' | 'unsure',
            children: (profile.children || 'unsure') as 'have' | 'want' | 'dont_want' | 'unsure',
            smoking: (profile.smoking || 'no') as 'yes' | 'no' | 'sometimes',
            drinking: (profile.drinking || 'sometimes') as 'yes' | 'no' | 'sometimes',
            exercise: (profile.exercise || 'sometimes') as 'often' | 'sometimes' | 'never',
            isOnline: false,
          };
        })
      );

      const transformedMatches = matchesData.map(match => ({
        id: match.id,
        users: [match.user1_id, match.user2_id] as [string, string],
        timestamp: new Date(match.created_at),
        lastMessage: undefined,
        isActive: match.is_active
      }));

      console.log('Transformed matches:', transformedMatches);
      
      setMatches(transformedMatches);
      setUsers(usersWithPhotos);
    } catch (error) {
      console.error('Error in loadMatches:', error);
    }
  };

  const handleProfileComplete = () => {
    setHasProfile(true);
    setShowProfile(false);
    if (user) {
      checkUserProfile(user.id);
      loadCurrentUserProfile(user.id);
    }
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const handleEditProfile = () => {
    setShowProfile(true);
  };

  const handleChatSelect = (matchedUser: UserType) => {
    const match = matches.find(m => 
      m.users.includes(matchedUser.id)
    );
    
    if (match) {
      setSelectedMatchId(match.id);
      setSelectedOtherUser(matchedUser);
      setActiveTab('chat');
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    setShowProfile(false);
    setShowPremium(false);
    setShowNotifications(false);
    setShowEvents(false);
    setShowFilters(false);
    setShowVideoCall(false);
    setSelectedMatchId(null);
    setSelectedOtherUser(null);
    
    if (tab === 'matches') {
      if (user) {
        loadMatches(user.id);
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
      {!location && !locationLoading && (activeTab === 'discover' || activeTab === 'browse') && (
        <div className="mx-4 mt-20 mb-4 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-800">Enable location</p>
                <p className="text-xs text-blue-600">Find people near you</p>
              </div>
            </div>
            <Button 
              onClick={handleLocationEnable} 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600"
            >
              Enable
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20 pb-20 min-h-screen">
        <div className="h-full">
          {/* Discover Tab - Swipe Mode */}
          {activeTab === 'discover' && (
            <SwipeStack />
          )}
          
          {/* Browse Tab - Discovery Grid */}
          {activeTab === 'browse' && (
            <DiscoveryGrid currentUserId={user.id} userLocation={location} />
          )}
          
          {/* Likes Tab */}
          {activeTab === 'likes' && (
            <LikesYouPage onShowPremium={() => setShowPremium(true)} />
          )}
          
          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <div className="p-4">
              <MatchesList 
                matches={matches}
                users={users}
                onChatClick={handleChatSelect}
                onVideoCall={handleVideoCall}
                currentUserId={user.id}
              />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsPage 
              currentUserProfile={currentUserProfile}
              onEditProfile={handleEditProfile}
              onShowPremium={() => setShowPremium(true)}
            />
          )}
          
          {/* Chat Interface */}
          {activeTab === 'chat' && selectedMatchId && selectedOtherUser && (
            <ChatInterface 
              matchId={selectedMatchId}
              otherUser={selectedOtherUser}
              onBack={() => setActiveTab('matches')}
              onVideoCall={() => handleVideoCall(selectedOtherUser)}
            />
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Profile Setup Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={handleCloseProfile}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
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
