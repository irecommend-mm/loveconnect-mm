
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import ModernProfileModal from './ModernProfileModal';
import MobileSwipeCard from './MobileSwipeCard';

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
    
    // Validate that we have required data
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

    console.log('Attempting to swipe:', { 
      swiper_id: user.id, 
      swiped_id: currentProfile.user_id, 
      action 
    });

    try {
      // Check if swipe already exists first (most efficient check)
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
        console.log('Swipe already exists, moving to next profile');
        setCurrentIndex(currentIndex + 1);
        return;
      }

      // Validate both user profiles exist in the database
      const { data: profileValidation, error: validationError } = await supabase
        .from('profiles')
        .select('user_id')
        .in('user_id', [user.id, currentProfile.user_id]);

      if (validationError) {
        console.error('Error validating profiles:', validationError);
        toast({
          title: "Error",
          description: "Unable to validate profiles. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const userIds = profileValidation?.map(p => p.user_id) || [];
      
      if (!userIds.includes(user.id)) {
        console.error('Current user profile not found in database:', user.id);
        toast({
          title: "Profile Error",
          description: "Your profile was not found. Please refresh the page and try again.",
          variant: "destructive",
        });
        return;
      }

      if (!userIds.includes(currentProfile.user_id)) {
        console.error('Target profile not found in database:', currentProfile.user_id);
        toast({
          title: "Profile Unavailable",
          description: "This profile is no longer available.",
          variant: "destructive",
        });
        setCurrentIndex(currentIndex + 1);
        return;
      }

      // Create the swipe with proper error handling
      const { data: swipeData, error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: currentProfile.user_id,
          action,
        })
        .select()
        .single();

      if (swipeError) {
        console.error('Error creating swipe:', swipeError);
        
        // Provide more specific error messages
        if (swipeError.code === '23503') {
          toast({
            title: "Profile Error",
            description: "One of the profiles is no longer available. Please refresh.",
            variant: "destructive",
          });
        } else if (swipeError.code === '23505') {
          // Duplicate key error - swipe already exists
          console.log('Duplicate swipe detected, moving to next profile');
          setCurrentIndex(currentIndex + 1);
          return;
        } else {
          toast({
            title: "Error",
            description: "Unable to record your action. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      console.log('Swipe created successfully:', swipeData);

      // Check for matches only if it's a like
      if (action === 'like') {
        try {
          const { data: matchData, error: matchError } = await supabase
            .from('swipes')
            .select('*')
            .eq('swiper_id', currentProfile.user_id)
            .eq('swiped_id', user.id)
            .eq('action', 'like')
            .maybeSingle();

          if (matchError) {
            console.error('Error checking for match:', matchError);
            // Don't block the swipe for match check errors
          } else if (matchData) {
            toast({
              title: "It's a Match! 🎉",
              description: `You and ${currentProfile.name} liked each other!`,
            });
          }
        } catch (matchCheckError) {
          console.error('Error in match check:', matchCheckError);
          // Continue with the flow even if match check fails
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Finding amazing people for you...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <Heart className="h-24 w-24 text-gray-300 mx-auto mb-8" />
        <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">That's everyone for now!</h3>
        <p className="text-gray-500 text-center mb-8">Check back later for new people to connect with.</p>
        <Button 
          onClick={loadProfiles} 
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-xl hover:scale-105 transition-all duration-200"
        >
          Refresh
        </Button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-safe pb-safe">
      <div className="container mx-auto px-4 py-8">
        <MobileSwipeCard
          profile={currentProfile}
          onSwipe={handleSwipe}
          onShowProfile={() => setShowProfileModal(true)}
        />

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
    </div>
  );
};

export default SwipeStack;
