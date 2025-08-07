
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface GamificationData {
  activityLevel: 'very_active' | 'active' | 'moderate' | 'low' | 'inactive';
  totalScore: number;
  dailyStreak: number;
  profileCompletenessScore: number;
  engagementScore: number;
  lastActivity: Date;
}

export const useGamification = () => {
  const { user } = useAuth();
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadGamificationData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setGamificationData({
          activityLevel: data.activity_level as GamificationData['activityLevel'],
          totalScore: data.total_score,
          dailyStreak: data.daily_streak,
          profileCompletenessScore: data.profile_completeness_score,
          engagementScore: data.engagement_score,
          lastActivity: new Date(data.last_activity)
        });
      } else {
        // Create initial gamification record
        await initializeGamification();
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeGamification = async () => {
    if (!user) return;

    try {
      const profileScore = await calculateProfileCompleteness();
      
      const { data, error } = await supabase
        .from('user_gamification')
        .insert({
          user_id: user.id,
          activity_level: 'low',
          total_score: profileScore,
          daily_streak: 0,
          profile_completeness_score: profileScore,
          engagement_score: 0,
          last_activity: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGamificationData({
          activityLevel: data.activity_level as GamificationData['activityLevel'],
          totalScore: data.total_score,
          dailyStreak: data.daily_streak,
          profileCompletenessScore: data.profile_completeness_score,
          engagementScore: data.engagement_score,
          lastActivity: new Date(data.last_activity)
        });
      }
    } catch (error) {
      console.error('Error initializing gamification:', error);
    }
  };

  const calculateProfileCompleteness = async () => {
    if (!user) return 0;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: photos } = await supabase
        .from('photos')
        .select('id')
        .eq('user_id', user.id);

      const { data: interests } = await supabase
        .from('interests')
        .select('id')
        .eq('user_id', user.id);

      let score = 0;
      const maxScore = 100;

      if (profile) {
        // Basic info (40 points)
        if (profile.name) score += 5;
        if (profile.age) score += 5;
        if (profile.bio) score += 10;
        if (profile.location) score += 5;
        if (profile.job) score += 5;
        if (profile.education) score += 5;
        if (profile.height) score += 5;

        // Photos (30 points)
        if (photos && photos.length > 0) score += 10;
        if (photos && photos.length >= 3) score += 10;
        if (photos && photos.length >= 6) score += 10;

        // Interests (20 points)
        if (interests && interests.length >= 3) score += 10;
        if (interests && interests.length >= 5) score += 10;

        // Additional details (10 points)
        if (profile.zodiac_sign) score += 3;
        if (profile.relationship_type) score += 3;
        if (profile.exercise) score += 2;
        if (profile.drinking) score += 2;
      }

      return Math.min(score, maxScore);
    } catch (error) {
      console.error('Error calculating profile completeness:', error);
      return 0;
    }
  };

  const updateActivityLevel = async (newScore: number) => {
    if (!user) return;

    let activityLevel: GamificationData['activityLevel'] = 'inactive';
    
    if (newScore >= 1000) activityLevel = 'very_active';
    else if (newScore >= 500) activityLevel = 'active';
    else if (newScore >= 200) activityLevel = 'moderate';
    else if (newScore >= 50) activityLevel = 'low';

    try {
      await supabase
        .from('user_gamification')
        .update({
          activity_level: activityLevel,
          total_score: newScore,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      setGamificationData(prev => prev ? {
        ...prev,
        activityLevel,
        totalScore: newScore,
        lastActivity: new Date()
      } : null);
    } catch (error) {
      console.error('Error updating activity level:', error);
    }
  };

  const addEngagementPoints = async (points: number, activityType: string) => {
    if (!user || !gamificationData) return;

    const newEngagementScore = gamificationData.engagementScore + points;
    const newTotalScore = gamificationData.totalScore + points;

    try {
      await supabase
        .from('user_gamification')
        .update({
          engagement_score: newEngagementScore,
          total_score: newTotalScore,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Track the activity
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          metadata: { points_earned: points }
        });

      await updateActivityLevel(newTotalScore);
    } catch (error) {
      console.error('Error adding engagement points:', error);
    }
  };

  const updateDailyStreak = async () => {
    if (!user || !gamificationData) return;

    const now = new Date();
    const lastActivity = gamificationData.lastActivity;
    const timeDiff = now.getTime() - lastActivity.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    let newStreak = gamificationData.dailyStreak;

    if (daysDiff === 1) {
      // Consecutive day
      newStreak += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = 1;
    }
    // Same day = no change

    try {
      await supabase
        .from('user_gamification')
        .update({
          daily_streak: newStreak,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      setGamificationData(prev => prev ? {
        ...prev,
        dailyStreak: newStreak,
        lastActivity: now
      } : null);
    } catch (error) {
      console.error('Error updating daily streak:', error);
    }
  };

  const getActivityLevelDisplay = (level: GamificationData['activityLevel']) => {
    const displays = {
      'very_active': { label: 'Very Active', color: 'text-green-600', emoji: '🔥' },
      'active': { label: 'Active', color: 'text-blue-600', emoji: '⚡' },
      'moderate': { label: 'Moderate', color: 'text-yellow-600', emoji: '⭐' },
      'low': { label: 'Low Activity', color: 'text-orange-600', emoji: '🌱' },
      'inactive': { label: 'Inactive', color: 'text-gray-600', emoji: '💤' }
    };
    return displays[level];
  };

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  return {
    gamificationData,
    loading,
    loadGamificationData,
    addEngagementPoints,
    updateDailyStreak,
    calculateProfileCompleteness,
    getActivityLevelDisplay
  };
};
