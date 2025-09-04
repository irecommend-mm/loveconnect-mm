import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MutualConnection {
  name: string;
  profilePicture?: string;
  mutualFriendCount?: number;
  platform: 'facebook' | 'instagram' | 'linkedin';
}

export const useMutualConnections = (targetUserId?: string) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<MutualConnection[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMutualConnections = async (userId: string) => {
    if (!user || !userId || user.id === userId) return;

    setLoading(true);
    try {
      // First check if both users have social media connected
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, lifestyle')
        .in('user_id', [user.id, userId]);

      if (error) throw error;

      const currentUserProfile = profiles?.find(p => p.user_id === user.id);
      const targetUserProfile = profiles?.find(p => p.user_id === userId);

      if (!currentUserProfile || !targetUserProfile) {
        setConnections([]);
        return;
      }

      // Check lifestyle data for social connections
      const currentUserLifestyle = currentUserProfile.lifestyle as any || {};
      const targetUserLifestyle = targetUserProfile.lifestyle as any || {};

      const mockMutualConnections: MutualConnection[] = [];

      // Mock Facebook connections if both have Facebook
      if (currentUserLifestyle.facebook_connected && targetUserLifestyle.facebook_connected) {
        mockMutualConnections.push(
          {
            name: "Sarah Johnson",
            platform: 'facebook',
            mutualFriendCount: 3
          },
          {
            name: "Mike Chen",
            platform: 'facebook',
            mutualFriendCount: 7
          },
          {
            name: "Emma Rodriguez",
            platform: 'facebook',
            mutualFriendCount: 2
          }
        );
      }

      // Mock Instagram connections if both have Instagram
      if (currentUserLifestyle.instagram_username && targetUserLifestyle.instagram_username) {
        mockMutualConnections.push(
          {
            name: "Alex Thompson",
            platform: 'instagram'
          },
          {
            name: "Jessica Lee",
            platform: 'instagram'
          }
        );
      }

      setConnections(mockMutualConnections);
    } catch (error) {
      console.error('Error loading mutual connections:', error);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      loadMutualConnections(targetUserId);
    }
  }, [targetUserId, user]);

  return {
    connections,
    loading,
    refreshConnections: () => targetUserId && loadMutualConnections(targetUserId)
  };
};