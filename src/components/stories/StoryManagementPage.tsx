import React, { useState, useEffect } from 'react';
import { Edit3, Eye, EyeOff, Trash2, Calendar, Heart, Star, UserPlus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Story } from '@/types/FriendDateTypes';

const StoryManagementPage = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyStories();
    }
  }, [user]);

  const loadMyStories = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`
          *,
          story_media(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedStories: Story[] = (storiesData || []).map(story => ({
        id: story.id,
        user_id: story.user_id,
        title: story.title,
        description: story.description,
        expires_at: story.expires_at,
        is_active: story.is_active,
        view_count: story.view_count || 0,
        like_count: story.like_count || 0,
        super_like_count: story.super_like_count || 0,
        friend_request_count: story.friend_request_count || 0,
        created_at: story.created_at,
        updated_at: story.updated_at,
        media: (story.story_media || []).map((media: any) => ({
          id: media.id,
          story_id: media.story_id,
          media_url: media.media_url,
          media_type: media.media_type as 'image' | 'video',
          position: media.position,
          created_at: media.created_at
        }))
      }));

      setStories(formattedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        title: "Error",
        description: "Failed to load your stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStoryVisibility = async (storyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_active: !currentStatus })
        .eq('id', storyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, is_active: !currentStatus }
            : story
        )
      );

      toast({
        title: currentStatus ? "Story Hidden" : "Story Shown",
        description: `Your story is now ${currentStatus ? 'hidden' : 'visible'} to others.`,
      });
    } catch (error) {
      console.error('Error toggling story visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update story visibility",
        variant: "destructive",
      });
    }
  };

  const deleteStory = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_active: false })
        .eq('id', storyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setStories(prev => prev.filter(story => story.id !== storyId));

      toast({
        title: "Story Deleted",
        description: "Your story has been permanently removed.",
      });
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Error",
        description: "Failed to delete story",
        variant: "destructive",
      });
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const hoursLeft = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    if (hoursLeft === 0) return 'Expired';
    if (hoursLeft < 24) return `${hoursLeft}h left`;
    return `${Math.ceil(hoursLeft / 24)}d left`;
  };

  const getStatusBadge = (story: Story) => {
    const isExpired = new Date(story.expires_at) < new Date();
    
    if (isExpired) return <Badge variant="destructive">Expired</Badge>;
    if (!story.is_active) return <Badge variant="secondary">Hidden</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Stories</h1>
          <p className="text-muted-foreground">Edit, hide, or delete your stories</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {stories.filter(s => s.is_active && new Date(s.expires_at) > new Date()).length} Active
        </Badge>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No stories yet</h3>
          <p className="text-muted-foreground">
            Create your first story to share moments with others.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {story.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {story.description || 'No description'}
                    </p>
                  </div>
                  {getStatusBadge(story)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Story Preview */}
                {story.media && story.media.length > 0 && (
                  <div className="aspect-video rounded-md overflow-hidden bg-muted">
                    {story.media[0].media_type === 'video' ? (
                      <video
                        src={story.media[0].media_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={story.media[0].media_url}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{story.view_count} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span>{story.like_count} likes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span>{story.super_like_count} super</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span>{story.friend_request_count} requests</span>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {new Date(story.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeRemaining(story.expires_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStoryVisibility(story.id, story.is_active)}
                    disabled={new Date(story.expires_at) < new Date()}
                    className="flex-1"
                  >
                    {story.is_active ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Show
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Story</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{story.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteStory(story.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryManagementPage;