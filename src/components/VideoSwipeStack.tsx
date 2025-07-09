
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, X, Star, RotateCcw, Zap, Shield, Flag, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  job: string;
  education: string;
  interests: string[];
  verified: boolean;
  photos: string[];
}

const VideoSwipeStack = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get users who haven't been swiped on
      const { data: swipedUserIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const excludeIds = swipedUserIds?.map(s => s.swiped_id) || [];

      // Get profiles
      let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      if (excludeIds.length > 0) {
        profilesQuery = profilesQuery.not('user_id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data: profilesData } = await profilesQuery;

      if (profilesData) {
        const profilesWithExtras = await Promise.all(
          profilesData.map(async (profile) => {
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

            return {
              ...profile,
              photos: photosResult.data?.map(p => p.url) || [],
              interests: interestsResult.data?.map(i => i.interest) || [],
            };
          })
        );

        setProfiles(profilesWithExtras);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading profiles:', error);
      setLoading(false);
    }
  };

  const handleSwipe = async (action: 'like' | 'dislike' | 'super_like') => {
    if (!user || currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    
    try {
      // Record the swipe
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: currentProfile.user_id,
          action,
        });

      if (error) throw error;

      // Check for match if it's a like or super_like
      if (action === 'like' || action === 'super_like') {
        const { data: matchData } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', currentProfile.user_id)
          .eq('swiped_id', user.id)
          .eq('action', 'like')
          .maybeSingle();

        if (matchData) {
          // Create match record
          await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: currentProfile.user_id
            });

          toast({
            title: "It's a Match! 💕",
            description: `You and ${currentProfile.name} liked each other!`,
          });
        } else {
          const actionText = action === 'super_like' ? 'Super liked' : 'Liked';
          toast({
            title: `${actionText}! 💕`,
            description: `You ${actionText.toLowerCase()} ${currentProfile.name}.`,
          });
        }
      }

      // Move to next profile
      setCurrentIndex(currentIndex + 1);

    } catch (error) {
      console.error('Error recording swipe:', error);
      toast({
        title: "Error",
        description: "Unable to record your action. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <Heart className="h-24 w-24 text-gray-300 mx-auto mb-8" />
        <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">No more profiles!</h3>
        <p className="text-gray-500 text-center mb-8">Check back later for new people to connect with.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 text-lg rounded-full"
        >
          Refresh
        </Button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const primaryPhoto = currentProfile.photos.find(photo => photo) || 'https://images.unsplash.com/photo-1494790108755-2616c72e5184?w=400&h=600&fit=crop';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 relative overflow-hidden">
      {/* Profile Card */}
      <div className="absolute inset-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Photo */}
        <div className="h-2/3 relative">
          <img
            src={primaryPhoto}
            alt={`${currentProfile.name}'s photo`}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-3xl font-bold text-white">{currentProfile.name}</h2>
              <span className="text-2xl text-white">{currentProfile.age}</span>
              {currentProfile.verified && (
                <Badge className="bg-blue-500 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            {currentProfile.location && (
              <p className="text-white/80 text-sm mb-2">📍 {currentProfile.location}</p>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="h-1/3 p-6 overflow-y-auto">
          {currentProfile.bio && (
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">{currentProfile.bio}</p>
          )}

          {currentProfile.job && (
            <div className="mb-3">
              <span className="text-gray-500 text-xs font-medium">WORK</span>
              <p className="text-gray-800 text-sm">{currentProfile.job}</p>
            </div>
          )}

          {currentProfile.interests.length > 0 && (
            <div className="mb-3">
              <span className="text-gray-500 text-xs font-medium mb-2 block">INTERESTS</span>
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.slice(0, 6).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <Button
          onClick={() => handleSwipe('dislike')}
          size="lg"
          className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-200 shadow-lg"
        >
          <X className="h-8 w-8 text-gray-500" />
        </Button>
        
        <Button
          onClick={() => handleSwipe('super_like')}
          size="lg"
          className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg"
        >
          <Star className="h-8 w-8 text-white fill-current" />
        </Button>
        
        <Button
          onClick={() => handleSwipe('like')}
          size="lg"
          className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 shadow-lg"
        >
          <Heart className="h-8 w-8 text-white fill-current" />
        </Button>
      </div>

      {/* Top Actions */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button
          size="sm"
          className="bg-white/90 backdrop-blur-sm hover:bg-white border-0 text-gray-700 shadow-lg"
        >
          <Flag className="h-4 w-4 mr-1" />
          Report
        </Button>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="bg-white/90 backdrop-blur-sm hover:bg-white border-0 text-gray-700 shadow-lg"
          >
            <Zap className="h-4 w-4 mr-1" />
            Boost
          </Button>
          
          <Button
            size="sm"
            className="bg-white/90 backdrop-blur-sm hover:bg-white border-0 text-gray-700 shadow-lg"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Rewind
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoSwipeStack;
