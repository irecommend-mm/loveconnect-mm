
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User as UserType } from '@/types/User';

interface CompatibilityScore {
  userId: string;
  overallScore: number;
  preferenceScore: number;
  goalCompatibility: number;
  locationScore: number;
  interestsScore: number;
  zodiacScore: number;
  behaviorScore: number;
}

export const useAdvancedMatching = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState<UserType[]>([]);
  const [compatibilityScores, setCompatibilityScores] = useState<CompatibilityScore[]>([]);

  const calculateLocationScore = (userLat: number, userLng: number, targetLat: number, targetLng: number, maxDistance: number = 50) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (targetLat - userLat) * Math.PI / 180;
    const dLon = (targetLng - userLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return Math.max(0, 1 - (distance / maxDistance));
  };

  const calculateInterestsScore = (userInterests: string[], targetInterests: string[]) => {
    if (userInterests.length === 0 || targetInterests.length === 0) return 0;
    
    const commonInterests = userInterests.filter(interest => 
      targetInterests.includes(interest)
    );
    
    return commonInterests.length / Math.max(userInterests.length, targetInterests.length);
  };

  const calculateGoalCompatibility = (userGoal: string, targetGoal: string) => {
    if (userGoal === targetGoal) return 1.0;
    
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      'serious': { 'serious': 1.0, 'casual': 0.3, 'friends': 0.5, 'unsure': 0.6 },
      'casual': { 'serious': 0.3, 'casual': 1.0, 'friends': 0.7, 'unsure': 0.8 },
      'friends': { 'serious': 0.5, 'casual': 0.7, 'friends': 1.0, 'unsure': 0.8 },
      'unsure': { 'serious': 0.6, 'casual': 0.8, 'friends': 0.8, 'unsure': 1.0 }
    };
    
    return compatibilityMatrix[userGoal]?.[targetGoal] || 0.5;
  };

  const calculateBehaviorScore = async (userId: string, targetUserId: string) => {
    try {
      // Get user activity patterns
      const { data: userActivity } = await supabase
        .from('user_activity')
        .select('activity_type, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: targetActivity } = await supabase
        .from('user_activity')
        .select('activity_type, created_at')
        .eq('user_id', targetUserId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!userActivity || !targetActivity) return 0.5;

      // Calculate activity similarity (simplified)
      const userActivityTypes = userActivity.map(a => a.activity_type);
      const targetActivityTypes = targetActivity.map(a => a.activity_type);
      
      const commonActivities = userActivityTypes.filter(type => 
        targetActivityTypes.includes(type)
      );
      
      return commonActivities.length / Math.max(userActivityTypes.length, targetActivityTypes.length, 1);
    } catch (error) {
      console.error('Error calculating behavior score:', error);
      return 0.5;
    }
  };

  const calculateCompatibilityScore = async (currentUser: Record<string, unknown>, targetUser: Record<string, unknown>) => {
    if (!currentUser || !targetUser) return null;

    const locationScore = currentUser.latitude && currentUser.longitude && 
                         targetUser.latitude && targetUser.longitude
      ? calculateLocationScore(
          currentUser.latitude as number, currentUser.longitude as number,
          targetUser.latitude as number, targetUser.longitude as number
        )
      : 0.5;

    const interestsScore = calculateInterestsScore(
      (currentUser.interests as string[]) || [],
      (targetUser.interests as string[]) || []
    );

    const goalCompatibility = calculateGoalCompatibility(
      (currentUser.relationship_type as string) || 'unsure',
      (targetUser.relationship_type as string) || 'unsure'
    );

    let zodiacScore = 0.5;
    if (currentUser.zodiac_sign && targetUser.zodiac_sign) {
      const { data: zodiacResult } = await supabase
        .rpc('calculate_zodiac_compatibility', {
          sign1: (currentUser.zodiac_sign as string).toLowerCase(),
          sign2: (targetUser.zodiac_sign as string).toLowerCase()
        });
      zodiacScore = zodiacResult || 0.5;
    }

    const behaviorScore = await calculateBehaviorScore(currentUser.user_id as string, targetUser.user_id as string);

    // Calculate preference score based on age, height preferences, etc.
    const preferenceScore = 0.7; // Simplified for now

    const overallScore = (
      locationScore * 0.2 +
      interestsScore * 0.25 +
      goalCompatibility * 0.25 +
      zodiacScore * 0.1 +
      behaviorScore * 0.15 +
      preferenceScore * 0.05
    );

    return {
      userId: targetUser.user_id,
      overallScore,
      preferenceScore,
      goalCompatibility,
      locationScore,
      interestsScore,
      zodiacScore,
      behaviorScore
    };
  };

  const findAdvancedMatches = async () => {
    if (!user) return;

    setLoading(true);
    console.log('Starting advanced matching for user:', user.id);
    
    try {
      // Get current user profile
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get current user interests
      const { data: currentInterests } = await supabase
        .from('interests')
        .select('interest')
        .eq('user_id', user.id);

      const currentUserData = currentProfile ? {
        ...currentProfile,
        interests: currentInterests?.map(i => i.interest) || []
      } : null;

      // Get potential matches (excluding swiped users)
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

      const { data: profiles, error: profilesError } = await profilesQuery.limit(20);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found for advanced matching');
        setMatchedUsers([]);
        setLoading(false);
        return;
      }

      console.log('Found profiles for advanced matching:', profiles.length);

      // Load photos and interests for each profile and calculate compatibility
      const scoredProfiles = await Promise.all(
        profiles.map(async (profile) => {
          try {
            // Get target user interests and photos
            const [targetInterests, photos] = await Promise.all([
              supabase
                .from('interests')
                .select('interest')
                .eq('user_id', profile.user_id),
              supabase
                .from('photos')
                .select('url')
                .eq('user_id', profile.user_id)
                .order('position')
            ]);

            const targetUserData = {
              ...profile,
              interests: targetInterests.data?.map(i => i.interest) || []
            };

            // Calculate compatibility if current user profile exists
            let compatibility = null;
            if (currentUserData) {
              compatibility = await calculateCompatibilityScore(currentUserData, targetUserData);
            }
            
            return { 
              profile, 
              photos: photos.data || [], 
              interests: targetInterests.data?.map(i => i.interest) || [],
              compatibility 
            };
          } catch (error) {
            console.error('Error processing profile:', profile.user_id, error);
            return null;
          }
        })
      );

      // Filter out null results and profiles without photos
      const validProfiles = scoredProfiles
        .filter(item => item && item.photos.length > 0);

      // Sort by compatibility score if available, otherwise by creation date
      const sortedMatches = validProfiles
        .sort((a, b) => {
          if (a.compatibility && b.compatibility) {
            return b.compatibility.overallScore - a.compatibility.overallScore;
          }
          return new Date(b.profile.created_at).getTime() - new Date(a.profile.created_at).getTime();
        });

      // Convert to UserType format
      const matchedProfiles: UserType[] = sortedMatches.map(({ profile, photos, interests }) => ({
        id: profile.user_id,
        name: profile.name,
        age: profile.age,
        bio: profile.bio || '',
        photos: photos.map(p => p.url),
        interests: interests,
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
      }));

      console.log('Advanced matching completed, found matches:', matchedProfiles.length);
      
      setMatchedUsers(matchedProfiles);
      setCompatibilityScores(sortedMatches.map(item => item.compatibility).filter(Boolean));

    } catch (error) {
      console.error('Error in advanced matching, falling back to basic:', error);
      // Let the SwipeStack component handle the fallback
      setMatchedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const trackUserActivity = async (activityType: string, targetUserId?: string, metadata?: Record<string, unknown>) => {
    if (!user) return;

    try {
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          target_user_id: targetUserId,
          metadata: (metadata || {}) as any
        });
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  };

  const updateLocationHistory = async (latitude: number, longitude: number, accuracy?: number) => {
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
      console.error('Error updating location history:', error);
    }
  };

  return {
    matchedUsers,
    compatibilityScores,
    loading,
    findAdvancedMatches,
    trackUserActivity,
    updateLocationHistory
  };
};
