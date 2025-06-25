
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import ModernProfileModal from './ModernProfileModal';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  job: string;
  education: string;
  photos: string[];
  interests: string[];
  verified: boolean;
}

const SwipeStack = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Get profiles excluding current user and already swiped users
      const { data: swipedUsers } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedUsers?.map(s => s.swiped_id) || [];

      let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      // Only add the NOT IN filter if there are actually swiped users
      if (swipedUserIds.length > 0) {
        profilesQuery = profilesQuery.not('user_id', 'in', `(${swipedUserIds.join(',')})`);
      }

      const { data: profilesData, error } = await profilesQuery;

      if (error) {
        console.error('Error loading profiles:', error);
        toast({
          title: "Error loading profiles",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Load photos and interests for each profile
      const profilesWithData = await Promise.all(
        (profilesData || []).map(async (profile) => {
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

      setProfiles(profilesWithData.filter(p => p.photos.length > 0));
      setCurrentIndex(0); // Reset to first profile
      setLoading(false);
    } catch (error) {
      console.error('Error in loadProfiles:', error);
      toast({
        title: "Error loading profiles",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAction = async (action: 'like' | 'dislike' | 'super_like') => {
    if (!user || currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    
    if (!currentProfile?.user_id) {
      console.error('Invalid profile data:', currentProfile);
      toast({
        title: "Error",
        description: "Invalid profile data. Moving to next profile.",
        variant: "destructive",
      });
      setCurrentIndex(currentIndex + 1);
      return;
    }

    try {
      // Check if swipe already exists
      const { data: existingSwipe, error: existingSwipeError } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', user.id)
        .eq('swiped_id', currentProfile.user_id)
        .maybeSingle();

      if (existingSwipeError) {
        console.error('Error checking existing swipe:', existingSwipeError);
        toast({
          title: "Error",
          description: "Unable to verify swipe status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (existingSwipe) {
        setCurrentIndex(currentIndex + 1);
        return;
      }

      // Create the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: currentProfile.user_id,
          action,
        });

      if (swipeError) {
        console.error('Error creating swipe:', swipeError);
        toast({
          title: "Error",
          description: "Unable to record your action. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Check for matches only if it's a like
      if (action === 'like') {
        const { data: matchData } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', currentProfile.user_id)
          .eq('swiped_id', user.id)
          .eq('action', 'like')
          .maybeSingle();

        if (matchData) {
          toast({
            title: "It's a Match! 🎉",
            description: `You and ${currentProfile.name} liked each other!`,
          });
        } else {
          toast({
            title: "Like sent! 💕",
            description: `You liked ${currentProfile.name}'s profile.`,
          });
        }
      }

      // Move to next profile
      setCurrentIndex(currentIndex + 1);

      // Load more profiles if running low
      if (currentIndex >= profiles.length - 2) {
        setTimeout(() => {
          loadProfiles();
        }, 100);
      }

    } catch (error) {
      console.error('Unexpected error in handleAction:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const convertToUserType = (profile: Profile) => ({
    id: profile.user_id,
    name: profile.name,
    age: profile.age,
    bio: profile.bio,
    photos: profile.photos,
    interests: profile.interests,
    location: profile.location,
    job: profile.job,
    education: profile.education,
    verified: profile.verified,
    lastActive: new Date(),
    height: '',
    zodiacSign: '',
    relationshipType: 'serious' as const,
    children: 'unsure' as const,
    smoking: 'no' as const,
    drinking: 'sometimes' as const,
    exercise: 'sometimes' as const,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Finding amazing people for you...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <Heart className="h-24 w-24 text-gray-300 mx-auto mb-8" />
        <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">That's everyone for now!</h3>
        <p className="text-gray-500 text-center mb-8">Check back later for new people to connect with.</p>
        <Button 
          onClick={loadProfiles} 
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-xl hover:scale-105 transition-all duration-200"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-safe pb-safe">
      <div className="container mx-auto px-4 py-8">
        {/* Simplified Card Design without complex swipe gestures */}
        <div className="relative w-full max-w-sm mx-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Photo Section */}
            <div className="relative h-96 md:h-[500px] overflow-hidden">
              <img
                src={currentProfile.photos[0]}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              {/* Verification Badge */}
              {currentProfile.verified && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 0L12.09 6.26L20 6.93L15.18 12.99L17.64 20L10 16.18L2.36 20L4.82 12.99L0 6.93L7.91 6.26L10 0Z"/>
                  </svg>
                </div>
              )}

              {/* Info Button */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>

            {/* Profile Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center space-x-2 mb-3">
                <h2 className="text-2xl md:text-3xl font-bold">{currentProfile.name}</h2>
                <span className="text-xl md:text-2xl">{currentProfile.age}</span>
              </div>
              
              {currentProfile.location && (
                <div className="flex items-center space-x-2 text-sm opacity-90 mb-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{currentProfile.location}</span>
                </div>
              )}
              
              {currentProfile.job && (
                <div className="flex items-center space-x-2 text-sm opacity-90 mb-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                  </svg>
                  <span>{currentProfile.job}</span>
                </div>
              )}

              {currentProfile.bio && (
                <p className="text-sm opacity-90 mb-4 line-clamp-2">{currentProfile.bio}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.slice(0, 3).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 text-white text-xs backdrop-blur-sm rounded-full border-0"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center items-center space-x-6 mt-8 px-4">
            <Button
              onClick={() => handleAction('dislike')}
              size="lg"
              className="w-16 h-16 rounded-full bg-white shadow-xl border-2 border-gray-100 hover:scale-110 active:scale-95 transition-all duration-200 group"
            >
              <svg className="h-7 w-7 text-gray-600 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
            
            <Button
              onClick={() => handleAction('super_like')}
              size="lg"
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
            >
              <svg className="h-6 w-6 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </Button>
            
            <Button
              onClick={() => handleAction('like')}
              size="lg"
              className="w-18 h-18 rounded-full bg-gradient-to-r from-pink-500 to-red-500 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
            >
              <Heart className="h-8 w-8 text-white fill-current" />
            </Button>
          </div>
        </div>

        {/* Profile Modal */}
        {showProfileModal && (
          <ModernProfileModal
            user={convertToUserType(currentProfile)}
            onClose={() => setShowProfileModal(false)}
            onLike={() => {
              setShowProfileModal(false);
              handleAction('like');
            }}
            onPass={() => {
              setShowProfileModal(false);
              handleAction('dislike');
            }}
            onSuperLike={() => {
              setShowProfileModal(false);
              handleAction('super_like');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SwipeStack;
