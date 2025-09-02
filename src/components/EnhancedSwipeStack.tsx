
import React, { useState, useEffect, useCallback } from 'react';
import { User as UserType } from '@/types/User';
import { AppMode, LocationData, UserFilters } from '@/types/FriendDateTypes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import EnhancedSwipeCard from './EnhancedSwipeCard';
import { toast } from '@/hooks/use-toast';

interface EnhancedSwipeStackProps {
  mode: AppMode;
  filters?: UserFilters | null;
}

const EnhancedSwipeStack = ({ mode, filters }: EnhancedSwipeStackProps) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get users who haven't been swiped by current user
      const { data: swipedUsers } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedUsers?.map(s => s.swiped_id) || [];

      // Build query for profiles
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      // Exclude already swiped users
      if (swipedUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${swipedUserIds.join(',')})`);
      }

      // Apply mode filter
      if (mode === 'friend') {
        query = query.or('relationship_type.eq.friendship,relationship_type.eq.friends');
      } else {
        query = query.or('relationship_type.eq.dating,relationship_type.eq.serious,relationship_type.eq.casual,relationship_type.is.null');
      }

      const { data: profilesData, error } = await query.limit(20);

      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }

      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        return;
      }

      // Load photos and interests for each profile
      const usersWithData = await Promise.all(
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

          // Helper function to safely extract interests from lifestyle JSON
          const getInterestsFromLifestyle = (lifestyle: unknown): string[] => {
            if (lifestyle && typeof lifestyle === 'object' && lifestyle !== null) {
              const lifestyleObj = lifestyle as { interests?: string[] };
              if (lifestyleObj.interests && Array.isArray(lifestyleObj.interests)) {
                return lifestyleObj.interests;
              }
            }
            return [];
          };

          // Map database values to frontend values
          const mapDrinking = (value: string | null) => {
            switch (value) {
              case 'socially': return 'sometimes';
              case 'regularly': return 'yes';
              case 'never': return 'no';
              default: return 'sometimes';
            }
          };

          const mapSmoking = (value: string | null) => {
            switch (value) {
              case 'never': return 'no';
              case 'sometimes': return 'sometimes';
              case 'regularly': return 'yes';
              default: return 'no';
            }
          };

          const mapExercise = (value: string | null) => {
            switch (value) {
              case 'never': return 'never';
              case 'sometimes': return 'sometimes';
              case 'regularly': case 'often': case 'daily': return 'often';
              default: return 'sometimes';
            }
          };

          return {
            id: profile.user_id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
            photos: photosResult.data?.map(p => p.url) || [],
            interests: interestsResult.data?.map(i => i.interest) || getInterestsFromLifestyle(profile.lifestyle),
            location: profile.location || '',
            job: profile.job_title || '',
            education: profile.education || '',
            verified: profile.verified || false,
            lastActive: new Date(profile.last_active || profile.created_at),
            height: profile.height_cm ? `${Math.floor(profile.height_cm / 30.48)}'${Math.round(((profile.height_cm / 30.48) % 1) * 12)}"` : '',
            zodiacSign: profile.zodiac_sign || '',
            relationshipType: (profile.relationship_type === 'friendship' ? 'friends' : profile.relationship_type || 'serious') as 'casual' | 'serious' | 'friends' | 'unsure',
            children: (profile.children || 'unsure') as 'have' | 'want' | 'dont_want' | 'unsure',
            smoking: mapSmoking(profile.smoking) as 'yes' | 'no' | 'sometimes',
            drinking: mapDrinking(profile.drinking) as 'yes' | 'no' | 'sometimes',
            exercise: mapExercise(profile.exercise) as 'often' | 'sometimes' | 'never',
            isOnline: false,
          } as UserType;
        })
      );

      // Filter out users without photos
      const validUsers = usersWithData.filter(user => user.photos.length > 0);
      
      setUsers(validUsers);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error in loadUsers:', error);
    } finally {
      setLoading(false);
    }
  }, [user, mode, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSwipe = async (direction: 'left' | 'right' | 'super', currentUser: UserType) => {
    if (!user || isAnimating || currentIndex >= users.length) return;

    setIsAnimating(true);

    // Map direction to action
    const action = direction === 'left' ? 'dislike' : direction === 'right' ? 'like' : 'super_like';

    try {
      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: currentUser.id,
          action: action
        });

      if (swipeError) {
        console.error('Error recording swipe:', swipeError);
        return;
      }

      // Check if the other user already liked this user (for match creation)
      if (action === 'like' || action === 'super_like') {
        const { data: existingSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', currentUser.id)
          .eq('swiped_id', user.id)
          .in('action', ['like', 'super_like'])
          .single();

        // Create match if both users liked each other
        if (existingSwipe) {
          const { error: matchError } = await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: currentUser.id,
              is_active: true
            });

          if (!matchError) {
            toast({
              title: "It's a Match! 💕",
              description: `You and ${currentUser.name} liked each other!`,
            });
          }
        }
      }

      // Move to next user
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 300);

    } catch (error) {
      console.error('Error handling swipe:', error);
      setIsAnimating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          You've seen everyone!
        </h3>
        <p className="text-gray-600 mb-4">
          Check back later for new profiles or expand your search filters.
        </p>
      </div>
    );
  }

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px]">
      {/* Next card (background) */}
      {nextUser && (
        <div className="absolute inset-0 transform scale-95">
          <EnhancedSwipeCard
            user={nextUser}
            onSwipe={() => {}}
            mode={mode}
          />
        </div>
      )}
      
      {/* Current card (foreground) */}
      <div className="absolute inset-0 z-10">
        <EnhancedSwipeCard
          user={currentUser}
          onSwipe={handleSwipe}
          mode={mode}
        />
      </div>
    </div>
  );
};

export default EnhancedSwipeStack;
