
import React from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuperLikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

const SuperLikeModal = ({ isOpen, onClose, onConfirm, userName }: SuperLikeModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Star className="h-10 w-10 text-white fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Super Like {userName}?</h2>
          <p className="text-gray-600 text-sm">
            They'll know you Super Liked them and you'll be more likely to match!
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white py-3 rounded-full font-medium"
          >
            <Star className="h-5 w-5 mr-2 fill-current" />
            Super Like
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full py-3 rounded-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuperLikeModal;
