
import React, { useState, useRef, useEffect } from 'react';
import { Heart, Star, X, Info, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  job: string;
  education: string;
  photos: string[];
  interests: string[];
  verified: boolean;
}

interface MobileSwipeCardProps {
  profile: Profile;
  onSwipe: (action: 'like' | 'dislike' | 'super_like') => void;
  onShowProfile: () => void;
}

const MobileSwipeCard = ({ profile, onSwipe, onShowProfile }: MobileSwipeCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [showActionFeedback, setShowActionFeedback] = useState<'like' | 'dislike' | 'super_like' | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    startPosRef.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startPosRef.current.x;
    const deltaY = clientY - startPosRef.current.y;
    const newRotation = deltaX * 0.1;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(newRotation);

    // Show action feedback based on swipe direction and distance
    if (Math.abs(deltaX) > 50) {
      if (deltaY < -100 && Math.abs(deltaX) < 150) {
        setShowActionFeedback('super_like');
      } else if (deltaX > 0) {
        setShowActionFeedback('like');
      } else {
        setShowActionFeedback('dislike');
      }
    } else {
      setShowActionFeedback(null);
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    const superThreshold = 120;

    if (dragOffset.y < -superThreshold && Math.abs(dragOffset.x) < 150) {
      // Super like (swipe up)
      onSwipe('super_like');
    } else if (dragOffset.x > threshold) {
      // Like (swipe right)
      onSwipe('like');
    } else if (dragOffset.x < -threshold) {
      // Dislike (swipe left)
      onSwipe('dislike');
    } else {
      // Reset position if not enough distance
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
      setShowActionFeedback(null);
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  const handleNextPhoto = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto touch-none">
      <div 
        ref={cardRef}
        className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isDragging ? 'scale-105 cursor-grabbing' : 'hover:scale-102 cursor-grab'
        }`}
        style={{ 
          transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Action Feedback Overlays */}
        {showActionFeedback && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className={`text-4xl md:text-6xl font-bold transform rotate-12 opacity-80 ${
              showActionFeedback === 'like' ? 'text-green-500' : 
              showActionFeedback === 'dislike' ? 'text-red-500' : 
              'text-blue-500'
            }`}>
              {showActionFeedback === 'like' ? 'LIKE' : 
               showActionFeedback === 'dislike' ? 'NOPE' : 
               'SUPER LIKE'}
            </div>
          </div>
        )}

        {/* Photo Section */}
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          <img
            src={profile.photos[currentPhotoIndex]}
            alt={profile.name}
            className="w-full h-full object-cover transition-all duration-500"
            draggable={false}
          />
          
          {/* Verification Badge */}
          {profile.verified && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 0L12.09 6.26L20 6.93L15.18 12.99L17.64 20L10 16.18L2.36 20L4.82 12.99L0 6.93L7.91 6.26L10 0Z"/>
              </svg>
            </div>
          )}

          {/* Photo Navigation Dots */}
          <div className="absolute top-4 left-4 right-4 flex space-x-1">
            {profile.photos.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                  index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Photo Navigation Areas */}
          <div className="absolute inset-0 flex">
            <div 
              className="w-1/2 h-full z-10" 
              onClick={handlePrevPhoto}
              onTouchEnd={handlePrevPhoto}
            />
            <div 
              className="w-1/2 h-full z-10" 
              onClick={handleNextPhoto}
              onTouchEnd={handleNextPhoto}
            />
          </div>

          {/* Info Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowProfile();
            }}
            className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <Info className="h-5 w-5 text-white" />
          </button>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center space-x-2 mb-3">
            <h2 className="text-2xl md:text-3xl font-bold">{profile.name}</h2>
            <span className="text-xl md:text-2xl">{profile.age}</span>
            {profile.verified && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            )}
          </div>
          
          <div className="space-y-2 mb-4">
            {profile.location && (
              <div className="flex items-center space-x-2 text-sm opacity-90">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.job && (
              <div className="flex items-center space-x-2 text-sm opacity-90">
                <Briefcase className="h-4 w-4" />
                <span>{profile.job}</span>
              </div>
            )}

            {profile.education && (
              <div className="flex items-center space-x-2 text-sm opacity-90">
                <GraduationCap className="h-4 w-4" />
                <span>{profile.education}</span>
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm opacity-90 mb-4 line-clamp-2">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {profile.interests.slice(0, 3).map((interest, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 bg-white/20 text-white text-xs backdrop-blur-sm border-0"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="flex justify-center items-center space-x-6 mt-8 px-4">
        <Button
          onClick={() => onSwipe('dislike')}
          size="lg"
          className="w-16 h-16 rounded-full bg-white shadow-xl border-2 border-gray-100 hover:scale-110 active:scale-95 transition-all duration-200 group"
        >
          <X className="h-7 w-7 text-gray-600 group-hover:text-red-500 transition-colors" />
        </Button>
        
        <Button
          onClick={() => onSwipe('super_like')}
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <Star className="h-6 w-6 text-white fill-current" />
        </Button>
        
        <Button
          onClick={() => onSwipe('like')}
          size="lg"
          className="w-18 h-18 rounded-full bg-gradient-to-r from-pink-500 to-red-500 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <Heart className="h-8 w-8 text-white fill-current" />
        </Button>
      </div>
    </div>
  );
};

export default MobileSwipeCard;
