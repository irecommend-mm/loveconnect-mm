
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, User, Zap, Settings, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import VideoSwipeStack from '@/components/VideoSwipeStack';
import Stories from '@/components/Stories';
import LikesYouGrid from '@/components/LikesYouGrid';
import MatchesList from '@/components/MatchesList';
import ChatInterface from '@/components/ChatInterface';
import ProfileSetup from '@/components/ProfileSetup';
import PremiumFeatures from '@/components/PremiumFeatures';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types/User';

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [showProfile, setShowProfile] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadMatches();
    loadUsers();
  }, [user, navigate]);

  const loadMatches = async () => {
    if (!user) return;

    try {
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          *,
          profiles!matches_user1_id_fkey(name, age),
          profiles!matches_user2_id_fkey(name, age)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true);

      setMatches(matchesData || []);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);

      if (usersData) {
        const usersWithPhotos = await Promise.all(
          usersData.map(async (profile) => {
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
              lastActive: new Date(),
              height: profile.height || '',
              zodiacSign: profile.zodiac_sign || '',
              relationshipType: 'serious' as const,
              children: 'unsure' as const,
              smoking: 'no' as const,
              drinking: 'sometimes' as const,
              exercise: 'sometimes' as const,
            };
          })
        );

        setUsers(usersWithPhotos);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleChatClick = (matchedUser: UserType) => {
    setSelectedUser(matchedUser);
    setSelectedMatch('mock-match-id');
  };

  const handleVideoCall = (matchedUser: UserType) => {
    console.log('Starting video call with:', matchedUser.name);
  };

  if (!user) {
    return null;
  }

  if (selectedMatch && selectedUser) {
    return (
      <ChatInterface
        matchId={selectedMatch}
        otherUser={selectedUser}
        onBack={() => {
          setSelectedMatch(null);
          setSelectedUser(null);
        }}
        onVideoCall={() => handleVideoCall(selectedUser)}
      />
    );
  }

  if (showProfile) {
    return (
      <ProfileSetup
        onComplete={() => setShowProfile(false)}
        onBack={() => setShowProfile(false)}
      />
    );
  }

  if (showPremium) {
    return (
      <PremiumFeatures
        onClose={() => setShowPremium(false)}
        currentTier="free"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              VideoLove
            </h1>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowPremium(true)}
                size="sm"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
              >
                <Zap className="h-4 w-4 mr-1" />
                Premium
              </Button>
              
              <Button
                onClick={() => setShowProfile(true)}
                size="sm"
                variant="outline"
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </Button>
              
              <Button
                onClick={logout}
                size="sm"
                variant="ghost"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="discover" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            
            <TabsTrigger value="likes" className="flex items-center space-x-2">
              <Heart className="h-4 w-4 fill-current" />
              <span className="hidden sm:inline">Likes</span>
            </TabsTrigger>
            
            <TabsTrigger value="matches" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Matches</span>
            </TabsTrigger>
            
            <TabsTrigger value="stories" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-0">
            <VideoSwipeStack />
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <LikesYouGrid />
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            <MatchesList
              matches={matches}
              users={users}
              onChatClick={handleChatClick}
              onVideoCall={handleVideoCall}
              currentUserId={user.id}
            />
          </TabsContent>

          <TabsContent value="stories" className="mt-0">
            <Stories />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
