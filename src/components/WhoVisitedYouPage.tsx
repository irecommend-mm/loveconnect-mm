
import React, { useState, useEffect } from 'react';
import { Eye, Crown, Sparkles } from 'lucide-react';
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

  const formatVisitTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Who Visited You</h1>
            <p className="text-gray-600">{visitors.length} profile visits</p>
          </div>
          <Eye className="h-6 w-6 text-purple-500" />
        </div>
      </div>

      {/* Premium Upgrade Banner */}
      {!isPremium && (
        <div 
          onClick={() => setShowPremiumModal(true)}
          className="mx-4 mt-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer hover:from-purple-600 hover:to-blue-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-5 w-5" />
                <span className="font-semibold">See Who Visited You</span>
              </div>
              <p className="text-sm opacity-90">
                Upgrade to see everyone who checked out your profile!
              </p>
            </div>
            <Crown className="h-8 w-8" />
          </div>
        </div>
      )}

      {/* Visitors Grid */}
      <div className="p-4">
        {visitors.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No visits yet</h3>
            <p className="text-gray-500">Your profile will attract visitors soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {visitors.map((profile) => (
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
                          <Eye className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Visit indicator */}
                  <div className="absolute top-2 right-2">
                    <div className="bg-purple-500 p-2 rounded-full shadow-lg">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
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
                      <p className="text-xs text-purple-600 font-medium">
                        Visited {formatVisitTime(profile.visited_at)}
                      </p>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full"
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

export default WhoVisitedYouPage;
