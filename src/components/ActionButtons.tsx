
import React from 'react';
import { X, Star, Heart, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RewindFeature from './RewindFeature';

interface ActionButtonsProps {
  onDislike: () => void;
  onSuperLike: () => void;
  onLike: () => void;
  onRewind: () => void;
  rewindCount?: number;
  maxRewinds?: number;
  isPremium?: boolean;
  disabled?: boolean;
}

const ActionButtons = ({
  onDislike,
  onSuperLike,
  onLike,
  onRewind,
  rewindCount = 0,
  maxRewinds = 3,
  isPremium = false,
  disabled = false
}: ActionButtonsProps) => {
  return (
    <div className="flex items-center justify-center space-x-4 px-6 py-4">
      {/* Rewind Button */}
      <RewindFeature
        onRewind={onRewind}
        rewindCount={rewindCount}
        maxRewinds={maxRewinds}
        isPremium={isPremium}
      />

      {/* Dislike Button */}
      <Button
        onClick={onDislike}
        disabled={disabled}
        size="lg"
        variant="outline"
        className="w-14 h-14 rounded-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
      >
        <X className="h-6 w-6 text-gray-600 hover:text-red-500" />
      </Button>

      {/* Super Like Button */}
      <Button
        onClick={onSuperLike}
        disabled={disabled}
        size="lg"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-200"
      >
        <Star className="h-6 w-6 text-white fill-current" />
      </Button>

      {/* Like Button */}
      <Button
        onClick={onLike}
        disabled={disabled}
        size="lg"
        className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all duration-200 shadow-lg"
      >
        <Heart className="h-7 w-7 text-white fill-current" />
      </Button>
    </div>
  );
};

export default ActionButtons;
