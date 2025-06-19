
import React, { useState } from 'react';
import { Heart, User } from 'lucide-react';
import { User as UserType } from '../types/User';

interface SwipeCardProps {
  user: UserType;
  onSwipe: (direction: 'left' | 'right', user: UserType) => void;
}

const SwipeCard = ({ user, onSwipe }: SwipeCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

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

  const handlePass = () => {
    onSwipe('left', user);
    setCurrentPhotoIndex(0);
  };

  const handleLike = () => {
    onSwipe('right', user);
    setCurrentPhotoIndex(0);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div 
        className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-transform duration-200 ${
          isDragging ? 'scale-105' : ''
        }`}
        style={{ transform: `translateX(${dragOffset}px)` }}
      >
        {/* Photo Section */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={user.photos[currentPhotoIndex]}
            alt={user.name}
            className="w-full h-full object-cover"
          />
          
          {/* Photo Navigation */}
          <div className="absolute top-4 left-4 right-4 flex space-x-1">
            {user.photos.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full flex-1 ${
                  index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Photo Navigation Areas */}
          <div className="absolute inset-0 flex">
            <div 
              className="w-1/2 h-full cursor-pointer" 
              onClick={handlePrevPhoto}
            />
            <div 
              className="w-1/2 h-full cursor-pointer" 
              onClick={handleNextPhoto}
            />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <span className="text-xl">{user.age}</span>
          </div>
          
          <p className="text-sm opacity-90 mb-2">{user.location}</p>
          
          {user.job && (
            <p className="text-sm opacity-90 mb-3">{user.job}</p>
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
      <div className="flex justify-center space-x-8 mt-6">
        <button
          onClick={handlePass}
          className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center hover:scale-110 transition-transform duration-200"
        >
          <span className="text-2xl">✕</span>
        </button>
        
        <button
          onClick={handleLike}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200"
        >
          <Heart className="h-8 w-8 text-white fill-current" />
        </button>
      </div>
    </div>
  );
};

export default SwipeCard;
