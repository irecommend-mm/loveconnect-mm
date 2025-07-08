
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, X, Star, RotateCcw, Zap, Shield, Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import VideoPlayer from './VideoPlayer';
import { Badge } from '@/components/ui/badge';

interface VideoProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  job: string;
  education: string;
  interests: string[];
  verified: boolean;
  is_video_verified: boolean;
  video_profiles: {
    id: string;
    video_url: string;
    thumbnail_url: string;
    video_type: string;
    prompt_question?: string;
    duration_seconds?: number;
  }[];
  photos: string[];
}

const VideoSwipeStack = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<VideoProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const swipeAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadVideoProfiles();
    }
  }, [user]);

  const loadVideoProfiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get users who haven't been swiped on
      const { data: swipedUserIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const excludeIds = swipedUserIds?.map(s => s.swiped_id) || [];

      // Get profiles - we'll create sample video profiles if none exist
      let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      if (excludeIds.length > 0) {
        profilesQuery = profilesQuery.not('user_id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data: profilesData } = await profilesQuery;

      if (profilesData) {
        const profilesWithVideos = await Promise.all(
          profilesData.map(async (profile) => {
            const [videosResult, photosResult, interestsResult] = await Promise.all([
              supabase
                .from('video_profiles')
                .select('*')
                .eq('user_id', profile.user_id)
                .eq('moderation_status', 'approved')
                .order('position'),
              supabase
                .from('photos')
                .select('url')
                .eq('user_id', profile.user_id)
                .order('position'),
              supabase
                .from('interests')
                .select('interest')
                .eq('user_id', profile.user_id)
            ]);

            // If no video profiles exist, create sample ones
            let videoProfiles = videosResult.data || [];
            if (videoProfiles.length === 0) {
              videoProfiles = await createSampleVideoProfile(profile.user_id);
            }

            return {
              ...profile,
              video_profiles: videoProfiles,
              photos: photosResult.data?.map(p => p.url) || [],
              interests: interestsResult.data?.map(i => i.interest) || [],
            };
          })
        );

        // Filter to only show profiles with videos
        const videoProfiles = profilesWithVideos.filter(p => p.video_profiles.length > 0);
        setProfiles(videoProfiles);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading video profiles:', error);
      setLoading(false);
    }
  };

  const createSampleVideoProfile = async (userId: string) => {
    try {
      // Create a sample video profile with a placeholder video
      const sampleVideo = {
        user_id: userId,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        video_type: 'intro',
        prompt_question: 'Tell us about yourself!',
        thumbnail_url: 'https://images.unsplash.com/photo-1494790108755-2616c72e5184?w=400&h=600&fit=crop',
        duration_seconds: 30,
        position: 0,
        is_primary: true,
        moderation_status: 'approved'
      };

      const { data, error } = await supabase
        .from('video_profiles')
        .insert(sampleVideo)
        .select()
        .single();

      if (error) {
        console.error('Error creating sample video profile:', error);
        return [];
      }

      return [data];
    } catch (error) {
      console.error('Error creating sample video profile:', error);
      return [];
    }
  };

  const handleSwipe = async (action: 'like' | 'dislike' | 'super_like') => {
    if (!user || currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    
    try {
      // Record the swipe
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: currentProfile.user_id,
          action,
        });

      if (error) throw error;

      // Check for match if it's a like or super_like
      if (action === 'like' || action === 'super_like') {
        const { data: matchData } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', currentProfile.user_id)
          .eq('swiped_id', user.id)
          .eq('action', 'like')
          .maybeSingle();

        if (matchData) {
          // Create match record
          await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: currentProfile.user_id
            });

          toast({
            title: "It's a Match! 💕",
            description: `You and ${currentProfile.name} liked each other!`,
          });
        } else {
          const actionText = action === 'super_like' ? 'Super liked' : 'Liked';
          toast({
            title: `${actionText}! 💕`,
            description: `You ${actionText.toLowerCase()} ${currentProfile.name}'s video.`,
          });
        }
      }

      // Move to next profile
      setCurrentIndex(currentIndex + 1);
      setCurrentVideoIndex(0);

    } catch (error) {
      console.error('Error recording swipe:', error);
      toast({
        title: "Error",
        description: "Unable to record your action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextVideo = () => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile && currentVideoIndex < currentProfile.video_profiles.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const prevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Loading video profiles...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <Heart className="h-24 w-24 text-gray-300 mx-auto mb-8" />
        <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">No more video profiles!</h3>
        <p className="text-gray-500 text-center mb-8">Check back later for new video content.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 text-lg rounded-full"
        >
          Refresh
        </Button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const currentVideo = currentProfile.video_profiles[currentVideoIndex];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Video Player */}
      <div 
        ref={swipeAreaRef}
        className="absolute inset-0"
        onClick={() => setShowProfile(!showProfile)}
      >
        <VideoPlayer
          videoUrl={currentVideo.video_url}
          thumbnailUrl={currentVideo.thumbnail_url}
          autoPlay={true}
          muted={true}
          className="w-full h-full"
          showControls={false}
        />
      </div>

      {/* Profile Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
        <div className="flex items-center space-x-3 mb-3">
          <h2 className="text-3xl font-bold text-white">{currentProfile.name}</h2>
          <span className="text-2xl text-white">{currentProfile.age}</span>
          {currentProfile.is_video_verified && (
            <Badge className="bg-blue-500 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {currentVideo.prompt_question && (
          <p className="text-sm text-gray-300 mb-2 italic">"{currentVideo.prompt_question}"</p>
        )}

        {currentProfile.bio && (
          <p className="text-white text-sm mb-3 line-clamp-2">{currentProfile.bio}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {currentProfile.interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/20 text-white text-xs backdrop-blur-sm rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>

          {/* Video Navigation */}
          {currentProfile.video_profiles.length > 1 && (
            <div className="flex space-x-1">
              {currentProfile.video_profiles.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 w-8 rounded-full ${
                    index === currentVideoIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-32 right-4 flex flex-col space-y-4">
        <Button
          onClick={() => handleSwipe('dislike')}
          size="lg"
          className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 border-2 border-white/20"
        >
          <X className="h-8 w-8 text-white" />
        </Button>
        
        <Button
          onClick={() => handleSwipe('super_like')}
          size="lg"
          className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 border-2 border-white/20"
        >
          <Star className="h-8 w-8 text-white fill-current" />
        </Button>
        
        <Button
          onClick={() => handleSwipe('like')}
          size="lg"
          className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 border-2 border-white/20"
        >
          <Heart className="h-8 w-8 text-white fill-current" />
        </Button>
      </div>

      {/* Top Actions */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="bg-black/50 backdrop-blur-sm hover:bg-black/70 border-0 text-white"
          >
            <Flag className="h-4 w-4 mr-1" />
            Report
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="bg-black/50 backdrop-blur-sm hover:bg-black/70 border-0 text-white"
          >
            <Zap className="h-4 w-4 mr-1" />
            Boost
          </Button>
          
          <Button
            size="sm"
            className="bg-black/50 backdrop-blur-sm hover:bg-black/70 border-0 text-white"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Rewind
          </Button>
        </div>
      </div>

      {/* Video Navigation Tap Areas */}
      {currentProfile.video_profiles.length > 1 && (
        <>
          {currentVideoIndex > 0 && (
            <div 
              className="absolute left-0 top-0 bottom-32 w-1/3 z-10"
              onClick={(e) => {
                e.stopPropagation();
                prevVideo();
              }}
            />
          )}
          
          {currentVideoIndex < currentProfile.video_profiles.length - 1 && (
            <div 
              className="absolute right-0 top-0 bottom-32 w-1/3 z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextVideo();
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default VideoSwipeStack;
