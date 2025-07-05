
import React, { useState } from 'react';
import { Zap, X, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BoostModal = ({ isOpen, onClose }: BoostModalProps) => {
  const [isActivating, setIsActivating] = useState(false);

  if (!isOpen) return null;

  const handleActivateBoost = async () => {
    setIsActivating(true);
    
    // Simulate boost activation
    setTimeout(() => {
      toast({
        title: "🚀 Boost Activated!",
        description: "You'll be one of the top profiles in your area for the next 30 minutes!",
      });
      setIsActivating(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
            Boost Your Profile
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <p className="text-gray-600 mb-4">
            Be one of the top profiles in your area and get up to 10x more profile views!
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              <span>Up to 10x more profile views</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-purple-500" />
              <span>Boost lasts for 30 minutes</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleActivateBoost}
            disabled={isActivating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-full font-medium"
          >
            {isActivating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Activating...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Activate Boost
              </>
            )}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full py-3 rounded-full"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BoostModal;
