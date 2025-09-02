
import React, { useState, useEffect } from 'react';
import { Eye, Crown, Sparkles, Heart } from 'lucide-react';
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
  visited_at: string;
}

interface WhoVisitedYouPageProps {
  onShowPremium: () => void;
}

const WhoVisitedYouPage = ({ onShowPremium }: WhoVisitedYouPageProps) => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium] = useState(false); // This would be dynamic based on user's subscription
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadVisitors();
    }
  }, [user]);

  const loadVisitors = async () => {
    if (!user) return;

    try {
      // Get users who visited current user's profile
      const { data: visitData } = await supabase
        .from('profile_views')
        .select('viewer_id, created_at')
        .eq('viewed_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!visitData || visitData.length === 0) {
        setVisitors([]);
        setLoading(false);
        return;
      }

      const visitorIds = visitData.map(v => v.viewer_id);

      // Get profiles of users who visited current user
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', visitorIds);

      if (profilesData) {
        const profilesWithPhotos = await Promise.all(
          profilesData.map(async (profile) => {
            // Get photos from the photos table
            const { data: photosData } = await supabase
              .from('photos')
              .select('url')
              .eq('user_id', profile.user_id)
              .order('position');

            const visitInfo = visitData.find(v => v.viewer_id === profile.user_id);

            return {
              id: profile.user_id,
              user_id: profile.user_id,
              name: profile.name,
              age: profile.age,
              photos: photosData?.map(p => p.url) || [],
              location: profile.location || '',
              visited_at: visitInfo?.created_at || ''
            };
          })
        );

        // Filter profiles that have at least one photo
        setVisitors(profilesWithPhotos.filter(p => p.photos.length > 0));
      }
    } catch (error) {
      console.error('Error loading visitors:', error);
      toast({
        title: "Error loading visitors",
        description: "Unable to load people who visited you",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (plan: string) => {
    setShowPremiumModal(false);
    onShowPremium();
  };

  const handleLike = async (visitorProfile: Profile) => {
    if (!user) return;

    try {
      // Create a swipe from current user to visitor
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: visitorProfile.user_id,
          action: 'like'
        });

      if (error) throw error;

      toast({
        title: "Like sent! 💕",
        description: `${visitorProfile.name} will be notified of your interest.`,
      });

      // Remove from visitors list
      setVisitors(prev => prev.filter(p => p.id !== visitorProfile.id));

    } catch (error) {
      console.error('Error sending like:', error);
      toast({
        title: "Error",
        description: "Failed to send like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePass = async (visitorProfile: Profile) => {
    try {
      // Remove from visitors list
      setVisitors(prev => prev.filter(p => p.id !== visitorProfile.id));

      toast({
        title: "Profile passed",
        description: `${visitorProfile.name} won't appear in your visitors again.`,
      });
    } catch (error) {
      console.error('Error passing profile:', error);
    }
  };

  const handleProfileClick = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold mb-2">No visitors yet</h3>
        <p className="text-gray-600 mb-6">
          When someone views your profile, they'll appear here.
        </p>
        <Button
          onClick={() => onShowPremium()}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <Crown className="h-4 w-4 mr-2" />
          Get Premium to see who visited you
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Who Visited You
          <span className="text-blue-500 ml-2">({visitors.length})</span>
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
        {visitors.map((profile) => (
          <div
            key={profile.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={handleProfileClick}
          >
            {/* Profile Photo */}
            <div className="relative h-48 overflow-hidden">
              {profile.photos.length > 0 ? (
                isPremium ? (
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
                      className="w-full h-full object-cover blur-sm"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Eye className="h-16 w-16 text-gray-300" />
                </div>
              )}
              
              {/* Visit Badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  Visited
                </div>
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

              {/* Visit Time */}
              {profile.visited_at && (
                <p className="text-sm text-gray-500 mb-3">
                  Visited {new Date(profile.visited_at).toLocaleDateString()}
                </p>
              )}

              {/* Action Buttons - Only show for premium users */}
              {isPremium ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePass(profile);
                    }}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:border-red-400 hover:bg-red-50"
                  >
                    Pass
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(profile);
                    }}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPremiumModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    size="sm"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to See
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <PremiumFeatures
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  );
};

export default WhoVisitedYouPage;
