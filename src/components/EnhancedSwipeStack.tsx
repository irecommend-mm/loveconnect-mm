
import React, { useState, useEffect, useCallback } from 'react';
import { User as UserType } from '@/types/User';
import { AppMode, LocationData, UserFilters } from '@/types/FriendDateTypes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import EnhancedSwipeCard from './EnhancedSwipeCard';
import ProfileDetailCard from './ProfileDetailCard';
import { toast } from '@/hooks/use-toast';
import { X, Star, Users, Heart, RotateCcw } from 'lucide-react';

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
  const [swipeHistory, setSwipeHistory] = useState<Array<{ user: UserType; action: string }>>([]);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserType | null>(null);

  const loadUsers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // TEMPORARILY DISABLE SWIPE FILTERING FOR TESTING
      // Get users who haven't been swiped by current user
      const { data: swipedUsers } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedUsers?.map(s => s.swiped_id) || [];

      // Build query for profiles - Show all users except current user
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      // TEMPORARILY COMMENT OUT SWIPE FILTERING - Show all users for testing
      // if (swipedUserIds.length > 0) {
      //   query = query.not('user_id', 'in', `(${swipedUserIds.join(',')})`);
      // }

      // Remove complex relationship filtering for now - show all users
      // TODO: Add back relationship filtering once we have more users
      
      const { data: profilesData, error } = await query.limit(50);

      if (error) {
        console.error('Error loading profiles:', error);
        setUsers([]);
        setCurrentIndex(0);
        return;
      }

      console.log('Profiles loaded:', profilesData?.length || 0);
      console.log('Sample profile:', profilesData?.[0]);

      if (!profilesData || profilesData.length === 0) {
        console.log('No profiles found - this might mean no users in database');
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
    
    // Add to swipe history for undo functionality
    setSwipeHistory(prev => [...prev, { user: currentUser, action }]);

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

      // Add a small delay for the swipe animation to be visible
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 200);

    } catch (error) {
      console.error('Error handling swipe:', error);
      setIsAnimating(false);
    }
  };

  const handleShowProfile = (user: UserType) => {
    console.log('Show profile for:', user.name);
    // TODO: Implement profile modal
  };

  const handleShowDetails = (user: UserType) => {
    setSelectedUserForDetails(user);
    setShowProfileDetails(true);
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
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSwipeHistory([]);
              loadUsers();
            }}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Reset & Show All Users
          </button>
          {swipeHistory.length > 0 && (
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSwipeHistory([]);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

  return (
    <div className="relative w-full max-w-sm mx-auto pt-4">
      {/* Progress Counter */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          {currentIndex + 1} of {users.length} profiles
        </p>
      </div>

             {/* Card Stack */}
       <div className="relative w-full max-w-sm mx-auto h-[600px] mb-[400px]">
        {/* Next card (background) */}
        {nextUser && (
          <div className="absolute inset-0 transform scale-95">
                         <EnhancedSwipeCard
               user={nextUser}
               onSwipe={() => {}}
               onShowProfile={handleShowProfile}
               onShowDetails={() => handleShowDetails(nextUser)}
               mode={mode}
               showActions={false}
             />
          </div>
        )}
        
        {/* Current card (foreground) */}
        <div 
          className={`absolute inset-0 z-10 transition-all duration-300 ${
            isAnimating ? 'opacity-0 scale-95 transform translate-x-full' : 'opacity-100 scale-100 transform translate-x-0'
          }`}
        >
                     <EnhancedSwipeCard
             user={currentUser}
             onSwipe={handleSwipe}
             onShowProfile={handleShowProfile}
             onShowDetails={() => handleShowDetails(currentUser)}
             mode={mode}
             showActions={false}
           />
        </div>
      </div>

      {/* Floating Action Buttons - Fixed above footer navigation like Tinder */}
      <div className="fixed bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-28 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex justify-center items-center space-x-2 sm:space-x-3 bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-2xl">
          {/* Undo Button */}
          {swipeHistory.length > 0 && (
            <button
              onClick={() => {
                if (swipeHistory.length > 0) {
                  setSwipeHistory(prev => prev.slice(0, -1));
                  setCurrentIndex(prev => Math.max(0, prev - 1));
                  setIsAnimating(false);
                }
              }}
              disabled={swipeHistory.length === 0}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-400 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo last swipe"
            >
              <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>
          )}
          
          {/* Rewind to Start Button */}
          {swipeHistory.length > 0 && (
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSwipeHistory([]);
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
              title="Start over from beginning"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          
          {/* Dislike Button */}
          <button
            onClick={() => handleSwipe('left', currentUser)}
            disabled={isAnimating}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7 text-gray-600 group-hover:text-red-500 transition-colors" />
          </button>
          
          {/* Super Like Button */}
          <button
            onClick={() => handleSwipe('super', currentUser)}
            disabled={isAnimating}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'friend' 
                ? 'from-blue-400 to-blue-600' 
                : 'from-purple-400 to-purple-600'
            }`}
          >
            <Star className="h-6 w-6 sm:h-7 sm:w-7 text-white fill-current" />
          </button>
          
          {/* Like Button */}
          <button
            onClick={() => handleSwipe('right', currentUser)}
            disabled={isAnimating}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'friend' 
                ? 'from-blue-500 to-blue-600' 
                : 'from-pink-500 to-red-500'
            }`}
          >
                          {mode === 'friend' ? (
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              ) : (
                <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-white fill-current" />
              )}
          </button>
          
          
        </div>
      </div>

      {/* Profile Detail Card */}
      {showProfileDetails && selectedUserForDetails && (
        <ProfileDetailCard
          user={selectedUserForDetails}
          mode={mode}
          isVisible={showProfileDetails}
          onClose={() => setShowProfileDetails(false)}
        />
      )}

    </div>
  );
};

export default EnhancedSwipeStack;
