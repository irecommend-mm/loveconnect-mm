
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useSafetyFeatures = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const reportUser = async (reportedId: string, reason: string, description?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_id: reportedId,
          reason,
          description: description || null
        });
          
      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe.",
      });
    } catch (error: any) {
      console.error('Report error:', error);
      toast({
        title: "Error",
        description: "Unable to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (blockedId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: blockedId
        });
          
      if (error) throw error;

      toast({
        title: "User Blocked",
        description: "You won't see this user anymore.",
      });
    } catch (error: any) {
      console.error('Block error:', error);
      toast({
        title: "Error",
        description: "Unable to block user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (blockedId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedId);
          
      if (error) throw error;

      toast({
        title: "User Unblocked",
        description: "You can now see this user again.",
      });
    } catch (error: any) {
      console.error('Unblock error:', error);
      toast({
        title: "Error",
        description: "Unable to unblock user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBlockedUsers = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);
      
      if (error) throw error;
      return data?.map(item => item.blocked_id) || [];
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  };

  const isUserBlocked = async (userId: string) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('is_user_blocked', {
          blocker_id: user.id,
          blocked_id: userId
        });
      
      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  };

  return {
    reportUser,
    blockUser,
    unblockUser,
    getBlockedUsers,
    isUserBlocked,
    loading
  };
};
