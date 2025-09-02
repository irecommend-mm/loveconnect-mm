
import React, { useState, useEffect } from 'react';
import { Heart, Crown, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import PremiumFeatures from './PremiumFeatures';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  photos: string[];
  location: string;
  action: 'like' | 'super_like';
}

interface WhoLikesYouPageProps {
  onShowPremium: () => void;
}

const WhoLikesYouPage = ({ onShowPremium }: WhoLikesYouPageProps) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium] = useState(false); // This would be dynamic based on user's subscription
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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
            // Get photos from the photos table
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
              action: (swipeInfo?.action === 'super_like' ? 'super_like' : 'like') as 'like' | 'super_like'
            };
          })
        );

        // Filter profiles that have at least one photo
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
      // Create a mutual match by adding a swipe from current user
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: likedProfile.user_id,
          action: 'like'
        });

      if (swipeError) throw swipeError;

      // Check if this creates a mutual match
      const { data: mutualMatch } = await supabase
        .from('swipes')
        .select('*')
        .or(`and(swiper_id.eq.${user.id},swiped_id.eq.${likedProfile.user_id}),and(swiper_id.eq.${likedProfile.user_id},swiped_id.eq.${user.id})`);

      if (mutualMatch && mutualMatch.length === 2) {
        // Create match record
        await supabase
          .from('matches')
          .insert({
            user1_id: user.id,
            user2_id: likedProfile.user_id
          });

        toast({
          title: "It's a Match! 🎉",
          description: `You and ${likedProfile.name} liked each other!`,
        });
      } else {
        toast({
          title: "Like sent! 💕",
          description: `${likedProfile.name} will be notified of your interest.`,
        });
      }

      // Remove from likes list
      setLikes(prev => prev.filter(p => p.id !== likedProfile.id));

    } catch (error) {
      console.error('Error liking back:', error);
      toast({
        title: "Error",
        description: "Failed to send like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePass = async (likedProfile: Profile) => {
    try {
      // Remove from likes list
      setLikes(prev => prev.filter(p => p.id !== likedProfile.id));

      toast({
        title: "Profile passed",
        description: `${likedProfile.name} won't appear in your likes again.`,
      });
    } catch (error) {
      console.error('Error passing profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (likes.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold mb-2">No likes yet</h3>
        <p className="text-gray-600 mb-6">
          When someone likes your profile, they'll appear here.
        </p>
        <Button
          onClick={() => onShowPremium()}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <Crown className="h-4 w-4 mr-2" />
          Get Premium to see who likes you
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Who Liked You
          <span className="text-pink-500 ml-2">({likes.length})</span>
        </h2>
        {!isPremium && (
          <Button
            onClick={() => setShowPremiumModal(true)}
            variant="outline"
            className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {likes.map((profile) => (
          <div
            key={profile.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
          >
            {/* Profile Photo */}
            <div className="relative h-48 overflow-hidden">
              {profile.photos.length > 0 ? (
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <Heart className="h-16 w-16 text-gray-300" />
                </div>
              )}
              
              {/* Action Badge */}
              <div className="absolute top-3 right-3">
                {profile.action === 'super_like' ? (
                  <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Super Like
                  </div>
                ) : (
                  <div className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    Liked
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile.name}, {profile.age}
                </h3>
                {profile.location && (
                  <span className="text-sm text-gray-500">
                    📍 {profile.location}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePass(profile)}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:border-red-400 hover:bg-red-50"
                >
                  Pass
                </Button>
                <Button
                  onClick={() => handleLikeBack(profile)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Like Back
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <PremiumFeatures
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={onShowPremium}
        />
      )}
    </div>
  );
};

export default WhoLikesYouPage;
