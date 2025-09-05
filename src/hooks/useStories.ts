import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Story, CreateStoryData } from '@/types/FriendDateTypes';
import { toast } from '@/hooks/use-toast';

export const useStories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Load stories from other users
  const loadStories = async () => {
    try {
      setLoading(true);
      
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`
          *,
          story_media(*)
        `)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .neq('user_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles separately
      const userIds = [...new Set((storiesData || []).map(story => story.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, age')
        .in('user_id', userIds);

      const formattedStories: Story[] = (storiesData || []).map(story => {
        const userProfile = profiles?.find(p => p.user_id === story.user_id);
        return {
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
          user: userProfile ? {
            name: userProfile.name,
            age: userProfile.age,
            photos: [],
          } : undefined,
          media: (story.story_media || []).map((media: any) => ({
            id: media.id,
            story_id: media.story_id,
            media_url: media.media_url,
            media_type: media.media_type as 'image' | 'video',
            position: media.position,
            created_at: media.created_at
          }))
        };
      });

      setStories(formattedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load current user's stories
  const loadMyStories = async () => {
    if (!user) return;

    try {
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

      setMyStories(formattedStories);
    } catch (error) {
      console.error('Error loading my stories:', error);
    }
  };

  // Create a new story
  const createStory = async (storyData: CreateStoryData) => {
    if (!user) return false;

    setCreating(true);
    try {
      // Create story record
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          title: storyData.title,
          description: storyData.description,
          is_anonymous: storyData.isAnonymous || false,
          relationship_mode: storyData.relationshipMode || 'date',
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // Upload media files
      for (let i = 0; i < storyData.media.length; i++) {
        const file = storyData.media[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${story.id}/media_${i}_${Date.now()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);

        // Create story media record
        const { error: mediaError } = await supabase
          .from('story_media')
          .insert({
            story_id: story.id,
            media_url: publicUrl,
            media_type: file.type.startsWith('video/') ? 'video' : 'image',
            position: i
          });

        if (mediaError) throw mediaError;
      }

      toast({
        title: "Story Created!",
        description: "Your story has been shared successfully.",
      });

      // Reload stories
      await Promise.all([loadStories(), loadMyStories()]);
      return true;
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setCreating(false);
    }
  };

  // Delete a story
  const deleteStory = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_active: false })
        .eq('id', storyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Story Deleted",
        description: "Your story has been removed.",
      });

      await Promise.all([loadStories(), loadMyStories()]);
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Error",
        description: "Failed to delete story",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadStories();
      loadMyStories();
    }
  }, [user]);

  return {
    stories,
    myStories,
    loading,
    creating,
    createStory,
    deleteStory,
    refreshStories: () => Promise.all([loadStories(), loadMyStories()])
  };
};