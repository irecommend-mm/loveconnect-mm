
import React from 'react';
import { Eye, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/types/User';

interface ProfileHeaderProps {
  currentUserProfile: UserType | null;
  onViewProfile: () => void;
}

export const ProfileHeader = ({ currentUserProfile, onViewProfile }: ProfileHeaderProps) => {
  if (!currentUserProfile) return null;

  return (
    <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-6 rounded-b-3xl">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 backdrop-blur-sm">
            <img
              src={currentUserProfile.photos[0] || '/placeholder.svg'}
              alt={currentUserProfile.name}
              className="w-full h-full object-cover"
            />
          </div>
          {currentUserProfile.verified && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
              <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
          )}
          <button className="absolute -top-1 -right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
            <Camera className="h-3 w-3 text-gray-700" />
          </button>
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{currentUserProfile.name}</h2>
          <p className="text-white/80 text-sm">{currentUserProfile.age} • {currentUserProfile.location}</p>
          <p className="text-white/70 text-xs mt-1">{currentUserProfile.bio?.slice(0, 60)}...</p>
        </div>
        
        <Button
          onClick={onViewProfile}
          size="sm"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </div>
    </div>
  );
};
