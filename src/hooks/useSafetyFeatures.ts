
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
          description
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
      toast({
        title: "Error",
        description: error.message,
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    reportUser,
    blockUser,
    unblockUser,
    loading
  };
};
