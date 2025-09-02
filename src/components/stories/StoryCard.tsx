import React from 'react';
import { Heart, Star, UserPlus, Clock, Eye } from 'lucide-react';
import { Story } from '@/types/FriendDateTypes';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
  isPremium?: boolean;
}

const StoryCard = ({ story, onClick, isPremium = false }: StoryCardProps) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getExpiryTime = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Expires soon';
    if (diffInHours < 24) return `Expires in ${diffInHours}h`;
    return `Expires in ${Math.floor(diffInHours / 24)}d`;
  };

  const getFirstMediaUrl = () => {
    if (story.media && story.media.length > 0) {
      return story.media[0].media_url;
    }
    return null;
  };

  const getMediaType = () => {
    if (story.media && story.media.length > 0) {
      return story.media[0].media_type;
    }
    return 'image';
  };

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
    >
      {/* Story Media */}
      <div className="relative h-48 overflow-hidden">
        {getFirstMediaUrl() ? (
          getMediaType() === 'video' ? (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-xs font-bold">VIDEO</span>
                </div>
                <p className="text-sm text-purple-600 font-medium">Video Story</p>
              </div>
            </div>
          ) : (
            <img
              src={getFirstMediaUrl()!}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Eye className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">No media</p>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Story Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            {story.title}
          </h3>
          {story.description && (
            <p className="text-sm text-gray-200 line-clamp-1 mb-2">
              {story.description}
            </p>
          )}
          
          {/* User Info */}
          {story.user && (
            <div className="flex items-center space-x-2">
              {story.user.photos && story.user.photos.length > 0 ? (
                <img
                  src={story.user.photos[0]}
                  alt={story.user.name}
                  className="w-6 h-6 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                  <UserPlus className="h-3 w-3" />
                </div>
              )}
              <span className="text-sm font-medium">
                {story.user.name}, {story.user.age}
              </span>
              {story.user.location && (
                <span className="text-xs text-gray-300">
                  📍 {story.user.location}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Top Right Badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          {/* Expiry Time */}
          <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{getExpiryTime(story.expires_at)}</span>
          </div>

          {/* Media Count */}
          {story.media && story.media.length > 1 && (
            <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              {story.media.length} media
            </div>
          )}
        </div>

        {/* Top Left Stats */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {/* View Count */}
          <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{story.view_count}</span>
          </div>

          {/* Like Count */}
          {story.like_count > 0 && (
            <div className="bg-pink-500/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{story.like_count}</span>
            </div>
          )}

          {/* Super Like Count */}
          {story.super_like_count > 0 && (
            <div className="bg-blue-500/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>{story.super_like_count}</span>
            </div>
          )}

          {/* Friend Request Count */}
          {story.friend_request_count > 0 && (
            <div className="bg-green-500/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <UserPlus className="h-3 w-3" />
              <span>{story.friend_request_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Created {formatTimeAgo(story.created_at)}</span>
          
          {/* Interaction Status */}
          {story.user_interaction && (
            <div className="flex items-center space-x-1">
              {story.user_interaction.interaction_type === 'like' && (
                <Heart className="h-4 w-4 text-pink-500 fill-current" />
              )}
              {story.user_interaction.interaction_type === 'super_like' && (
                <Star className="h-4 w-4 text-blue-500 fill-current" />
              )}
              {story.user_interaction.interaction_type === 'friend_request' && (
                <UserPlus className="h-4 w-4 text-green-500" />
              )}
              <span className="text-xs font-medium">
                {story.user_interaction.status === 'pending' && 'Pending'}
                {story.user_interaction.status === 'accepted' && 'Accepted'}
                {story.user_interaction.status === 'rejected' && 'Rejected'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default StoryCard;

