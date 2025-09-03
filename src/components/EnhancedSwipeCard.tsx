
import React, { useState, useRef } from 'react';
import { Heart, Star, X, Users, MapPin, Briefcase, GraduationCap, Info } from 'lucide-react';
import { User as UserType } from '@/types/User';
import { AppMode } from '@/types/FriendDateTypes';
import PhotoGallery from './PhotoGallery';
import CompatibilityScore from './CompatibilityScore';

interface EnhancedSwipeCardProps {
  user: UserType;
  mode: AppMode;
  onSwipe: (direction: 'left' | 'right' | 'super', user: UserType) => void;
  onShowProfile: (user: UserType) => void;
  onShowDetails: () => void;
  showActions?: boolean;
}

const EnhancedSwipeCard = ({ user, mode, onSwipe, onShowProfile, onShowDetails, showActions = true }: EnhancedSwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [showActionFeedback, setShowActionFeedback] = useState<'like' | 'dislike' | 'super' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Mock compatibility score - in real app this would come from AI system
  const mockCompatibilityScore = {
    friendshipScore: 78,
    romanceScore: 85,
    overallCompatibility: 81,
    factors: {
      commonInterests: 80,
      lifestyleAlignment: 75,
      communicationStyle: 70,
      values: 85,
      zodiacCompatibility: user.zodiacSign ? 88 : undefined
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    const newRotation = deltaX * 0.1;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(newRotation);

    // Show action feedback
    if (Math.abs(deltaX) > 50) {
      if (deltaY < -100) {
        setShowActionFeedback('super');
      } else if (deltaX > 0) {
        setShowActionFeedback('like');
      } else {
        setShowActionFeedback('dislike');
      }
    } else {
      setShowActionFeedback(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    const superThreshold = 120;

    if (dragOffset.y < -superThreshold) {
      onSwipe('super', user);
    } else if (dragOffset.x > threshold) {
      onSwipe('right', user);
    } else if (dragOffset.x < -threshold) {
      onSwipe('left', user);
    } else {
      // Reset position
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
      setShowActionFeedback(null);
    }
  };

  const getModeColor = () => mode === 'friend' ? 'blue' : 'pink';
  const getModeIcon = () => mode === 'friend' ? Users : Heart;
  const ModeIcon = getModeIcon();

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div 
        ref={cardRef}
        className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 cursor-grab ${
          isDragging ? 'scale-105 cursor-grabbing' : 'hover:scale-102'
        }`}
        style={{ 
          transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Action Feedback Overlays */}
        {showActionFeedback && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className={`text-6xl font-bold transform rotate-12 opacity-80 ${
              showActionFeedback === 'like' ? 'text-green-500' : 
              showActionFeedback === 'dislike' ? 'text-red-500' : 
              'text-blue-500'
            }`}>
              {showActionFeedback === 'like' ? (mode === 'friend' ? 'FRIEND!' : 'LIKE!') : 
               showActionFeedback === 'dislike' ? 'PASS' : 
               'SUPER!'}
            </div>
          </div>
        )}

        {/* Mode Indicator */}
        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-${getModeColor()}-500 text-white text-sm font-medium flex items-center space-x-1`}>
          <ModeIcon className="h-3 w-3" />
          <span>{mode === 'friend' ? 'Friend Mode' : 'Date Mode'}</span>
        </div>

        {/* Verification Badge */}
        {user.verified && (
          <div className="absolute top-4 right-4 z-10 bg-blue-500 text-white p-2 rounded-full">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M10 0L12.09 6.26L20 6.93L15.18 12.99L17.64 20L10 16.18L2.36 20L4.82 12.99L0 6.93L7.91 6.26L10 0Z"/>
            </svg>
          </div>
        )}

        {/* Photo Gallery */}
        <div className="relative">
          <PhotoGallery photos={user.photos} />
          
          {/* Info Button - Top Right */}
          <button
            onClick={onShowDetails}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 z-20"
          >
            <Info className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                <span className="text-xl text-gray-600">{user.age}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.job && (
                  <div className="flex items-center space-x-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{user.job}</span>
                  </div>
                )}
              </div>

              {user.education && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                  <GraduationCap className="h-3 w-3" />
                  <span>{user.education}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compatibility Score */}
          <div className="mb-4">
            <CompatibilityScore 
              score={mockCompatibilityScore} 
              mode={mode} 
              userName={user.name} 
            />
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-4">
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                {user.bio}
              </p>
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {user.interests.slice(0, 6).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 6 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full border">
                    +{user.interests.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Zodiac Sign */}
          {user.zodiacSign && (
            <div className="flex items-center space-x-2 text-sm text-purple-600 mb-4">
              <span>✨</span>
              <span className="font-medium">{user.zodiacSign}</span>
            </div>
          )}

          {/* View Profile Button */}
          <button
            onClick={() => onShowProfile(user)}
            className="w-full py-2 text-center text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors border-t border-gray-100 pt-4"
          >
            View Full Profile
          </button>
        </div>
      </div>

      {/* Action Buttons - Only show if showActions is true */}
      {showActions && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={() => onSwipe('left', user)}
            className="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 group"
          >
            <X className="h-6 w-6 text-gray-600 group-hover:text-red-500 transition-colors" />
          </button>
          
          <button
            onClick={() => onSwipe('super', user)}
            className={`w-12 h-12 rounded-full bg-gradient-to-r shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 ${
              mode === 'friend' 
                ? 'from-blue-400 to-blue-600' 
                : 'from-purple-400 to-purple-600'
            }`}
          >
            <Star className="h-5 w-5 text-white fill-current" />
          </button>
          
          <button
            onClick={() => onSwipe('right', user)}
            className={`w-16 h-16 rounded-full bg-gradient-to-r shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 ${
              mode === 'friend' 
                ? 'from-blue-500 to-blue-600' 
                : 'from-pink-500 to-red-500'
            }`}
          >
            {mode === 'friend' ? (
              <Users className="h-8 w-8 text-white" />
            ) : (
              <Heart className="h-8 w-8 text-white fill-current" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedSwipeCard;
