
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types/User';

export const useUserProfile = (user: User | null) => {
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserType | null>(null);

  const checkUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        setHasProfile(true);
        setCurrentProfile(profile);
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserProfile = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        const { data: photosData } = await supabase
          .from('photos')
          .select('url')
          .eq('user_id', userId)
          .order('position');

        const userProfile: UserType = {
          id: profileData.user_id,
          name: profileData.name,
          age: profileData.age,
          bio: profileData.bio || '',
          photos: photosData?.map(p => p.url) || [],
          interests: profileData.lifestyle?.interests || [],
          location: profileData.location || '',
          job: profileData.job_title || '',
          education: profileData.education || '',
          verified: profileData.verified || false,
          lastActive: new Date(profileData.last_active || profileData.created_at),
          height: `${Math.floor(profileData.height_cm / 30.48)}'${Math.round(((profileData.height_cm / 30.48) % 1) * 12)}"` || '',
          zodiacSign: profileData.zodiac_sign || '',
          relationshipType: (profileData.relationship_type === 'friendship' ? 'friends' : profileData.relationship_type || 'serious') as 'casual' | 'serious' | 'friends' | 'unsure',
          children: (profileData.children || 'unsure') as 'have' | 'want' | 'dont_want' | 'unsure',
          smoking: (profileData.smoking || 'no') as 'yes' | 'no' | 'sometimes',
          drinking: (profileData.drinking || 'sometimes') as 'yes' | 'no' | 'sometimes',
          exercise: (profileData.exercise || 'sometimes') as 'often' | 'sometimes' | 'never',
          isOnline: false,
        };

        setCurrentUserProfile(userProfile);
      }
    } catch (error) {
      console.error('Error loading current user profile:', error);
    }
  };

  useEffect(() => {
    if (user) {
      checkUserProfile(user.id);
      loadCurrentUserProfile(user.id);
    }
  }, [user]);

  return {
    hasProfile,
    loading,
    currentProfile,
    currentUserProfile,
    setHasProfile,
    checkUserProfile,
    loadCurrentUserProfile,
  };
};
