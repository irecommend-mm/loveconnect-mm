import React, { useState } from 'react';
import { Plus, Camera, Video } from 'lucide-react';
import StoryCard from './StoryCard';
import StoryViewer from './StoryViewer';
import CreateStoryModal from './CreateStoryModal';
import { useStories } from '@/hooks/useStories';
import { Story } from '@/types/FriendDateTypes';
import { Button } from '@/components/ui/button';

const StoriesPage = () => {
  const { stories, myStories, loading } = useStories();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading stories...</p>
        </div>
      </div>
    );
  }

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const handleStoryUpdated = () => {
    // Refresh stories after interaction
    window.location.reload(); // Simple refresh for now
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stories</h1>
          <p className="text-muted-foreground">Share moments that matter</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Story
        </Button>
      </div>

      {/* My Stories Section */}
      {myStories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Your Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={() => handleStoryClick(story)}
                isPremium={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Stories Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          {myStories.length > 0 ? 'Discover Stories' : 'Recent Stories'}
        </h2>
        
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Be the first to share a story! Stories help you express yourself and connect with others.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              <Video className="h-4 w-4 mr-2" />
              Create Your First Story
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={() => handleStoryClick(story)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          isOpen={!!selectedStory}
          onClose={() => setSelectedStory(null)}
          onStoryUpdated={handleStoryUpdated}
        />
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <CreateStoryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onStoryCreated={() => {
            setShowCreateModal(false);
            // Refresh will happen automatically via useStories
          }}
        />
      )}
    </div>
  );
};

export default StoriesPage;