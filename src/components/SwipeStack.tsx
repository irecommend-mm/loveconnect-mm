
import React, { useState, useEffect } from 'react';
import { User } from '@/types/User';
import SwipeCard from './SwipeCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Heart, RotateCcw } from 'lucide-react';

const SwipeStack = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastResetTime, setLastResetTime] = useState<Date | null>(null);

  // Load last reset time from localStorage
  useEffect(() => {
    const savedResetTime = localStorage.getItem('swipe_stack_reset_time');
    if (savedResetTime) {
      setLastResetTime(new Date(savedResetTime));
    }
  }, []);

  // Check if 1 hour has passed since last reset
  const shouldResetStack = () => {
    if (!lastResetTime) return false;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return lastResetTime <= oneHourAgo;
  };

  // Auto-reset every hour
  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldResetStack() && currentIndex >= users.length) {
        resetSwipeStack();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastResetTime, currentIndex, users.length]);

  const resetSwipeStack = async () => {
    setLoading(true);
    setCurrentIndex(0);
    const now = new Date();
    setLastResetTime(now);
    localStorage.setItem('swipe_stack_reset_time', now.toISOString());
    await fetchUsers();
    toast({
      title: "New People Available!",
      description: "Fresh profiles are ready for you to discover.",
    });
  };

  const fetchUsers = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get users that haven't been swiped on recently (within the hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: recentSwipes } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id)
        .gte('created_at', oneHourAgo);

      const recentSwipedIds = recentSwipes?.map(s => s.swiped_id) || [];

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_photos (photo_url, photo_order),
          user_interests (
            interests (name)
          )
        `)
        .neq('user_id', user.id)
        .not('user_id', 'in', `(${recentSwipedIds.join(',') || 'null'})`)
        .limit(20);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      const transformedUsers: User[] = (profiles || []).map(profile => ({
        id: profile.user_id,
        name: profile.name || 'Anonymous',
        age: profile.age || 18,
        location: profile.location || 'Unknown',
        photos: Array.isArray(profile.user_photos) 
          ? profile.user_photos
              .sort((a, b) => a.photo_order - b.photo_order)
              .map(p => p.photo_url)
          : ['/placeholder.svg'],
        interests: Array.isArray(profile.user_interests)
          ? profile.user_interests.map(ui => ui.interests?.name).filter(Boolean)
          : [],
        bio: profile.bio || '',
        verified: profile.verified || false,
        lastActive: new Date(profile.last_active || profile.created_at),
        relationshipType: profile.relationship_type || 'casual',
        job: profile.job_title || '',
        education: profile.education || '',
        height: profile.height || '',
        distance: 5,
        latitude: profile.latitude || 0,
        longitude: profile.longitude || 0
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const handleSwipe = async (direction: 'left' | 'right' | 'super', currentUser: User) => {
    if (!user) return;

    const action = direction === 'left' ? 'dislike' : direction === 'right' ? 'like' : 'super_like';

    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: currentUser.id,
          action: action
        });

      if (error) throw error;

      setCurrentIndex(prev => prev + 1);

      if (action === 'like') {
        toast({
          title: "Profile Liked! ❤️",
          description: `You liked ${currentUser.name}. If they like you back, it's a match!`,
        });
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
      toast({
        title: "Error",
        description: "Failed to record your swipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShowProfile = (user: User) => {
    console.log('Show profile for:', user.name);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Auto-reset when no more users and 1 hour has passed
  if (currentIndex >= users.length) {
    if (shouldResetStack()) {
      resetSwipeStack();
      return (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
        </div>
      );
    }

    const timeUntilReset = lastResetTime 
      ? Math.max(0, 60 - Math.floor((Date.now() - lastResetTime.getTime()) / 60000))
      : 60;

    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-full p-6 mb-6">
          <Heart className="h-16 w-16 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">You've seen everyone!</h2>
        <p className="text-gray-600 mb-6 max-w-sm">
          New profiles will automatically appear in about {timeUntilReset} minutes.
        </p>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <RotateCcw className="h-4 w-4" />
          <span>Auto-refreshing every hour</span>
        </div>
        {shouldResetStack() && (
          <button
            onClick={resetSwipeStack}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-medium hover:shadow-lg transition-shadow"
          >
            Refresh Now
          </button>
        )}
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="relative h-[70vh] flex items-center justify-center">
      <SwipeCard
        user={currentUser}
        onSwipe={handleSwipe}
        onShowProfile={handleShowProfile}
      />
    </div>
  );
};

export default SwipeStack;
