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
import { MapPin, Heart, Users, Search, User as UserIcon, Settings, LogOut, Filter } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterSettings, setFilterSettings] = useState({
    ageRange: [18, 50] as [number, number],
    maxDistance: 50,
    showMe: 'everyone',
    relationshipType: 'any',
    verifiedOnly: false,
    onlineOnly: false,
    hasPhotos: true,
    education: [],
    interests: [],
    useLocationFilter: true
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
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true);

      if (matchesData) {
        setMatches(matchesData);
        
        // Load user profiles for matches
        const userIds = matchesData.flatMap(match => [match.user1_id, match.user2_id])
          .filter(id => id !== userId);
        
        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from('profiles')
            .select('*, photos(*)')
            .in('user_id', userIds);
          
          if (usersData) {
            setUsers(usersData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const handleProfileComplete = () => {
    setHasProfile(true);
    checkUserProfile(user!.id);
  };

  const handleChatSelect = (selectedUser: any) => {
    // Find the match ID for this user
    const match = matches.find(m => 
      (m.user1_id === user?.id && m.user2_id === selectedUser.id) ||
      (m.user2_id === user?.id && m.user1_id === selectedUser.id)
    );
    
    if (match) {
      setSelectedMatchId(match.id);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleApplyFilters = (filters: any) => {
    setFilterSettings({
      ...filters,
      ageRange: filters.ageRange as [number, number]
    });
    console.log('Applied filters:', filters);
  };

  const handleUpdateSettings = (settings: any) => {
    console.log('Updated settings:', settings);
    // You can add settings update logic here
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
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-pink-100 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-pink-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              LoveConnect
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeTab === 'browse' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="p-2"
              >
                <Filter className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="p-2"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 text-red-500 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'discover' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              <Heart className="h-5 w-5" />
              <span className="text-xs font-medium">Discover</span>
            </button>
            
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'browse' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              <Search className="h-5 w-5" />
              <span className="text-xs font-medium">Browse</span>
            </button>
            
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'matches' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium">Matches</span>
              {matches.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {matches.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'profile' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              <UserIcon className="h-5 w-5" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Location Permission Banner */}
      {!location && !locationLoading && (activeTab === 'discover' || activeTab === 'browse') && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-32 rounded">
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

      <main className="pt-32 pb-4">
        <div className="container mx-auto px-4">
          {activeTab === 'discover' && (
            <SwipeStack />
          )}
          {activeTab === 'browse' && (
            <DiscoveryGrid 
              currentUserId={user.id} 
              userLocation={location} 
            />
          )}
          {activeTab === 'matches' && (
            <MatchesList 
              matches={matches} 
              users={users} 
              onChatClick={handleChatSelect} 
              currentUserId={user.id} 
            />
          )}
          {activeTab === 'profile' && (
            <ProfileSetup onComplete={() => setActiveTab('discover')} />
          )}
          {activeTab === 'chat' && selectedMatchId && (
            <ChatInterface 
              matchId={selectedMatchId}
              otherUser={{ id: '', name: '', photos: [] }}
              onBack={() => setActiveTab('matches')}
            />
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          settings={{
            discovery: { ageRange: [18, 35], maxDistance: 50, showMe: 'everyone', relationshipType: 'serious' },
            notifications: { matches: true, messages: true, likes: true },
            privacy: { showAge: true, showDistance: true, incognito: false }
          }}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {/* Advanced Filters Modal */}
      {showFilters && (
        <AdvancedFilters 
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          initialFilters={filterSettings}
        />
      )}
    </div>
  );
};

export default Index;
