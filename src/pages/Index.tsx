
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import SwipeStack from '@/components/SwipeStack';
import DiscoveryGrid from '@/components/DiscoveryGrid';
import MatchesList from '@/components/MatchesList';
import ChatInterface from '@/components/ChatInterface';
import ProfileSetup from '@/components/ProfileSetup';
import SettingsModal from '@/components/SettingsModal';
import AdvancedFilters from '@/components/AdvancedFilters';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { User as UserType, Match, UserSettings } from '@/types/User';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<UserType | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      matches: true,
      messages: true,
      likes: true,
    },
    privacy: {
      showAge: true,
      showDistance: true,
      incognito: false,
    },
    discovery: {
      ageRange: [18, 35],
      maxDistance: 50,
      relationshipType: 'serious',
      showMe: 'everyone',
    },
  });
  const { location, error: locationError, loading: locationLoading } = useGeolocation();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkUserProfile(session.user.id);
        loadMatches(session.user.id);
      } else {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkUserProfile(session.user.id);
        loadMatches(session.user.id);
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
        // Update user's location if we have geolocation data
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

  const loadMatches = async (userId: string) => {
    try {
      console.log('Loading matches for user:', userId);
      
      // Get matches where the user is either user1 or user2
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

      // Get the other user IDs from matches
      const otherUserIds = matchesData.map(match => 
        match.user1_id === userId ? match.user2_id : match.user1_id
      );

      console.log('Other user IDs:', otherUserIds);

      // Load profiles for the matched users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', otherUserIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      // Load photos for each profile
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

      // Transform matches data to match the Match interface
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
    if (user) {
      checkUserProfile(user.id);
    }
  };

  const handleChatSelect = (matchedUser: UserType) => {
    // Find the match that corresponds to this user
    const match = matches.find(m => 
      m.users.includes(matchedUser.id)
    );
    
    if (match) {
      setSelectedMatchId(match.id);
      setSelectedOtherUser(matchedUser);
      setActiveTab('chat');
    }
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
        
        // Refresh the page to update the discovery grid
        window.location.reload();
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    // Here you could also save to database if needed
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setHasProfile(false);
      setMatches([]);
      setUsers([]);
      setActiveTab('discover');
      setSelectedMatchId(null);
      setSelectedOtherUser(null);
      setShowProfile(false);
      setShowSettings(false);
      setShowFilters(false);
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'matches') {
      // Refresh matches when switching to matches tab
      if (user) {
        loadMatches(user.id);
      }
    }
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applying filters:', filters);
    // You can implement filter logic here
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!hasProfile) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Navbar 
        onProfileClick={() => setShowProfile(true)}
        matches={users}
        onChatClick={handleChatSelect}
        onSettingsClick={() => setShowSettings(true)}
        onMatchesClick={() => setActiveTab('matches')}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onFiltersClick={() => setShowFilters(true)}
      />
      
      {/* Location Permission Banner */}
      {!location && !locationLoading && activeTab === 'discover' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-800">Enable location for better matches</p>
                <p className="text-xs text-blue-600">Find people near you and see distances</p>
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

      <main className="pt-20 pb-4">
        <div className="container mx-auto px-4">
          {activeTab === 'swipe' && (
            <SwipeStack />
          )}
          {activeTab === 'discover' && (
            <DiscoveryGrid currentUserId={user.id} userLocation={location} />
          )}
          {activeTab === 'matches' && (
            <MatchesList 
              matches={matches}
              users={users}
              onChatClick={handleChatSelect}
              currentUserId={user.id}
            />
          )}
          {activeTab === 'chat' && selectedMatchId && selectedOtherUser && (
            <ChatInterface 
              matchId={selectedMatchId}
              otherUser={selectedOtherUser}
              onBack={() => setActiveTab('matches')}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {showProfile && (
        <ProfileSetup onComplete={() => setShowProfile(false)} />
      )}
      
      {showSettings && (
        <SettingsModal 
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showFilters && (
        <AdvancedFilters 
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
        />
      )}

      {/* Logout Button - Always accessible */}
      <button
        onClick={handleLogout}
        className="fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg transition-colors z-40"
      >
        Logout
      </button>
    </div>
  );
};

export default Index;
