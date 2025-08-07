import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, RefreshCw, X, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useAdvancedMatching } from '@/hooks/useAdvancedMatching';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useGamification } from '@/hooks/useGamification';
import ModernProfileModal from './ModernProfileModal';
import MatchCelebrationModal from './MatchCelebrationModal';
import SuperLikeModal from './SuperLikeModal';
import ActionButtons from './ActionButtons';

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
  const {
    matchedUsers,
    findAdvancedMatches,
    trackUserActivity,
    updateLocationHistory
  } = useAdvancedMatching();
  const {
    notifyOnLike,
    notifyOnSuperLike,
    notifyOnMatch,
    notifyOnProfileView
  } = usePushNotifications();
  const { addEngagementPoints, updateDailyStreak } = useGamification();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showSuperLikeModal, setShowSuperLikeModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string>('');
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [lastSwipedProfile, setLastSwipedProfile] = useState<Profile | null>(null);
  const [lastSwipeAction, setLastSwipeAction] = useState<'like' | 'dislike' | 'super_like' | null>(null);
  const [rewindCount, setRewindCount] = useState(0);
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false);

  useEffect(() => {
    if (user) {
      // Use advanced matching instead of basic profile loading
      findAdvancedMatches();
      loadCurrentUserPhoto();
      updateDailyStreak(); // Update daily streak on app usage
      
      // Record location if available
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            updateLocationHistory(
              position.coords.latitude,
              position.coords.longitude,
              position.coords.accuracy
            );
          },
          (error) => console.log('Geolocation error:', error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
        );
      }
    }
  }, [user]);

  const loadCurrentUserPhoto = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('photos')
        .select('url')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();
      
      if (data) {
        setCurrentUserPhoto(data.url);
      }
    } catch (error) {
      console.log('No primary photo found for current user');
    }
  };

  const loadProfiles = async (forceRefresh = false) => {
    if (!user) return;

    setLoading(true);

    try {
      // Use advanced matching algorithm
      await findAdvancedMatches();
      
      // Set profiles from advanced matching results
      setProfiles(matchedUsers.map(user => ({
        id: user.id,
        user_id: user.id,
        name: user.name,
        age: user.age,
        bio: user.bio,
        location: user.location,
        job: user.job || '',
        education: user.education || '',
        photos: user.photos,
        interests: user.interests,
        verified: user.verified || false,
      })));
      
      if (forceRefresh) {
        setCurrentIndex(0);
        toast({
          title: "Profiles refreshed! 🔄",
          description: `Showing ${matchedUsers.length} optimized matches`,
        });
      }
      
    } catch (error) {
      console.error('Error in loadProfiles:', error);
      toast({
        title: "Error loading profiles",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
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

    // Store for undo functionality
    setLastSwipedProfile(currentProfile);
    setLastSwipeAction(action);
    setHasSwipedOnce(true);

    try {
      // Track user activity
      await trackUserActivity(
        action === 'like' ? 'swipe_right' : action === 'dislike' ? 'swipe_left' : 'super_like',
        currentProfile.user_id,
        { profile_name: currentProfile.name }
      );

      // Add gamification points
      const points = action === 'super_like' ? 10 : action === 'like' ? 5 : 2;
      await addEngagementPoints(points, action);

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

      // Send notifications based on action
      if (action === 'like') {
        await notifyOnLike(currentProfile.user_id, user.user_metadata?.name || 'Someone');
      } else if (action === 'super_like') {
        await notifyOnSuperLike(currentProfile.user_id, user.user_metadata?.name || 'Someone');
      }

      // Check for matches only if it's a like or super_like
      if (action === 'like' || action === 'super_like') {
        const { data: matchData } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', currentProfile.user_id)
          .eq('swiped_id', user.id)
          .eq('action', 'like')
          .maybeSingle();

        if (matchData) {
          // Create match record
          await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: currentProfile.user_id
            });

          // Send match notification
          await notifyOnMatch(currentProfile.user_id, user.user_metadata?.name || 'Someone');

          // Extra points for matches
          await addEngagementPoints(50, 'match');

          // Show animated match modal
          setMatchedUser(currentProfile);
          setShowMatchModal(true);
        } else {
          const actionText = action === 'super_like' ? 'Super liked' : 'Liked';
          toast({
            title: `${actionText}! 💕`,
            description: `You ${actionText.toLowerCase()} ${currentProfile.name}'s profile.`,
          });
        }
      }

      // Move to next profile
      setCurrentIndex(currentIndex + 1);

      // Load more profiles if running low
      if (currentIndex >= profiles.length - 2) {
        setTimeout(() => {
          findAdvancedMatches();
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

  const handleUndo = async () => {
    if (!lastSwipedProfile || !lastSwipeAction || !user) {
      toast({
        title: "Nothing to undo",
        description: "No recent swipe to undo.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Remove the last swipe from database
      await supabase
        .from('swipes')
        .delete()
        .eq('swiper_id', user.id)
        .eq('swiped_id', lastSwipedProfile.user_id);

      // If it was a match, remove the match too
      if (lastSwipeAction === 'like' || lastSwipeAction === 'super_like') {
        await supabase
          .from('matches')
          .delete()
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .or(`user1_id.eq.${lastSwipedProfile.user_id},user2_id.eq.${lastSwipedProfile.user_id}`);
      }

      // Move back to previous profile
      setCurrentIndex(Math.max(0, currentIndex - 1));
      setRewindCount(prev => prev + 1);
      
      toast({
        title: "Swipe undone! ↶",
        description: `Undoing your ${lastSwipeAction} on ${lastSwipedProfile.name}`,
      });

      // Clear undo state
      setLastSwipedProfile(null);
      setLastSwipeAction(null);

    } catch (error) {
      console.error('Error undoing swipe:', error);
      toast({
        title: "Error",
        description: "Unable to undo swipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuperLike = () => {
    if (currentIndex >= profiles.length) return;
    setShowSuperLikeModal(true);
  };

  const handleConfirmSuperLike = () => {
    setShowSuperLikeModal(false);
    handleAction('super_like');
  };

  const handleRefresh = () => {
    loadProfiles(true); // Force refresh - show all profiles again
  };

  const handleProfileView = async () => {
    if (!user || currentIndex >= profiles.length) return;
    
    const currentProfile = profiles[currentIndex];
    
    // Track profile view activity
    await trackUserActivity('profile_view', currentProfile.user_id, {
      profile_name: currentProfile.name
    });
    
    // Send notification to viewed user
    await notifyOnProfileView(currentProfile.user_id, user.user_metadata?.name || 'Someone');
    
    // Add engagement points
    await addEngagementPoints(3, 'profile_view');
    
    setShowProfileModal(true);
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

  const handleChatNow = () => {
    setShowMatchModal(false);
    toast({
      title: "Opening chat...",
      description: `Starting conversation with ${matchedUser?.name}`,
    });
  };

  const handleContinueBrowsing = () => {
    setShowMatchModal(false);
    setMatchedUser(null);
  };

  useEffect(() => {
    if (matchedUsers.length > 0) {
      setProfiles(matchedUsers.map(user => ({
        id: user.id,
        user_id: user.id,
        name: user.name,
        age: user.age,
        bio: user.bio,
        location: user.location,
        job: user.job || '',
        education: user.education || '',
        photos: user.photos,
        interests: user.interests,
        verified: user.verified || false,
      })));
    }
  }, [matchedUsers]);

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
          onClick={handleRefresh} 
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 text-lg rounded-full shadow-xl hover:scale-105 transition-all duration-200"
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
        {/* Card Design */}
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

              {/* Info Button - Updated to handle profile views */}
              <button
                onClick={handleProfileView}
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

          {/* Action Buttons with integrated Rewind */}
          <ActionButtons
            onDislike={() => handleAction('dislike')}
            onSuperLike={handleSuperLike}
            onLike={() => handleAction('like')}
            onRewind={handleUndo}
            rewindCount={rewindCount}
            maxRewinds={3}
            isPremium={false}
            disabled={!hasSwipedOnce || !lastSwipedProfile}
          />
        </div>

        {/* Modals */}
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

        {showMatchModal && matchedUser && (
          <MatchCelebrationModal
            isOpen={showMatchModal}
            matchedUser={convertToUserType(matchedUser)}
            currentUserPhoto={currentUserPhoto}
            onChatNow={handleChatNow}
            onContinueBrowsing={handleContinueBrowsing}
            onClose={() => setShowMatchModal(false)}
          />
        )}

        <SuperLikeModal
          isOpen={showSuperLikeModal}
          onClose={() => setShowSuperLikeModal(false)}
          onConfirm={handleConfirmSuperLike}
          userName={currentProfile?.name || ''}
        />
      </div>
    </div>
  );
};

export default SwipeStack;
