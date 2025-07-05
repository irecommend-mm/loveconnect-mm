
import React, { useState, useEffect } from 'react';
import { Heart, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  photos: string[];
  location: string;
  action: 'like' | 'super_like';
}

const LikesYouGrid = () => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLikes();
    }
  }, [user]);

  const loadLikes = async () => {
    if (!user) return;

    try {
      // Get users who liked current user
      const { data: swipeData } = await supabase
        .from('swipes')
        .select('swiper_id, action')
        .eq('swiped_id', user.id)
        .in('action', ['like', 'super_like']);

      if (!swipeData || swipeData.length === 0) {
        setLikes([]);
        setLoading(false);
        return;
      }

      const likerIds = swipeData.map(s => s.swiper_id);

      // Get profiles of users who liked current user
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', likerIds);

      if (profilesData) {
        const profilesWithPhotos = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: photosData } = await supabase
              .from('photos')
              .select('url')
              .eq('user_id', profile.user_id)
              .order('position');

            const swipeInfo = swipeData.find(s => s.swiper_id === profile.user_id);

            return {
              id: profile.user_id,
              user_id: profile.user_id,
              name: profile.name,
              age: profile.age,
              photos: photosData?.map(p => p.url) || [],
              location: profile.location || '',
              action: swipeInfo?.action || 'like'
            };
          })
        );

        setLikes(profilesWithPhotos.filter(p => p.photos.length > 0));
      }
    } catch (error) {
      console.error('Error loading likes:', error);
      toast({
        title: "Error loading likes",
        description: "Unable to load people who liked you",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (likedProfile: Profile) => {
    if (!user) return;

    try {
      // Create swipe back
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: likedProfile.user_id,
          action: 'like',
        });

      if (error) throw error;

      // Create match
      await supabase
        .from('matches')
        .insert({
          user1_id: user.id,
          user2_id: likedProfile.user_id
        });

      toast({
        title: "It's a Match! 💕",
        description: `You and ${likedProfile.name} liked each other!`,
      });

      // Remove from likes list
      setLikes(prev => prev.filter(p => p.id !== likedProfile.id));
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Unable to create match",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  if (likes.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No likes yet</h3>
        <p className="text-gray-500">Keep swiping to find your matches!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">People who liked you</h2>
        <p className="text-gray-600">{likes.length} people are interested in you</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {likes.map((profile) => (
          <div key={profile.id} className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="relative h-48">
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              
              {/* Action indicator */}
              <div className="absolute top-2 right-2">
                {profile.action === 'super_like' ? (
                  <div className="bg-blue-500 p-2 rounded-full">
                    <Star className="h-4 w-4 text-white fill-current" />
                  </div>
                ) : (
                  <div className="bg-pink-500 p-2 rounded-full">
                    <Heart className="h-4 w-4 text-white fill-current" />
                  </div>
                )}
              </div>

              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
              
              {/* Profile info */}
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <h3 className="font-semibold text-sm">{profile.name}, {profile.age}</h3>
                {profile.location && (
                  <p className="text-xs opacity-90">{profile.location}</p>
                )}
              </div>
            </div>

            <div className="p-3">
              <Button
                onClick={() => handleLikeBack(profile)}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-2 rounded-full text-sm"
              >
                <Heart className="h-4 w-4 mr-1" />
                Like Back
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Premium upsell */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 text-center">
        <Crown className="h-12 w-12 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Upgrade to Premium</h3>
        <p className="text-gray-600 text-sm mb-4">
          See everyone who likes you and get unlimited likes!
        </p>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
          Upgrade Now
        </Button>
      </div>
    </div>
  );
};

export default LikesYouGrid;
