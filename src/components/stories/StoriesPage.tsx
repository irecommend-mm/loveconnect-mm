import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Crown, Sparkles, Heart, Star, UserPlus, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Story } from '@/types/FriendDateTypes';
import StoryCard from './StoryCard';
import StoryCreationModal from './StoryCreationModal';
import StoryViewer from './StoryViewer';
import PremiumFeatures from '@/components/PremiumFeatures';

const StoriesPage = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  const checkPremiumStatus = useCallback(async () => {
    if (!user) return;

    try {
      // Check if user has premium subscription
      // This is a placeholder - implement based on your premium system
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('premium_status, premium_expires_at')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If premium fields don't exist, assume user is not premium
        console.log('Premium fields not found in profile. Assuming non-premium user.');
        setIsPremium(false);
        return;
      }

      if (profile) {
        console.log('Raw profile data:', profile);
        const hasPremium = profile.premium_status === 'active' && 
          profile.premium_expires_at && 
          new Date(profile.premium_expires_at) > new Date();
        console.log('Premium check:', { profile, hasPremium });
        setIsPremium(hasPremium);
      } else {
        console.log('No profile found, setting premium to false');
        setIsPremium(false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    }
  }, [user]);

  const loadStories = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Check if stories table exists by trying a simple query
      const { data: tableCheckData, error: tableCheckError } = await supabase
        .from('stories')
        .select('*')
        .limit(1);

      if (tableCheckError) {
        // Table doesn't exist yet - show setup message
        console.log('Stories table not found. Please run the database migration first.');
        setStories([]);
        return;
      }

      // Fetch stories with media data
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select(`
          *,
          media:story_media(*)
        `)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (storiesError) throw storiesError;

      // Fetch user profiles separately since there's no direct foreign key
      const userIds = storiesData?.map(story => story.user_id).filter(Boolean) || [];
      let userProfiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, name, age, location')
          .in('user_id', userIds);
        
        if (profilesError) {
          console.warn('Error fetching user profiles:', profilesError);
        } else {
          userProfiles = profilesData || [];
        }
      }

      console.log('Stories query result:', { storiesData, userProfiles });

      // Fetch user interactions for current user
      const { data: interactionsData } = await (supabase as any)
        .from('story_interactions')
        .select('*')
        .eq('user_id', user.id);

      // Merge stories with user profiles and interactions
      const storiesWithInteractions = storiesData?.map(story => {
        const userProfile = userProfiles.find(profile => profile.user_id === story.user_id);
        const userInteraction = interactionsData?.find(
          interaction => interaction.story_id === story.id
        );
        
        return {
          ...story,
          user_interaction: userInteraction || null,
          user: userProfile ? {
            ...userProfile,
            photos: ['https://via.placeholder.com/300x400/FF69B4/FFFFFF?text=Profile+Photo'] // Placeholder photo
          } : null
        };
      }) || [];

      setStories(storiesWithInteractions);

    } catch (error) {
      console.error('Error loading stories:', error);
      // Don't show error toast for missing table - just log it
      if (error instanceof Error && error.message.includes('relation "stories" does not exist')) {
        console.log('Stories table not found. Please run the database migration first.');
        setStories([]);
      } else {
        toast({
          title: "Error loading stories",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleCreateStory = () => {
    // Temporarily bypass premium check for testing
    // if (!isPremium) {
    //   setShowPremiumModal(true);
    //   return;
    // }
    setShowCreateModal(true);
  };

  const handleStoryCreated = () => {
    loadStories();
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const handleStoryUpdated = () => {
    loadStories();
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
  };

  // useEffect must come after function definitions
  useEffect(() => {
    if (user) {
      loadStories();
      checkPremiumStatus();
    }
  }, [user, loadStories, checkPremiumStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Stories
              </h1>
            </div>

            <Button
              onClick={handleCreateStory}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Story
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-12 w-12 text-pink-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Stories Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Be the first to share your story! Premium users can create engaging stories with photos and videos.
            </p>
            
            {/* Database Setup Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Database Setup Required:</p>
                  <p className="mt-1">Run the stories migration in your Supabase dashboard to enable story creation.</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-medium shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Story
            </Button>
          </div>
        ) : (
          <>
            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onClick={() => handleStoryClick(story)}
                  isPremium={isPremium}
                />
              ))}
            </div>

            {/* Load More */}
            {stories.length >= 20 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full"
                >
                  Load More Stories
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Story Modal */}
      <StoryCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStoryCreated={handleStoryCreated}
      />

      {/* Story Viewer Modal */}
      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          isOpen={!!selectedStory}
          onClose={handleCloseStory}
          onStoryUpdated={handleStoryUpdated}
        />
      )}

      {/* Premium Features Modal - Temporarily disabled for testing */}
      {/* <PremiumFeatures
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      /> */}
    </div>
  );
};

export default StoriesPage;
