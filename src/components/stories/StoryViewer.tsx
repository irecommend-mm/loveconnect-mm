import React, { useState, useEffect, useCallback } from 'react';
import { X, Heart, Star, UserPlus, MessageCircle, ChevronLeft, ChevronRight, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Story, StoryInteraction } from '@/types/FriendDateTypes';

interface StoryViewerProps {
  story: Story;
  isOpen: boolean;
  onClose: () => void;
  onStoryUpdated: () => void;
}

const StoryViewer = ({ story, isOpen, onClose, onStoryUpdated }: StoryViewerProps) => {
  const { user } = useAuth();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [interactionType, setInteractionType] = useState<'like' | 'super_like' | 'friend_request' | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInteraction, setUserInteraction] = useState<StoryInteraction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setIsLoading(true);
      Promise.all([loadUserInteraction(), incrementViewCount()]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [isOpen, user, story.id]);

  const loadUserInteraction = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await (supabase as any)
        .from('story_interactions')
        .select('*')
        .eq('story_id', story.id)
        .eq('user_id', user.id)
        .single();

      setUserInteraction(data as StoryInteraction);
    } catch (error) {
      console.log('No interaction found for user:', user.id, 'on story:', story.id);
      setUserInteraction(null);
    }
  }, [user, story.id]);

  const incrementViewCount = useCallback(async () => {
    try {
      await (supabase as any)
        .from('stories')
        .update({ view_count: story.view_count + 1 })
        .eq('id', story.id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }, [story.id, story.view_count]);

  const handleInteraction = async (type: 'like' | 'super_like' | 'friend_request') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to interact with stories",
        variant: "destructive",
      });
      return;
    }

    // Check if user already interacted
    if (userInteraction && userInteraction.interaction_type === type) {
      toast({
        title: "Already interacted",
        description: `You've already ${type.replace('_', ' ')}d this story`,
        variant: "destructive",
      });
      return;
    }

    setInteractionType(type);
    
    // For like and super like, submit immediately
    if (type === 'like' || type === 'super_like') {
      await submitInteraction(type);
    }
    // For friend request, show message input
  };

  const submitInteraction = async (type: 'like' | 'super_like' | 'friend_request') => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Remove existing interaction if any
      if (userInteraction) {
        await (supabase as any)
          .from('story_interactions')
          .delete()
          .eq('id', userInteraction.id);
      }

      // Create new interaction
      const { error } = await (supabase as any)
        .from('story_interactions')
        .insert({
          story_id: story.id,
          user_id: user.id,
          interaction_type: type,
          message: type === 'friend_request' ? message : null,
          status: type === 'friend_request' ? 'pending' : 'accepted'
        });

      if (error) throw error;

      // Update story counts
      const updateData: Record<string, number> = {};
      if (type === 'like') updateData.like_count = story.like_count + 1;
      if (type === 'super_like') updateData.super_like_count = story.super_like_count + 1;
      if (type === 'friend_request') updateData.friend_request_count = story.friend_request_count + 1;

      await (supabase as any)
        .from('stories')
        .update(updateData)
        .eq('id', story.id);

      // Update local state
      setUserInteraction({
        id: 'temp',
        story_id: story.id,
        user_id: user.id,
        interaction_type: type,
        status: type === 'friend_request' ? 'pending' : 'accepted',
        message: type === 'friend_request' ? message : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success!",
        description: `Your ${type.replace('_', ' ')} has been sent!`,
      });

      onStoryUpdated();
    } catch (error) {
      console.error('Error submitting interaction:', error);
      toast({
        title: "Error",
        description: "Failed to submit interaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFriendRequest = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please add a message with your friend request",
        variant: "destructive",
      });
      return;
    }

    await submitInteraction('friend_request');
  };

  const nextMedia = () => {
    if (story.media && currentMediaIndex < story.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const getCurrentMedia = () => {
    if (story.media && story.media.length > 0) {
      return story.media[currentMediaIndex];
    }
    return null;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (!isOpen) return null;

  const currentMedia = getCurrentMedia();

  // Debug logging
  console.log('StoryViewer received story:', story);
  console.log('Story title:', story.title);
  console.log('Story description:', story.description);
  console.log('Story media:', story.media);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          {story.user && (
            <>
              {story.user.photos && story.user.photos.length > 0 ? (
                <img
                  src={story.user.photos[0]}
                  alt={story.user.name}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="text-white">
                <h3 className="font-semibold">{story.user.name}, {story.user.age}</h3>
                <p className="text-sm text-gray-300">{formatTimeAgo(story.created_at)}</p>
              </div>
            </>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p>Loading story...</p>
          </div>
        </div>
      )}

      {/* Debug Info - Remove after fixing */}
      {!isLoading && (
        <div className="bg-yellow-500/20 p-4 m-4 rounded border border-yellow-500">
          <h3 className="text-yellow-300 font-bold mb-2">DEBUG INFO:</h3>
          <pre className="text-yellow-200 text-xs overflow-auto">
            {JSON.stringify({
              id: story.id,
              title: story.title,
              description: story.description,
              user_id: story.user_id,
              created_at: story.created_at,
              expires_at: story.expires_at,
              media_count: story.media?.length || 0,
              user: story.user ? {
                name: story.user.name,
                age: story.user.age,
                photos: story.user.photos?.length || 0
              } : 'No user data'
            }, null, 2)}
          </pre>
        </div>
      )}

      {/* Story Content */}
      {!isLoading && (
        <>
          {/* Media Display */}
          <div className="flex-1 relative flex items-center justify-center min-h-0">
            {currentMedia ? (
              <div className="relative w-full h-full">
                {currentMedia.media_type === 'video' ? (
                  <video
                    src={currentMedia.media_url}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    muted
                  />
                ) : (
                  <img
                    src={currentMedia.media_url}
                    alt={story.title}
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Navigation Arrows */}
                {story.media && story.media.length > 1 && (
                  <>
                    {currentMediaIndex > 0 && (
                      <button
                        onClick={prevMedia}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6 text-white" />
                      </button>
                    )}
                    
                    {currentMediaIndex < story.media.length - 1 && (
                      <button
                        onClick={nextMedia}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors"
                      >
                        <ChevronRight className="h-6 w-6 text-white" />
                      </button>
                    )}
                  </>
                )}

                {/* Media Progress */}
                {story.media && story.media.length > 1 && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {story.media.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentMediaIndex ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-white">
                <Eye className="h-24 w-24 mx-auto mb-4 text-gray-400" />
                <p className="text-xl">No media available</p>
              </div>
            )}
          </div>

          {/* Story Info and Interactions */}
          <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent relative z-10 border border-red-500">
            {/* Story Title and Description */}
            <h2 className="text-2xl font-bold text-white mb-2 break-words bg-red-500/20 p-2 rounded">
              Title: {story.title || 'Untitled Story'}
            </h2>
            {story.description && story.description.trim() ? (
              <p className="text-gray-300 mb-4 break-words bg-blue-500/20 p-2 rounded">
                Description: {story.description}
              </p>
            ) : (
              <p className="text-gray-400 mb-4 italic bg-yellow-500/20 p-2 rounded">
                No description provided
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-6 text-white/80 text-sm mb-6">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{story.view_count || 0} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{story.like_count || 0} likes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{story.super_like_count || 0} super likes</span>
              </div>
              <div className="flex items-center space-x-1">
                <UserPlus className="h-4 w-4" />
                <span>{story.friend_request_count || 0} requests</span>
              </div>
            </div>

            {/* Interaction Buttons */}
            {user && user.id !== story.user_id && (
              <div className="flex items-center space-x-3">
                {/* Like Button */}
                <Button
                  onClick={() => handleInteraction('like')}
                  disabled={isSubmitting || userInteraction?.interaction_type === 'like'}
                  className={`flex-1 h-12 rounded-full ${
                    userInteraction?.interaction_type === 'like'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`h-5 w-5 mr-2 ${
                    userInteraction?.interaction_type === 'like' ? 'fill-current' : ''
                  }`} />
                  {userInteraction?.interaction_type === 'like' ? 'Liked' : 'Like'}
                </Button>

                {/* Super Like Button */}
                <Button
                  onClick={() => handleInteraction('super_like')}
                  disabled={isSubmitting || userInteraction?.interaction_type === 'super_like'}
                  className={`flex-1 h-12 rounded-full ${
                    userInteraction?.interaction_type === 'super_like'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Star className={`h-5 w-5 mr-2 ${
                    userInteraction?.interaction_type === 'super_like' ? 'fill-current' : ''
                  }`} />
                  {userInteraction?.interaction_type === 'super_like' ? 'Super Liked' : 'Super Like'}
                </Button>

                {/* Friend Request Button */}
                <Button
                  onClick={() => handleInteraction('friend_request')}
                  disabled={isSubmitting || userInteraction?.interaction_type === 'friend_request'}
                  className={`flex-1 h-12 rounded-full ${
                    userInteraction?.interaction_type === 'friend_request'
                      ? 'bg-green-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  {userInteraction?.interaction_type === 'friend_request' ? 'Requested' : 'Friend Request'}
                </Button>
              </div>
            )}

            {/* Friend Request Message Input */}
            {interactionType === 'friend_request' && (
              <div className="mt-4 space-y-3">
                <Input
                  placeholder="Add a message with your friend request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  maxLength={200}
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setInteractionType(null)}
                    variant="outline"
                    className="flex-1 border-white/30 text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFriendRequest}
                    disabled={isSubmitting || !message.trim()}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>
              </div>
            )}

            {/* Expiry Info */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-full text-white text-sm">
                <Clock className="h-4 w-4" />
                <span>Expires in {Math.ceil((new Date(story.expires_at).getTime() - Date.now()) / (1000 * 60 * 60))} hours</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StoryViewer;
