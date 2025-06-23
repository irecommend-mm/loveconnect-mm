import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Star, MapPin, Briefcase, GraduationCap, Info } from 'lucide-react';
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

  const handleSwipe = async (action: 'like' | 'dislike' | 'super_like') => {
    if (!user || currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    console.log('Attempting to swipe:', { 
      swiper_id: user.id, 
      swiped_id: currentProfile.user_id, 
      action 
    });

    try {
      // First, verify both users exist in profiles table
      const { data: swiperProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: swipedProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', currentProfile.user_id)
        .maybeSingle();

      if (!swiperProfile) {
        console.error('Swiper profile does not exist:', user.id);
        toast({
          title: "Profile Error",
          description: "Your profile was not found. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      if (!swipedProfile) {
        console.error('Swiped profile does not exist:', currentProfile.user_id);
        toast({
          title: "Profile Unavailable",
          description: "This profile is no longer available.",
          variant: "destructive",
        });
        setCurrentIndex(currentIndex + 1);
        return;
      }

      // Check if swipe already exists
      const { data: existingSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', user.id)
        .eq('swiped_id', currentProfile.user_id)
        .maybeSingle();

      if (existingSwipe) {
        console.log('Swipe already exists, moving to next profile');
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

      console.log('Swipe created successfully');

      if (action === 'like') {
        // Check if this creates a match
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
        }
      }

      setCurrentIndex(currentIndex + 1);

      // Load more profiles if running low
      if (currentIndex >= profiles.length - 2) {
        loadProfiles();
      }
    } catch (error) {
      console.error('Unexpected error in handleSwipe:', error);
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No more profiles</h3>
        <p className="text-gray-500">Check back later for new people!</p>
        <Button 
          onClick={loadProfiles} 
          className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600"
        >
          Refresh
        </Button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Profile Image */}
        <div className="relative h-96">
          <img
            src={currentProfile.photos[0]}
            alt={currentProfile.name}
            className="w-full h-full object-cover"
          />
          {currentProfile.verified && (
            <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-2">
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
          )}
          
          {/* Info Button */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="absolute top-4 left-4 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"
          >
            <Info className="h-5 w-5 text-white" />
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h2 className="text-white text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
            {currentProfile.location && (
              <div className="flex items-center text-white/90 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{currentProfile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 space-y-4">
          {currentProfile.bio && (
            <p className="text-gray-700">{currentProfile.bio}</p>
          )}

          <div className="space-y-3">
            {currentProfile.job && (
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-4 w-4 mr-2" />
                <span className="text-sm">{currentProfile.job}</span>
              </div>
            )}

            {currentProfile.education && (
              <div className="flex items-center text-gray-600">
                <GraduationCap className="h-4 w-4 mr-2" />
                <span className="text-sm">{currentProfile.education}</span>
              </div>
            )}
          </div>

          {currentProfile.interests.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.slice(0, 6).map((interest) => (
                  <Badge key={interest} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center p-6 space-x-4">
          <Button
            onClick={() => handleSwipe('dislike')}
            size="lg"
            variant="outline"
            className="rounded-full w-14 h-14 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <X className="h-6 w-6 text-red-500" />
          </Button>

          <Button
            onClick={() => handleSwipe('super_like')}
            size="lg"
            variant="outline"
            className="rounded-full w-14 h-14 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          >
            <Star className="h-6 w-6 text-blue-500" />
          </Button>

          <Button
            onClick={() => handleSwipe('like')}
            size="lg"
            variant="outline"
            className="rounded-full w-14 h-14 border-green-200 hover:bg-green-50 hover:border-green-300"
          >
            <Heart className="h-6 w-6 text-green-500" />
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
            handleSwipe('like');
          }}
          onPass={() => {
            setShowProfileModal(false);
            handleSwipe('dislike');
          }}
          onSuperLike={() => {
            setShowProfileModal(false);
            handleSwipe('super_like');
          }}
        />
      )}
    </div>
  );
};

export default SwipeStack;
