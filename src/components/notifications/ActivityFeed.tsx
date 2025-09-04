import React, { useState, useEffect } from 'react';
import { Heart, Eye, Star, UserPlus, MessageCircle, Camera, Clock, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ActivityItem {
  id: string;
  type: 'photo_like' | 'profile_view' | 'story_view' | 'story_like' | 'super_like' | 'message' | 'match';
  actor_name: string;
  actor_photo?: string;
  target_photo?: string;
  message?: string;
  timestamp: Date;
  read: boolean;
}

const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadActivityFeed();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadActivityFeed = async () => {
    if (!user) return;

    try {
      // Load recent user activities
      const { data: activityData, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('target_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform data to ActivityItem format
      const formattedActivities: ActivityItem[] = (activityData || []).map(activity => ({
        id: activity.id,
        type: activity.activity_type as ActivityItem['type'],
        actor_name: 'Someone', // We'll load this separately
        actor_photo: undefined,
        target_photo: (activity.metadata as any)?.photo_url,
        message: (activity.metadata as any)?.message,
        timestamp: new Date(activity.created_at),
        read: false
      }));

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('activity_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activity',
          filter: `target_user_id=eq.${user.id}`
        },
        (payload) => {
          // Add new activity to the top of the list
          const newActivity: ActivityItem = {
            id: payload.new.id,
            type: payload.new.activity_type,
            actor_name: 'Someone', // We'd need to fetch this
            timestamp: new Date(payload.new.created_at),
            read: false
          };
          
          setActivities(prev => [newActivity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'photo_like':
        return <Heart className="h-4 w-4 text-pink-500 fill-current" />;
      case 'profile_view':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'story_view':
        return <Camera className="h-4 w-4 text-purple-500" />;
      case 'story_like':
        return <Heart className="h-4 w-4 text-pink-500 fill-current" />;
      case 'super_like':
        return <Star className="h-4 w-4 text-yellow-500 fill-current" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'match':
        return <Heart className="h-4 w-4 text-red-500 fill-current" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'photo_like':
        return 'liked your photo';
      case 'profile_view':
        return 'viewed your profile';
      case 'story_view':
        return 'viewed your story';
      case 'story_like':
        return 'liked your story';
      case 'super_like':
        return 'super liked you';
      case 'message':
        return 'sent you a message';
      case 'match':
        return 'matched with you';
      default:
        return 'interacted with you';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'photo_like':
      case 'story_like':
        return 'border-l-pink-500 bg-pink-50/50';
      case 'super_like':
        return 'border-l-yellow-500 bg-yellow-50/50';
      case 'match':
        return 'border-l-red-500 bg-red-50/50';
      case 'message':
        return 'border-l-green-500 bg-green-50/50';
      default:
        return 'border-l-blue-500 bg-blue-50/50';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">See who's been checking you out</p>
        </div>
        {activities.some(a => !a.read) && (
          <Badge variant="secondary">
            {activities.filter(a => !a.read).length} new
          </Badge>
        )}
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No activity yet</h3>
            <p className="text-muted-foreground">
              Your activity will appear here when people interact with your profile
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card 
              key={activity.id} 
              className={`border-l-4 ${getActivityColor(activity.type)} hover:shadow-md transition-shadow cursor-pointer`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {/* Actor Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.actor_photo} />
                    <AvatarFallback>
                      {activity.actor_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.actor_name}</span>{' '}
                        {getActivityText(activity)}
                      </p>
                    </div>
                    
                    {activity.message && (
                      <p className="text-xs text-muted-foreground italic mb-2">
                        "{activity.message}"
                      </p>
                    )}

                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>

                  {/* Target Photo */}
                  {activity.target_photo && (
                    <div className="flex-shrink-0">
                      <img
                        src={activity.target_photo}
                        alt="Target"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </div>
                  )}

                  {/* Unread Indicator */}
                  {!activity.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;