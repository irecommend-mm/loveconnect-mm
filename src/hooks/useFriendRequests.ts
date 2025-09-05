import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FriendRequest } from '@/types/FriendDateTypes';
import { toast } from '@/hooks/use-toast';

export const useFriendRequests = () => {
  const { user } = useAuth();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFriendRequests();
    }
  }, [user]);

  const loadFriendRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load received friend requests
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:requester_id (
            id,
            name,
            age
          )
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Load sent friend requests
      const { data: sentRequestsData, error: sentError } = await supabase
        .from('friend_requests')
        .select(`
          *,
          recipient:recipient_id (
            id,
            name,
            age
          )
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      // Get photos for requesters and recipients
      const allUserIds = [
        ...(receivedRequests || []).map(req => req.requester_id),
        ...(sentRequestsData || []).map(req => req.recipient_id)
      ];

      const { data: photosData } = await supabase
        .from('photos')
        .select('user_id, url')
        .in('user_id', allUserIds)
        .eq('is_primary', true);

      const photosByUserId = photosData?.reduce((acc, photo) => {
        acc[photo.user_id] = photo.url;
        return acc;
      }, {} as Record<string, string>) || {};

      // Format received requests
      const formattedReceived: FriendRequest[] = (receivedRequests || []).map(req => ({
        id: req.id,
        requester_id: req.requester_id,
        recipient_id: req.recipient_id,
        status: req.status as 'pending' | 'accepted' | 'rejected' | 'ignored',
        message: req.message,
        created_at: req.created_at,
        updated_at: req.updated_at,
        requester: {
          name: (req as any).requester.name,
          age: (req as any).requester.age,
          photos: photosByUserId[req.requester_id] ? [photosByUserId[req.requester_id]] : []
        }
      }));

      // Format sent requests
      const formattedSent: FriendRequest[] = (sentRequestsData || []).map(req => ({
        id: req.id,
        requester_id: req.requester_id,
        recipient_id: req.recipient_id,
        status: req.status as 'pending' | 'accepted' | 'rejected' | 'ignored',
        message: req.message,
        created_at: req.created_at,
        updated_at: req.updated_at,
        recipient: {
          name: (req as any).recipient.name,
          age: (req as any).recipient.age,
          photos: photosByUserId[req.recipient_id] ? [photosByUserId[req.recipient_id]] : []
        }
      }));

      setFriendRequests(formattedReceived);
      setSentRequests(formattedSent);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      toast({
        title: "Error",
        description: "Failed to load friend requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (recipientId: string, message?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          message: message || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully!",
      });

      await loadFriendRequests();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
      return false;
    }
  };

  const respondToFriendRequest = async (requestId: string, response: 'accepted' | 'rejected') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({
          status: response,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      // If accepted, you might want to create a connection/friendship record here
      if (response === 'accepted') {
        toast({
          title: "Friend Request Accepted",
          description: "You are now friends!",
        });
      } else {
        toast({
          title: "Friend Request Declined",
          description: "The request has been declined.",
        });
      }

      await loadFriendRequests();
      return true;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to friend request",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    friendRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    refreshRequests: loadFriendRequests
  };
};