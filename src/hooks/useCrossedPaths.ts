
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User as UserType } from '@/types/User';

interface CrossedPath {
  id: string;
  user: UserType;
  crossingCount: number;
  lastCrossingTime: Date;
  firstCrossingTime: Date;
  averageDistance: number;
  locations: Array<{ lat: number; lng: number; time: string }>;
}

export const useCrossedPaths = () => {
  const { user } = useAuth();
  const [crossedPaths, setCrossedPaths] = useState<CrossedPath[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCrossedPaths = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: crossedPathsData, error } = await supabase
        .from('crossed_paths')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_crossing_time', { ascending: false });

      if (error) throw error;

      if (!crossedPathsData || crossedPathsData.length === 0) {
        setCrossedPaths([]);
        return;
      }

      // Get other user IDs
      const otherUserIds = crossedPathsData.map(cp => 
        cp.user1_id === user.id ? cp.user2_id : cp.user1_id
      );

      // Load profiles for other users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', otherUserIds);

      if (profilesError) throw profilesError;

      // Load photos and interests for each profile
      const crossedPathsWithUsers = await Promise.all(
        crossedPathsData.map(async (cp) => {
          const otherUserId = cp.user1_id === user.id ? cp.user2_id : cp.user1_id;
          const profile = profilesData?.find(p => p.user_id === otherUserId);

          if (!profile) return null;

          const [photosResult, interestsResult] = await Promise.all([
            supabase
              .from('photos')
              .select('url')
              .eq('user_id', otherUserId)
              .order('position'),
            supabase
              .from('interests')
              .select('interest')
              .eq('user_id', otherUserId)
          ]);

          const userProfile: UserType = {
            id: otherUserId,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
            photos: photosResult.data?.map(p => p.url) || [],
            interests: interestsResult.data?.map(i => i.interest) || [],
            location: profile.location || '',
            job: profile.job || '',
            education: profile.education || '',
            verified: profile.verified || false,
            lastActive: new Date(profile.last_active || profile.created_at),
            height: profile.height || '',
            zodiacSign: profile.zodiac_sign || '',
            relationshipType: (profile.relationship_type || 'serious') as 'casual' | 'serious' | 'friends' | 'unsure',
            children: (profile.children || 'unsure') as 'have' | 'want' | 'dont_want' | 'unsure',
            smoking: (profile.smoking || 'no') as 'yes' | 'no' | 'sometimes',
            drinking: (profile.drinking || 'sometimes') as 'yes' | 'no' | 'sometimes',
            exercise: (profile.exercise || 'sometimes') as 'often' | 'sometimes' | 'never',
            isOnline: false,
          };

          return {
            id: cp.id,
            user: userProfile,
            crossingCount: cp.crossing_count,
            lastCrossingTime: new Date(cp.last_crossing_time),
            firstCrossingTime: new Date(cp.first_crossing_time),
            averageDistance: cp.average_distance,
            locations: Array.isArray(cp.locations) ? cp.locations : []
          };
        })
      );

      const validCrossedPaths = crossedPathsWithUsers.filter(cp => cp !== null) as CrossedPath[];
      setCrossedPaths(validCrossedPaths);

    } catch (error) {
      console.error('Error loading crossed paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordLocation = async (latitude: number, longitude: number, accuracy?: number) => {
    if (!user) return;

    try {
      await supabase
        .from('location_history')
        .insert({
          user_id: user.id,
          latitude,
          longitude,
          accuracy,
          recorded_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording location:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadCrossedPaths();
    }
  }, [user]);

  return {
    crossedPaths,
    loading,
    loadCrossedPaths,
    recordLocation
  };
};
