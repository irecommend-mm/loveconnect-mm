
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

  const calculateCompatibilityScore = async (currentUser: any, targetUser: any) => {
    if (!currentUser || !targetUser) return null;

    const locationScore = currentUser.latitude && currentUser.longitude && 
                         targetUser.latitude && targetUser.longitude
      ? calculateLocationScore(
          currentUser.latitude, currentUser.longitude,
          targetUser.latitude, targetUser.longitude
        )
      : 0.5;

    const interestsScore = calculateInterestsScore(
      currentUser.interests || [],
      targetUser.interests || []
    );

    const goalCompatibility = calculateGoalCompatibility(
      currentUser.relationship_type || 'unsure',
      targetUser.relationship_type || 'unsure'
    );

    let zodiacScore = 0.5;
    if (currentUser.zodiac_sign && targetUser.zodiac_sign) {
      const { data: zodiacResult } = await supabase
        .rpc('calculate_zodiac_compatibility', {
          sign1: currentUser.zodiac_sign.toLowerCase(),
          sign2: targetUser.zodiac_sign.toLowerCase()
        });
      zodiacScore = zodiacResult || 0.5;
    }

    const behaviorScore = await calculateBehaviorScore(currentUser.user_id, targetUser.user_id);

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
    try {
      // Get current user profile
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile) return;

      // Get current user interests
      const { data: currentInterests } = await supabase
        .from('interests')
        .select('interest')
        .eq('user_id', user.id);

      const currentUserData = {
        ...currentProfile,
        interests: currentInterests?.map(i => i.interest) || []
      };

      // Get potential matches (excluding swiped users)
      const { data: swipedUsers } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedUsers?.map(s => s.swiped_id) || [];

      let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      if (swipedUserIds.length > 0) {
        profilesQuery = profilesQuery.not('user_id', 'in', `(${swipedUserIds.join(',')})`);
      }

      const { data: profiles } = await profilesQuery;

      if (!profiles) return;

      // Calculate compatibility scores for each profile
      const scoredProfiles = await Promise.all(
        profiles.map(async (profile) => {
          // Get target user interests
          const { data: targetInterests } = await supabase
            .from('interests')
            .select('interest')
            .eq('user_id', profile.user_id);

          const targetUserData = {
            ...profile,
            interests: targetInterests?.map(i => i.interest) || []
          };

          const compatibility = await calculateCompatibilityScore(currentUserData, targetUserData);
          
          if (compatibility) {
            // Store compatibility score in database
            await supabase
              .from('compatibility_scores')
              .upsert({
                user1_id: user.id,
                user2_id: profile.user_id,
                overall_score: compatibility.overallScore,
                preference_score: compatibility.preferenceScore,
                goal_compatibility: compatibility.goalCompatibility,
                location_score: compatibility.locationScore,
                interests_score: compatibility.interestsScore,
                zodiac_score: compatibility.zodiacScore,
                behavior_score: compatibility.behaviorScore,
                last_calculated: new Date().toISOString()
              });
          }

          return { profile, compatibility };
        })
      );

      // Sort by compatibility score and get top matches
      const sortedMatches = scoredProfiles
        .filter(item => item.compatibility)
        .sort((a, b) => (b.compatibility?.overallScore || 0) - (a.compatibility?.overallScore || 0))
        .slice(0, 20);

      // Load photos for matched profiles
      const matchedProfiles = await Promise.all(
        sortedMatches.map(async ({ profile }) => {
          const { data: photos } = await supabase
            .from('photos')
            .select('url')
            .eq('user_id', profile.user_id)
            .order('position');

          const { data: interests } = await supabase
            .from('interests')
            .select('interest')
            .eq('user_id', profile.user_id);

          return {
            id: profile.user_id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
            photos: photos?.map(p => p.url) || [],
            interests: interests?.map(i => i.interest) || [],
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
        })
      );

      setMatchedUsers(matchedProfiles);
      setCompatibilityScores(sortedMatches.map(item => item.compatibility!));

    } catch (error) {
      console.error('Error finding advanced matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackUserActivity = async (activityType: string, targetUserId?: string, metadata?: any) => {
    if (!user) return;

    try {
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          target_user_id: targetUserId,
          metadata: metadata || {}
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
