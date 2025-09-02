
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

  const handleUpgrade = (plan: string) => {
    setShowPremiumModal(false);
    onShowPremium();
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Who Likes You</h1>
            <p className="text-gray-600">{likes.length} people liked you</p>
          </div>
          <Heart className="h-6 w-6 text-pink-500" />
        </div>
      </div>

      {/* Premium Upgrade Banner */}
      {!isPremium && (
        <div 
          onClick={() => setShowPremiumModal(true)}
          className="mx-4 mt-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white cursor-pointer hover:from-pink-600 hover:to-purple-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Upgrade to Premium</span>
              </div>
              <p className="text-sm opacity-90">
                See everyone who likes you and get unlimited swipes!
              </p>
            </div>
            <Crown className="h-8 w-8" />
          </div>
        </div>
      )}

      {/* Likes Grid */}
      <div className="p-4">
        {likes.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No likes yet</h3>
            <p className="text-gray-500">Keep swiping to find your matches!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {likes.map((profile) => (
              <div 
                key={profile.id} 
                className="relative cursor-pointer"
                onClick={() => !isPremium && setShowPremiumModal(true)}
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                  {isPremium ? (
                    <img
                      src={profile.photos[0]}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={profile.photos[0]}
                        alt={profile.name}
                        className="w-full h-full object-cover blur-lg"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="bg-white/90 p-3 rounded-full">
                          <Crown className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action indicator */}
                  <div className="absolute top-2 right-2">
                    {profile.action === 'super_like' ? (
                      <div className="bg-blue-500 p-2 rounded-full shadow-lg">
                        <Sparkles className="h-4 w-4 text-white fill-current" />
                      </div>
                    ) : (
                      <div className="bg-pink-500 p-2 rounded-full shadow-lg">
                        <Heart className="h-4 w-4 text-white fill-current" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile info */}
                <div className="mt-2">
                  {isPremium ? (
                    <>
                      <h3 className="font-semibold text-gray-900">
                        {profile.name}, {profile.age}
                      </h3>
                      {profile.location && (
                        <p className="text-xs text-gray-600">{profile.location}</p>
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeBack(profile);
                        }}
                        className="w-full mt-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-full"
                        size="sm"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Like Back
                      </Button>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full"
                        size="sm"
                      >
                        <Crown className="h-4 w-4 mr-1" />
                        Upgrade to See
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <PremiumFeatures
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  );
};

export default WhoLikesYouPage;
