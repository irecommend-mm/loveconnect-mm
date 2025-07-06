
import React from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface SuperLikeButtonProps {
  onSuperLike: () => void;
  disabled?: boolean;
}

const SuperLikeButton = ({ onSuperLike, disabled = false }: SuperLikeButtonProps) => {
  return (
    <Button
      onClick={onSuperLike}
      disabled={disabled}
      className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-lg"
    >
      <Star className="h-6 w-6 text-white fill-current" />
    </Button>
  );
};

export default SuperLikeButton;
