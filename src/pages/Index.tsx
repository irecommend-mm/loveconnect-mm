
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageCircle, User, Settings, LogOut, Filter } from 'lucide-react';
import SwipeStack from '@/components/SwipeStack';
import MatchesList from '@/components/MatchesList';
import ProfileSetup from '@/components/ProfileSetup';
import ChatInterface from '@/components/ChatInterface';
import AdvancedFilters from '@/components/AdvancedFilters';
import DiscoveryGrid from '@/components/DiscoveryGrid';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType, Match } from '@/types/User';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      checkUserProfile();
      loadMatches();
      loadUsers();
      getUserLocation();
      updateOnlineStatus();
    }
  }, [user, loading, navigate]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Update user's location in the database - handle optional fields
          if (user) {
            const updateData: any = {
              last_active: new Date().toISOString()
            };
            
            // Only add lat/lng if they exist in the table schema
            try {
              updateData.latitude = latitude;
              updateData.longitude = longitude;
            } catch (e) {
              console.log('Location fields may not exist in schema');
            }
            
            supabase
              .from('profiles')
              .update(updateData)
              .eq('user_id', user.id)
              .then(() => console.log('Location updated'));
          }
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const updateOnlineStatus = () => {
    if (!user) return;
    
    // Update last_active timestamp every 30 seconds - handle optional field
    const interval = setInterval(() => {
      const updateData: any = {};
      
      try {
        updateData.last_active = new Date().toISOString();
      } catch (e) {
        console.log('last_active field may not exist in schema');
      }
      
      supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .then(() => console.log('Online status updated'));
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  };

  const checkUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setUserProfile(data);
      
      // Check if profile is complete
      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id);

      if (!photosData || photosData.length === 0 || !data.bio) {
        setShowProfileSetup(true);
      }
    }
  };

  const loadMatches = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Transform matches to include last message
      const matchesWithMessages = await Promise.all(
        data.map(async (match) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            id: match.id,
            users: [match.user1_id, match.user2_id] as [string, string],
            timestamp: new Date(match.created_at),
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              senderId: lastMessage.sender_id,
              content: lastMessage.content,
              timestamp: new Date(lastMessage.created_at),
              read: !!lastMessage.read_at,
              type: 'text' as const,
            } : undefined,
            isActive: match.is_active,
          };
        })
      );

      setMatches(matchesWithMessages);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (!error && data) {
      // Load photos and interests for each user
      const usersWithData = await Promise.all(
        data.map(async (profile) => {
          const [photosResult, interestsResult] = await Promise.all([
            supabase
              .from('photos')
              .select('url')
              .eq('user_id', profile.user_id)
              .order('position'),
            supabase
              .from('interests')
              .select('interest')
              .eq('user_id', profile.user_id)
          ]);

          // Check if user is online (active within last 10 minutes) - handle optional field
          const lastActiveDate = profile.last_active || profile.updated_at;
          const lastActive = new Date(lastActiveDate);
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
          const isOnline = lastActive > tenMinutesAgo;

          return {
            id: profile.user_id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
            photos: photosResult.data?.map(p => p.url) || [],
            interests: interestsResult.data?.map(i => i.interest) || [],
            location: profile.location || '',
            job: profile.job,
            education: profile.education,
            height: profile.height,
            zodiacSign: profile.zodiac_sign,
            relationshipType: profile.relationship_type as any,
            children: profile.children as any,
            smoking: profile.smoking as any,
            drinking: profile.drinking as any,
            exercise: profile.exercise as any,
            verified: profile.verified || false,
            lastActive: new Date(lastActiveDate),
            isOnline,
            latitude: profile.latitude ? Number(profile.latitude) : undefined,
            longitude: profile.longitude ? Number(profile.longitude) : undefined,
          };
        })
      );

      setUsers(usersWithData);
    }
  };

  const handleChatClick = (clickedUser: UserType) => {
    // Find the match between current user and clicked user
    const match = matches.find(m => 
      m.users.includes(user!.id) && m.users.includes(clickedUser.id)
    );

    if (match) {
      setSelectedMatch({
        matchId: match.id,
        otherUser: {
          id: clickedUser.id,
          name: clickedUser.name,
          photos: clickedUser.photos,
        }
      });
      setShowChat(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // Here you would apply the filters to your data loading logic
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <ProfileSetup 
          onComplete={() => {
            setShowProfileSetup(false);
            checkUserProfile();
          }}
          existingProfile={userProfile}
        />
      </div>
    );
  }

  if (showChat && selectedMatch) {
    return (
      <div className="h-screen">
        <ChatInterface
          matchId={selectedMatch.matchId}
          otherUser={selectedMatch.otherUser}
          onBack={() => {
            setShowChat(false);
            setSelectedMatch(null);
            loadMatches(); // Refresh matches to update last message
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              LoveConnect
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {activeTab === 'discover' && (
              <Button
                onClick={() => setShowFilters(true)}
                variant="ghost"
                size="sm"
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={() => setShowProfileSetup(true)}
              variant="ghost"
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="discover" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Discover</span>
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Browse</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Matches</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover People</h2>
              <p className="text-gray-600">Swipe right to like, left to pass</p>
            </div>
            <SwipeStack />
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <DiscoveryGrid currentUserId={user.id} userLocation={userLocation} />
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <MatchesList
              matches={matches}
              users={users}
              onChatClick={handleChatClick}
              currentUserId={user.id}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h2>
              <p className="text-gray-600">Manage your profile information</p>
            </div>
            <ProfileSetup 
              onComplete={() => {
                checkUserProfile();
                setActiveTab('discover');
              }}
              existingProfile={userProfile}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <AdvancedFilters
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
        />
      )}
    </div>
  );
};

export default Index;
