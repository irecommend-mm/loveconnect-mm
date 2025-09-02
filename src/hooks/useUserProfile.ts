
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types/User';

export const useUserProfile = (user: User | null) => {
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<Record<string, unknown> | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserType | null>(null);

  // If no user, set loading to false immediately
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setHasProfile(false);
    }
  }, [user]);

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

        // Helper function to safely extract interests from lifestyle JSON
        const getInterestsFromLifestyle = (lifestyle: unknown): string[] => {
          if (lifestyle && typeof lifestyle === 'object' && lifestyle.interests) {
            return Array.isArray(lifestyle.interests) ? lifestyle.interests : [];
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

        const userProfile: UserType = {
          id: profileData.user_id,
          name: profileData.name,
          age: profileData.age,
          bio: profileData.bio || '',
          photos: photosData?.map(p => p.url) || [],
          interests: getInterestsFromLifestyle(profileData.lifestyle),
          location: profileData.location || '',
          job: profileData.job_title || '',
          education: profileData.education || '',
          verified: profileData.verified || false,
          lastActive: new Date(profileData.last_active || profileData.created_at),
          height: profileData.height_cm ? `${Math.floor(profileData.height_cm / 30.48)}'${Math.round(((profileData.height_cm / 30.48) % 1) * 12)}"` : '',
          zodiacSign: profileData.zodiac_sign || '',
          relationshipType: (profileData.relationship_type === 'friendship' ? 'friends' : profileData.relationship_type || 'serious') as 'casual' | 'serious' | 'friends' | 'unsure',
          children: (profileData.children || 'unsure') as 'have' | 'want' | 'dont_want' | 'unsure',
          smoking: mapSmoking(profileData.smoking) as 'yes' | 'no' | 'sometimes',
          drinking: mapDrinking(profileData.drinking) as 'yes' | 'no' | 'sometimes',
          exercise: mapExercise(profileData.exercise) as 'often' | 'sometimes' | 'never',
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
