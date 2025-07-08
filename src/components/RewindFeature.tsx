
import React, { useState } from 'react';
import { RotateCcw, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface RewindFeatureProps {
  onRewind: () => void;
  rewindCount: number;
  maxRewinds: number;
  isPremium: boolean;
}

const RewindFeature = ({ onRewind, rewindCount, maxRewinds, isPremium }: RewindFeatureProps) => {
  const [isRewinding, setIsRewinding] = useState(false);

  const handleRewind = async () => {
    if (rewindCount >= maxRewinds && !isPremium) {
      toast({
        title: "No rewinds left",
        description: "Upgrade to Premium for unlimited rewinds!",
        variant: "destructive",
      });
      return;
    }

    setIsRewinding(true);
    
    // Animate the rewind
    setTimeout(() => {
      onRewind();
      setIsRewinding(false);
      toast({
        title: "Profile restored! ↶",
        description: "You can now swipe on this profile again",
      });
    }, 800);
  };

  const remainingRewinds = isPremium ? '∞' : Math.max(0, maxRewinds - rewindCount);

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={handleRewind}
        disabled={isRewinding || (rewindCount >= maxRewinds && !isPremium)}
        className={`relative overflow-hidden transition-all duration-300 ${
          isRewinding ? 'scale-110' : ''
        } ${
          isPremium 
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600' 
            : 'bg-gradient-to-r from-blue-400 to-purple-600 hover:from-blue-500 hover:to-purple-700'
        }`}
        size="sm"
      >
        <RotateCcw className={`h-4 w-4 mr-1 ${isRewinding ? 'animate-spin' : ''}`} />
        Rewind
        {isPremium && <Crown className="h-3 w-3 ml-1" />}
      </Button>
      
      <div className="text-xs text-gray-500 font-medium">
        {remainingRewinds} left
      </div>
    </div>
  );
};

export default RewindFeature;
