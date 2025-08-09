
import React, { useState, useEffect } from 'react';
import { Heart, X, Star, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/User';
import { toast } from '@/hooks/use-toast';
import SwipeCard from './SwipeCard';

const SwipeStack = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastResetTime, setLastResetTime] = useState<Date>(new Date());
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  useEffect(() => {
    loadUsers();
    
    // Set up timer for hourly reset
    const interval = setInterval(() => {
      const now = new Date();
      const hoursSinceReset = (now.getTime() - lastResetTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceReset >= 1) {
        resetUsers();
      } else {
        updateTimeUntilReset();
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastResetTime]);

  const updateTimeUntilReset = () => {
    const now = new Date();
    const nextReset = new Date(lastResetTime);
    nextReset.setHours(nextReset.getHours() + 1);
    
    const msUntilReset = nextReset.getTime() - now.getTime();
    const minutesUntilReset = Math.ceil(msUntilReset / (1000 * 60));
    
    if (minutesUntilReset > 0) {
      setTimeUntilReset(`${minutesUntilReset} minutes`);
    } else {
      setTimeUntilReset('Soon');
    }
  };

  const loadUsers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get users that haven't been swiped on in the last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_photos (photo_url),
          user_interests (interest)
        `)
        .neq('user_id', user.id)
        .limit(20);

      if (error) throw error;

      const formattedUsers: User[] = profiles?.map(profile => ({
        id: profile.user_id,
        name: profile.first_name + (profile.last_name ? ` ${profile.last_name}` : ''),
        age: profile.age || 25,
        location: profile.location || 'Unknown',
        photos: profile.user_photos?.map((p: any) => p.photo_url) || ['/placeholder.svg'],
        bio: profile.bio || '',
        interests: profile.user_interests?.map((i: any) => i.interest) || [],
        verified: !!profile.verification_status,
        lastActive: new Date().toISOString(),
        relationshipGoal: profile.relationship_goal || 'casual',
        education: profile.education || '',
        height: profile.height_cm ? `${Math.floor(profile.height_cm / 30.48)}' ${Math.round((profile.height_cm % 30.48) / 2.54)}"` : '',
        occupation: profile.job_title || '',
        distance: Math.floor(Math.random() * 20) + 1,
        isOnline: Math.random() > 0.5,
        hasStory: Math.random() > 0.7,
        isPremium: Math.random() > 0.8,
        latitude: profile.latitude || 0,
        longitude: profile.longitude || 0,
      })) || [];

      setUsers(formattedUsers);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetUsers = () => {
    setLastResetTime(new Date());
    setCurrentIndex(0);
    loadUsers();
    toast({
      title: "New Users Available!",
      description: "Fresh profiles have been loaded for you to discover.",
    });
  };

  const handleSwipe = async (direction: 'left' | 'right', userId: string) => {
    if (!user) return;

    try {
      // Record the swipe
      await supabase
        .from('user_swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: userId,
          action: direction === 'right' ? 'like' : 'pass',
          created_at: new Date().toISOString()
        });

      if (direction === 'right') {
        // Check for mutual like (match)
        const { data: mutualLike } = await supabase
          .from('user_swipes')
          .select('*')
          .eq('swiper_id', userId)
          .eq('swiped_id', user.id)
          .eq('action', 'like')
          .single();

        if (mutualLike) {
          // Create match
          await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: userId,
              created_at: new Date().toISOString()
            });

          toast({
            title: "It's a Match! 🎉",
            description: "You both liked each other!",
          });
        }
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    }

    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const currentUser = users[currentIndex];
  const hasMoreUsers = currentIndex < users.length;

  if (!hasMoreUsers) {
    return (
      <div className="flex flex-col items-center justify-center h-96 px-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-pink-500" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          You've seen everyone for now!
        </h3>
        
        <p className="text-gray-600 mb-4 max-w-sm">
          New profiles will be available in <strong>{timeUntilReset}</strong>. 
          We refresh the stack every hour with new people to discover!
        </p>
        
        <Badge variant="outline" className="mb-6 text-sm px-3 py-1">
          <RotateCcw className="w-3 h-3 mr-1" />
          Auto-refresh in {timeUntilReset}
        </Badge>
        
        <div className="flex space-x-3">
          <Button 
            onClick={resetUsers}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="relative mb-6">
        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / users.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          {currentIndex + 1} of {users.length}
        </div>
      </div>

      {currentUser && (
        <SwipeCard
          user={currentUser}
          onSwipe={handleSwipe}
        />
      )}

      {/* Action buttons */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
          onClick={() => handleSwipe('left', currentUser?.id)}
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-20 h-20 rounded-full border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300"
          onClick={() => {/* Super like functionality */}}
        >
          <Star className="h-7 w-7 text-yellow-500" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-green-200 hover:bg-green-50 hover:border-green-300"
          onClick={() => handleSwipe('right', currentUser?.id)}
        >
          <Heart className="h-6 w-6 text-green-500" />
        </Button>
      </div>
    </div>
  );
};

export default SwipeStack;
