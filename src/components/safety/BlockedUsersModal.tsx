
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSafetyFeatures } from '@/hooks/useSafetyFeatures';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BlockedUsersModalProps {
  open: boolean;
  onClose: () => void;
}

interface BlockedUser {
  id: string;
  name: string;
  blocked_id: string;
}

export const BlockedUsersModal = ({ open, onClose }: BlockedUsersModalProps) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { unblockUser } = useSafetyFeatures();
  const { user } = useAuth();

  const loadBlockedUsers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          blocked_id,
          profiles!blocked_users_blocked_id_fkey (
            name
          )
        `)
        .eq('blocker_id', user.id);
      
      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        id: item.blocked_id,
        name: (item.profiles as { name: string })?.name || 'Unknown User',
        blocked_id: item.blocked_id
      })) || [];
      
      setBlockedUsers(formattedData);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockedId: string) => {
    await unblockUser(blockedId);
    loadBlockedUsers(); // Refresh the list
  };

  useEffect(() => {
    if (open) {
      loadBlockedUsers();
    }
  }, [open, user]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Blocked Users</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No blocked users
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((blockedUser) => (
                <div key={blockedUser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{blockedUser.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(blockedUser.blocked_id)}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
