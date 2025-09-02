
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'match' | 'like' | 'message' | 'safety' | 'profile_view' | 'crossed_paths' | 'super_like';
  data: Record<string, unknown>;
  read: boolean;
  sentAt?: Date;
  createdAt: Date;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Load existing notifications
    loadNotifications();

    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('push-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'push_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification: PushNotification = {
            id: payload.new.id,
            title: payload.new.title,
            body: payload.new.body,
            type: payload.new.type as PushNotification['type'],
            data: payload.new.data,
            read: payload.new.read,
            sentAt: payload.new.sent_at ? new Date(payload.new.sent_at) : undefined,
            createdAt: new Date(payload.new.created_at)
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.body,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedNotifications: PushNotification[] = (data || []).map(notif => ({
        id: notif.id,
        title: notif.title,
        body: notif.body,
        type: notif.type as PushNotification['type'],
        data: notif.data,
        read: notif.read,
        sentAt: notif.sent_at ? new Date(notif.sent_at) : undefined,
        createdAt: new Date(notif.created_at)
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const sendNotification = async (
    userId: string,
    title: string,
    body: string,
    type: PushNotification['type'],
    data: Record<string, unknown> = {}
  ) => {
    try {
      await supabase
        .from('push_notifications')
        .insert({
          user_id: userId,
          title,
          body,
          type,
          data,
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('push_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('push_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Notification triggers for different actions
  const notifyOnMatch = async (matchedUserId: string, userName: string) => {
    await sendNotification(
      matchedUserId,
      'New Match! 💕',
      `You and ${userName} liked each other!`,
      'match',
      { userId: user?.id, userName }
    );
  };

  const notifyOnLike = async (likedUserId: string, userName: string) => {
    await sendNotification(
      likedUserId,
      'Someone likes you! 💖',
      `${userName} liked your profile`,
      'like',
      { userId: user?.id, userName }
    );
  };

  const notifyOnSuperLike = async (superLikedUserId: string, userName: string) => {
    await sendNotification(
      superLikedUserId,
      'You got a Super Like! ⭐',
      `${userName} super liked you!`,
      'super_like',
      { userId: user?.id, userName }
    );
  };

  const notifyOnProfileView = async (viewedUserId: string, viewerName: string) => {
    await sendNotification(
      viewedUserId,
      'Profile View 👀',
      `${viewerName} viewed your profile`,
      'profile_view',
      { userId: user?.id, viewerName }
    );
  };

  const notifyOnCrossedPaths = async (crossedUserId: string, userName: string, location: string) => {
    await sendNotification(
      crossedUserId,
      'Crossed Paths 🗺️',
      `You crossed paths with ${userName} near ${location}`,
      'crossed_paths',
      { userId: user?.id, userName, location }
    );
  };

  return {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification,
    notifyOnMatch,
    notifyOnLike,
    notifyOnSuperLike,
    notifyOnProfileView,
    notifyOnCrossedPaths
  };
};
