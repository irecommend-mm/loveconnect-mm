
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Match, User as UserType } from '@/types/User';

export const useMatches = (user: User | null) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMatches = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Loading matches for user:', userId);
      
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true);

      if (matchesError) {
        console.error('Error loading matches:', matchesError);
        return;
      }

      console.log('Raw matches data:', matchesData);

      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        setUsers([]);
        return;
      }

      const otherUserIds = matchesData.map(match => 
        match.user1_id === userId ? match.user2_id : match.user1_id
      );

      console.log('Other user IDs:', otherUserIds);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', otherUserIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        // Don't return here, set empty arrays to prevent infinite loops
        setMatches([]);
        setUsers([]);
        return;
      }

      const usersWithPhotos = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: photosData } = await supabase
            .from('photos')
            .select('url')
            .eq('user_id', profile.user_id)
            .order('position');

          const { data: interestsData } = await supabase
            .from('interests')
            .select('interest')
            .eq('user_id', profile.user_id);

          return {
            id: profile.user_id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
            photos: photosData?.map(p => p.url) || [],
            interests: interestsData?.map(i => i.interest) || [],
            location: profile.location || '',
            job: profile.job || '',
            education: profile.education || '',
            verified: profile.verified || false,
            lastActive: new Date(profile.last_active || profile.created_at),
            height: profile.height || '',
            zodiacSign: profile.zodiac_sign || '',
            relationshipType: (profile.relationship_type === 'friendship' ? 'friends' : profile.relationship_type || 'serious') as 'casual' | 'serious' | 'friends' | 'unsure',
            children: (profile.children || 'unsure') as 'have' | 'want' | 'dont_want' | 'unsure',
            smoking: (profile.smoking || 'no') as 'yes' | 'no' | 'sometimes',
            drinking: (profile.drinking || 'sometimes') as 'yes' | 'no' | 'sometimes',
            exercise: (profile.exercise || 'sometimes') as 'often' | 'sometimes' | 'never',
            isOnline: false,
          };
        })
      );

      const transformedMatches = matchesData.map(match => ({
        id: match.id,
        users: [match.user1_id, match.user2_id] as [string, string],
        timestamp: new Date(match.created_at),
        lastMessage: undefined,
        isActive: match.is_active
      }));

      console.log('Transformed matches:', transformedMatches);
      
      setMatches(transformedMatches);
      setUsers(usersWithPhotos);
    } catch (error) {
      console.error('Error in loadMatches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMatches(user.id);
    }
  }, [user]);

  return {
    matches,
    users,
    loading,
    loadMatches,
  };
};
