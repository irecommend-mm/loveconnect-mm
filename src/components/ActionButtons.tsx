
import React from 'react';
import { X, Star, Heart, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const canRewind = !disabled && (isPremium || rewindCount < maxRewinds);

  return (
    <div className="flex items-center justify-center space-x-4 px-6 py-4 mt-8">
      {/* Rewind Button */}
      <Button
        onClick={onRewind}
        disabled={!canRewind}
        size="lg"
        className={`w-12 h-12 rounded-full transition-all duration-200 ${
          canRewind 
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:scale-110 active:scale-95' 
            : 'bg-gray-300 opacity-50 cursor-not-allowed'
        }`}
      >
        <RotateCcw className="h-5 w-5 text-white" />
      </Button>

      {/* Dislike Button */}
      <Button
        onClick={onDislike}
        size="lg"
        className="w-14 h-14 rounded-full bg-white shadow-xl border-2 border-gray-100 hover:scale-110 active:scale-95 transition-all duration-200 group hover:bg-gray-50"
      >
        <X className="h-6 w-6 text-gray-600 group-hover:text-red-500 transition-colors" />
      </Button>

      {/* Super Like Button */}
      <Button
        onClick={onSuperLike}
        size="lg"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <Star className="h-6 w-6 text-white fill-current" />
      </Button>

      {/* Like Button */}
      <Button
        onClick={onLike}
        size="lg"
        className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <Heart className="h-7 w-7 text-white fill-current" />
      </Button>
    </div>
  );
};

export default ActionButtons;
