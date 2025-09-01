
import React, { useState, useEffect } from 'react';
import { Heart, X, Star, Users, MessageCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types/User';
import { AppMode } from '@/types/FriendDateTypes';
import CompatibilityScore from './CompatibilityScore';
import PhotoGallery from './PhotoGallery';

interface EnhancedSwipeStackProps {
  mode: AppMode;
  filters?: any;
}

const EnhancedSwipeStack = ({ mode, filters }: EnhancedSwipeStackProps) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);

  // Mock compatibility data
  const mockCompatibility = {
    friendshipScore: Math.floor(Math.random() * 40) + 60,
    romanceScore: Math.floor(Math.random() * 40) + 60,
    overallCompatibility: Math.floor(Math.random() * 40) + 60,
    factors: {
      commonInterests: Math.floor(Math.random() * 100),
      lifestyleAlignment: Math.floor(Math.random() * 100),
      communicationStyle: Math.floor(Math.random() * 100),
      values: Math.floor(Math.random() * 100),
      zodiacCompatibility: Math.floor(Math.random() * 100),
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build query with filters
      let query = supabase
        .from('profiles')
        .select(`
          *,
          photos:photos(url),
          interests:interests(interest)
        `)
        .neq('user_id', user.id)
        .limit(20);

      // Apply age filter
      if (filters?.ageRange) {
        query = query.gte('age', filters.ageRange[0]).lte('age', filters.ageRange[1]);
      }

      // Apply other filters
      if (filters?.relationshipType) {
        query = query.eq('relationship_type', filters.relationshipType);
      }

      if (filters?.verified) {
        query = query.eq('verified', true);
      }

      const { data: profilesData, error } = await query;
      
      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      if (!profilesData || profilesData.length === 0) {
        console.log('No profiles found');
        setUsers([]);
        return;
      }

      // Transform the data
      const transformedUsers = profilesData.map(profile => ({
        id: profile.user_id,
        name: profile.name,
        age: profile.age,
        bio: profile.bio || '',
        photos: profile.photos?.map((p: any) => p.url) || [],
        interests: profile.interests?.map((i: any) => i.interest) || [],
        location: profile.location || '',
        job: profile.job_title || '',
        education: profile.education || '',
        verified: profile.verified || false,
        lastActive: new Date(profile.last_active || profile.created_at),
        height: profile.height || '',
        zodiacSign: profile.zodiac_sign || '',
        relationshipType: profile.relationship_type as 'casual' | 'serious' | 'friends' | 'unsure',
        children: profile.children as 'have' | 'want' | 'dont_want' | 'unsure',
        smoking: profile.smoking as 'yes' | 'no' | 'sometimes',
        drinking: profile.drinking as 'yes' | 'no' | 'sometimes',
        exercise: profile.exercise as 'often' | 'sometimes' | 'never',
        isOnline: Math.random() > 0.5,
        distance: Math.floor(Math.random() * 50) + 1,
      }));

      setUsers(transformedUsers);
      setCurrentIndex(0);
      
    } catch (error) {
      console.error('Error in loadUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const handleSwipe = async (direction: 'like' | 'dislike' | 'super_like') => {
    if (!currentUser || currentIndex >= users.length) return;

    setSwipeDirection(direction);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Record the swipe
      await supabase.from('swipes').insert({
        swiper_id: user.id,
        swiped_id: users[currentIndex].id,
        action: direction
      });

      // Move to next user after animation
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwipeDirection(null);
      }, 300);

    } catch (error) {
      console.error('Error recording swipe:', error);
      // Still move to next user even if recording fails
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwipeDirection(null);
      }, 300);
    }
  };

  // Reset to beginning when all users are viewed (for testing)
  const resetStack = () => {
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          mode === 'friend' ? 'bg-blue-100' : 'bg-pink-100'
        }`}>
          {mode === 'friend' ? (
            <Users className={`h-8 w-8 ${mode === 'friend' ? 'text-blue-500' : 'text-pink-500'}`} />
          ) : (
            <Heart className={`h-8 w-8 ${mode === 'friend' ? 'text-blue-500' : 'text-pink-500'}`} />
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2">No profiles found</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your filters or check back later for new profiles
        </p>
        <Button 
          onClick={loadUsers}
          className={mode === 'friend' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-pink-500 hover:bg-pink-600'}
        >
          Refresh
        </Button>
      </div>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          mode === 'friend' ? 'bg-blue-100' : 'bg-pink-100'
        }`}>
          <Star className={`h-8 w-8 ${mode === 'friend' ? 'text-blue-500' : 'text-pink-500'}`} />
        </div>
        <h3 className="text-xl font-semibold mb-2">You've seen everyone nearby!</h3>
        <p className="text-gray-600 mb-4">
          Check back later for new matches or explore events
        </p>
        <Button 
          onClick={resetStack}
          className={mode === 'friend' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-pink-500 hover:bg-pink-600'}
        >
          Start Over
        </Button>
      </div>
    );
  }

  const user = users[currentIndex];

  return (
    <div className="max-w-sm mx-auto pt-4">
      {/* Compatibility Score */}
      <div className="mb-4">
        <CompatibilityScore 
          score={mockCompatibility} 
          mode={mode}
          userName={user.name}
        />
      </div>

      {/* Main Card */}
      <Card className={`relative overflow-hidden transition-all duration-300 ${
        swipeDirection === 'like' ? 'transform rotate-12 translate-x-full opacity-50' :
        swipeDirection === 'dislike' ? 'transform -rotate-12 -translate-x-full opacity-50' :
        swipeDirection === 'super_like' ? 'transform -translate-y-full opacity-50' : ''
      }`}>
        <CardContent className="p-0">
          <div className="relative">
            <PhotoGallery photos={user.photos} userName={user.name} />
            
            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <span className="text-lg">{user.age}</span>
                {user.verified && (
                  <Badge className="bg-blue-500">
                    ✓
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm mb-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.distance}km away</span>
                </div>
                {user.isOnline && (
                  <Badge className="bg-green-500 text-xs">
                    Online
                  </Badge>
                )}
              </div>

              {user.job && (
                <p className="text-sm text-gray-200 mb-2">{user.job}</p>
              )}

              {user.bio && (
                <p className="text-sm text-gray-200 mb-3 line-clamp-2">{user.bio}</p>
              )}

              {user.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {user.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-white/20 text-white">
                      {interest}
                    </Badge>
                  ))}
                  {user.interests.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                      +{user.interests.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <Button
          onClick={() => handleSwipe('dislike')}
          size="lg"
          variant="outline"
          className="rounded-full w-14 h-14 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50"
        >
          <X className="h-6 w-6 text-gray-600 hover:text-red-500" />
        </Button>

        <Button
          onClick={() => handleSwipe('super_like')}
          size="lg"
          className="rounded-full w-14 h-14 bg-blue-500 hover:bg-blue-600"
        >
          <Star className="h-6 w-6 text-white" />
        </Button>

        <Button
          onClick={() => handleSwipe('like')}
          size="lg"
          className={`rounded-full w-14 h-14 ${
            mode === 'friend' 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-pink-500 hover:bg-pink-600'
          }`}
        >
          {mode === 'friend' ? (
            <Users className="h-6 w-6 text-white" />
          ) : (
            <Heart className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>

      {/* Mode Indicator */}
      <div className="flex justify-center mt-4">
        <Badge className={`${
          mode === 'friend' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-pink-100 text-pink-800'
        }`}>
          {mode === 'friend' ? '👥 Friend Mode' : '💕 Date Mode'}
        </Badge>
      </div>
    </div>
  );
};

export default EnhancedSwipeStack;
