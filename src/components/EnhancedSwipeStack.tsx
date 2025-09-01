
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { AppMode } from '@/types/FriendDateTypes';
import { User as UserType } from '@/types/User';
import EnhancedSwipeCard from './EnhancedSwipeCard';
import ModernProfileModal from './ModernProfileModal';
import MatchCelebrationModal from './MatchCelebrationModal';
import LocalEvents from './LocalEvents';

interface EnhancedSwipeStackProps {
  mode: AppMode;
}

const EnhancedSwipeStack = ({ mode }: EnhancedSwipeStackProps) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserType | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadProfiles();
      loadCurrentUserPhoto();
    }
  }, [user, mode]);

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

  const loadProfiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get users that haven't been swiped on
      const { data: swipedUsers } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedUsers?.map(s => s.swiped_id) || [];

      let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .eq('incognito', false);

      if (swipedUserIds.length > 0) {
        profilesQuery = profilesQuery.not('user_id', 'in', `(${swipedUserIds.join(',')})`);
      }

      const { data: profilesData, error } = await profilesQuery.limit(20);

      if (error) {
        console.error('Error loading profiles:', error);
        setLoading(false);
        return;
      }

      if (!profilesData || profilesData.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Load additional data for each profile
      const profilesWithData = await Promise.all(
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

          return {
            id: profile.user_id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
            photos: photosResult.data?.map(p => p.url) || [],
            interests: interestsResult.data?.map(i => i.interest) || [],
            location: profile.location || '',
            job: profile.job_title || '',
            education: profile.education || '',
            height: profile.height || '',
            zodiacSign: profile.zodiac_sign || '',
            relationshipType: profile.relationship_type || 'serious',
            children: profile.children || 'unsure',
            smoking: profile.smoking || 'no',
            drinking: profile.drinking || 'sometimes',
            exercise: profile.exercise || 'sometimes',
            verified: profile.verified || false,
            lastActive: new Date(profile.last_active || profile.created_at),
          } as UserType;
        })
      );

      const profilesWithPhotos = profilesWithData.filter(p => p.photos.length > 0);
      setProfiles(profilesWithPhotos);
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles([]);
      setLoading(false);
    }
  };

  const handleAction = async (action: 'like' | 'dislike' | 'super', targetUser: UserType) => {
    if (!user) return;

    try {
      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: targetUser.id,
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

      // Check for match if this was a like or super like
      if (action === 'like' || action === 'super') {
        const { data: matchData } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', targetUser.id)
          .eq('swiped_id', user.id)
          .in('action', ['like', 'super'])
          .maybeSingle();

        if (matchData) {
          // Create match
          await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: targetUser.id
            });

          setMatchedUser(targetUser);
          setShowMatchModal(true);
        } else {
          const actionText = action === 'super' ? 'Super liked' : 'Liked';
          const modeText = mode === 'friend' ? 'friend request' : 'like';
          toast({
            title: `${actionText}! 💫`,
            description: `You sent a ${modeText} to ${targetUser.name}!`,
          });
        }
      }

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

  const convertToUserType = (profile: UserType): UserType => profile;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">
            Finding amazing {mode === 'friend' ? 'friends' : 'dates'} for you...
          </p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <div className="text-center mb-8">
          <Users className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            You've seen everyone nearby!
          </h3>
          <p className="text-gray-500 mb-6">
            Check back later for new {mode === 'friend' ? 'friends' : 'matches'} or explore events
          </p>
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={loadProfiles} 
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 text-lg rounded-full shadow-xl hover:scale-105 transition-all duration-200"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          
          <Button 
            onClick={() => setShowEventsModal(true)}
            variant="outline"
            className="px-6 py-3 text-lg rounded-full border-2 hover:scale-105 transition-all duration-200"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Find Events
          </Button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-safe pb-safe">
      <div className="container mx-auto px-4 py-8">
        <EnhancedSwipeCard
          user={currentProfile}
          mode={mode}
          onSwipe={handleAction}
          onShowProfile={() => setShowProfileModal(true)}
        />

        {/* Modals */}
        {showProfileModal && (
          <ModernProfileModal
            user={convertToUserType(currentProfile)}
            onClose={() => setShowProfileModal(false)}
            onLike={() => {
              setShowProfileModal(false);
              handleAction('like', currentProfile);
            }}
            onPass={() => {
              setShowProfileModal(false);
              handleAction('dislike', currentProfile);
            }}
            onSuperLike={() => {
              setShowProfileModal(false);
              handleAction('super', currentProfile);
            }}
          />
        )}

        {showMatchModal && matchedUser && (
          <MatchCelebrationModal
            isOpen={showMatchModal}
            matchedUser={convertToUserType(matchedUser)}
            currentUserPhoto={currentUserPhoto}
            onChatNow={() => {
              setShowMatchModal(false);
              toast({
                title: "Opening chat...",
                description: `Starting conversation with ${matchedUser.name}`,
              });
            }}
            onContinueBrowsing={() => {
              setShowMatchModal(false);
              setMatchedUser(null);
            }}
            onClose={() => setShowMatchModal(false)}
          />
        )}

        {showEventsModal && (
          <LocalEvents onClose={() => setShowEventsModal(false)} />
        )}
      </div>
    </div>
  );
};

export default EnhancedSwipeStack;
