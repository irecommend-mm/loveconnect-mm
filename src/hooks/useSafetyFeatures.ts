
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
      // Use direct SQL query to handle new table that may not be in types yet
      const { error } = await supabase.rpc('insert_user_report', {
        reporter_id: user.id,
        reported_id: reportedId,
        reason,
        description: description || null
      });

      if (error) {
        // Fallback to direct table access if RPC doesn't exist
        const { error: fallbackError } = await (supabase as any)
          .from('user_reports')
          .insert({
            reporter_id: user.id,
            reported_id: reportedId,
            reason,
            description
          });
          
        if (fallbackError) throw fallbackError;
      }

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
      // Use direct SQL query to handle new table that may not be in types yet
      const { error } = await supabase.rpc('insert_blocked_user', {
        blocker_id: user.id,
        blocked_id: blockedId
      });

      if (error) {
        // Fallback to direct table access if RPC doesn't exist
        const { error: fallbackError } = await (supabase as any)
          .from('blocked_users')
          .insert({
            blocker_id: user.id,
            blocked_id: blockedId
          });
          
        if (fallbackError) throw fallbackError;
      }

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
      // Use direct SQL query to handle new table that may not be in types yet
      const { error } = await supabase.rpc('delete_blocked_user', {
        blocker_id: user.id,
        blocked_id: blockedId
      });

      if (error) {
        // Fallback to direct table access if RPC doesn't exist
        const { error: fallbackError } = await (supabase as any)
          .from('blocked_users')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', blockedId);
          
        if (fallbackError) throw fallbackError;
      }

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

  return {
    reportUser,
    blockUser,
    unblockUser,
    loading
  };
};
