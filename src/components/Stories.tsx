
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import VideoPlayer from './VideoPlayer';
import VideoRecorder from './VideoRecorder';

interface Story {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  user_name: string;
  user_photo?: string;
  is_viewed?: boolean;
}

const Stories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStories();
    }
  }, [user]);

  const loadStories = async () => {
    if (!user) return;

    try {
      // Get active stories with user info
      const { data: storiesData } = await supabase
        .from('stories')
        .select(`
          *,
          profiles!inner(name)
        `)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (storiesData) {
        // Check which stories the user has viewed
        const { data: viewedStories } = await supabase
          .from('story_views')
          .select('story_id')
          .eq('viewer_id', user.id);

        const viewedIds = new Set(viewedStories?.map(v => v.story_id) || []);

        const storiesWithViews = storiesData.map(story => ({
          ...story,
          user_name: story.profiles.name,
          is_viewed: viewedIds.has(story.id)
        }));

        setStories(storiesWithViews);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading stories:', error);
      setLoading(false);
    }
  };

  const handleStoryView = async (story: Story) => {
    if (!user || story.user_id === user.id) return;

    try {
      // Mark story as viewed
      await supabase
        .from('story_views')
        .insert({
          story_id: story.id,
          viewer_id: user.id
        });

      // Update local state
      setStories(prev => 
        prev.map(s => 
          s.id === story.id ? { ...s, is_viewed: true, view_count: s.view_count + 1 } : s
        )
      );
    } catch (error) {
      // Ignore duplicate view errors
      console.log('Story view already recorded');
    }
  };

  const uploadStory = async (videoBlob: Blob, thumbnailBlob: Blob) => {
    if (!user) return;

    try {
      setLoading(true);

      // Upload video to storage
      const videoFileName = `story_${user.id}_${Date.now()}.webm`;
      const { data: videoUpload, error: videoError } = await supabase.storage
        .from('profile-images')
        .upload(videoFileName, videoBlob);

      if (videoError) throw videoError;

      // Upload thumbnail
      const thumbnailFileName = `story_thumb_${user.id}_${Date.now()}.jpg`;
      const { data: thumbnailUpload, error: thumbnailError } = await supabase.storage
        .from('profile-images')
        .upload(thumbnailFileName, thumbnailBlob);

      if (thumbnailError) throw thumbnailError;

      // Get public URLs
      const { data: videoUrl } = supabase.storage
        .from('profile-images')
        .getPublicUrl(videoUpload.path);

      const { data: thumbnailUrl } = supabase.storage
        .from('profile-images')
        .getPublicUrl(thumbnailUpload.path);

      // Create story record
      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          video_url: videoUrl.publicUrl,
          thumbnail_url: thumbnailUrl.publicUrl
        });

      if (storyError) throw storyError;

      toast({
        title: "Story posted! 📸",
        description: "Your story will be visible for 24 hours.",
      });

      setShowRecorder(false);
      loadStories();
      
    } catch (error) {
      console.error('Error uploading story:', error);
      toast({
        title: "Upload failed",
        description: "Unable to post your story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showRecorder) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="flex items-center justify-between p-4 bg-black">
          <Button
            onClick={() => setShowRecorder(false)}
            className="bg-transparent hover:bg-gray-800 text-white border-0"
          >
            <X className="h-6 w-6" />
          </Button>
          <h2 className="text-white font-semibold">Create Story</h2>
          <div className="w-10" />
        </div>
        
        <div className="p-4">
          <VideoRecorder
            onVideoRecorded={uploadStory}
            maxDuration={30}
            promptQuestion="Share what you're up to today!"
            className="max-w-sm mx-auto"
          />
        </div>
      </div>
    );
  }

  if (selectedStory) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {selectedStory.user_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{selectedStory.user_name}</p>
              <p className="text-gray-300 text-xs">
                {new Date(selectedStory.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {selectedStory.user_id === user?.id && (
              <div className="flex items-center space-x-1 text-white">
                <Eye className="h-4 w-4" />
                <span className="text-sm">{selectedStory.view_count}</span>
              </div>
            )}
            <Button
              onClick={() => setSelectedStory(null)}
              className="bg-transparent hover:bg-gray-800 text-white border-0"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <VideoPlayer
          videoUrl={selectedStory.video_url}
          thumbnailUrl={selectedStory.thumbnail_url}
          autoPlay={true}
          muted={false}
          className="w-full h-full"
          showControls={false}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Stories</h2>
      
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {/* Add Story Button */}
        <button
          onClick={() => setShowRecorder(true)}
          className="flex-shrink-0 flex flex-col items-center space-y-2"
        >
          <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <span className="text-xs text-gray-600">Your Story</span>
        </button>

        {/* Stories */}
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => {
              setSelectedStory(story);
              handleStoryView(story);
            }}
            className="flex-shrink-0 flex flex-col items-center space-y-2"
          >
            <div className={`w-16 h-16 rounded-full p-0.5 ${
              story.is_viewed 
                ? 'bg-gray-300' 
                : 'bg-gradient-to-r from-pink-500 to-purple-600'
            }`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                <img
                  src={story.thumbnail_url}
                  alt={`${story.user_name}'s story`}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <span className="text-xs text-gray-600 text-center max-w-16 truncate">
              {story.user_name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Stories;
