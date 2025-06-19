
import React, { useState, useRef, useEffect } from 'react';
import { Heart, Star, X, Info } from 'lucide-react';
import { User as UserType } from '../types/User';

interface SwipeCardProps {
  user: UserType;
  onSwipe: (direction: 'left' | 'right' | 'super', user: UserType) => void;
  onShowProfile: (user: UserType) => void;
}

const SwipeCard = ({ user, onSwipe, onShowProfile }: SwipeCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [showActionFeedback, setShowActionFeedback] = useState<'like' | 'dislike' | 'super' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleNextPhoto = () => {
    if (currentPhotoIndex < user.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
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
      // Super like
      onSwipe('super', user);
    } else if (dragOffset.x > threshold) {
      // Like
      onSwipe('right', user);
    } else if (dragOffset.x < -threshold) {
      // Dislike
      onSwipe('left', user);
    } else {
      // Reset position
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
      setShowActionFeedback(null);
    }
  };

  const handlePass = () => {
    onSwipe('left', user);
    setCurrentPhotoIndex(0);
  };

  const handleLike = () => {
    onSwipe('right', user);
    setCurrentPhotoIndex(0);
  };

  const handleSuperLike = () => {
    onSwipe('super', user);
    setCurrentPhotoIndex(0);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

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
              {showActionFeedback === 'like' ? 'LIKE' : 
               showActionFeedback === 'dislike' ? 'NOPE' : 
               'SUPER LIKE'}
            </div>
          </div>
        )}

        {/* Photo Section */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={user.photos[currentPhotoIndex]}
            alt={user.name}
            className="w-full h-full object-cover transition-all duration-500"
            draggable={false}
          />
          
          {/* Verification Badge */}
          {user.verified && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white p-1 rounded-full">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 0L12.09 6.26L20 6.93L15.18 12.99L17.64 20L10 16.18L2.36 20L4.82 12.99L0 6.93L7.91 6.26L10 0Z"/>
              </svg>
            </div>
          )}

          {/* Photo Navigation Dots */}
          <div className="absolute top-4 left-4 right-4 flex space-x-1">
            {user.photos.map((_, index) => (
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
              className="w-1/2 h-full" 
              onClick={handlePrevPhoto}
            />
            <div 
              className="w-1/2 h-full" 
              onClick={handleNextPhoto}
            />
          </div>

          {/* Info Button */}
          <button
            onClick={() => onShowProfile(user)}
            className="absolute bottom-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Info className="h-4 w-4 text-white" />
          </button>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <span className="text-xl">{user.age}</span>
            {user.verified && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 fill-current text-white" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm opacity-90 mb-2">
            <span>{user.location}</span>
            {user.job && (
              <>
                <span>•</span>
                <span>{user.job}</span>
              </>
            )}
          </div>

          {user.height && (
            <p className="text-sm opacity-90 mb-2">{user.height}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {user.interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button
          onClick={handlePass}
          className="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 group"
        >
          <X className="h-6 w-6 text-gray-600 group-hover:text-red-500 transition-colors" />
        </button>
        
        <button
          onClick={handleSuperLike}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <Star className="h-5 w-5 text-white fill-current" />
        </button>
        
        <button
          onClick={handleLike}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <Heart className="h-8 w-8 text-white fill-current" />
        </button>
      </div>
    </div>
  );
};

export default SwipeCard;
