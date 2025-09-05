
import React, { useState, useRef, useEffect } from 'react';
import { User as UserType } from '../types/User';
import EnhancedSwipeCard from './EnhancedSwipeCard';
import SuperLikeButton from './SuperLikeButton';
import RewindFeature from './RewindFeature';
import BoostProfile from './BoostProfile';
import MatchModal from './MatchModal';
import { Button } from '@/components/ui/button';
import { RotateCcw, X, Heart, Star } from 'lucide-react';
import { useAdvancedMatching } from '@/hooks/useAdvancedMatching';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SwipeStackProps {
  users: UserType[];
  onLike: (user: UserType) => void;
  onDislike: (user: UserType) => void;
  onSuperLike: (user: UserType) => void;
  showRewind?: boolean;
  showBoost?: boolean;
  onRewind?: () => void;
  onBoost?: () => void;
  currentUserProfile?: UserType | null;
}

const SwipeStack = ({ 
  users, 
  onLike, 
  onDislike, 
  onSuperLike, 
  showRewind = true, 
  showBoost = true, 
  onRewind, 
  onBoost,
  currentUserProfile 
}: SwipeStackProps) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Show all users for testing - remove the filter that hides swiped users
  const availableUsers = users;

  const currentUser = availableUsers[currentIndex];

  const handleSwipe = async (direction: 'left' | 'right' | 'up', user: UserType) => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (direction === 'right') {
        await onLike(user);
        // Check for match
        const { data: existingSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', user.id)
          .eq('swiped_id', user?.id)
          .eq('action', 'like')
          .single();

        if (existingSwipe) {
          // It's a match!
          setMatchedUser(user);
          setShowMatch(true);
        }
      } else if (direction === 'left') {
        await onDislike(user);
      } else if (direction === 'up') {
        await onSuperLike(user);
      }

      // Move to next card
      if (currentIndex < availableUsers.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (error) {
      console.error('Error handling swipe:', error);
      toast({
        title: "Error",
        description: "Unable to process swipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAction = (action: 'like' | 'dislike' | 'superlike') => {
    if (!currentUser) return;
    
    switch (action) {
      case 'like':
        handleSwipe('right', currentUser);
        break;
      case 'dislike':
        handleSwipe('left', currentUser);
        break;
      case 'superlike':
        handleSwipe('up', currentUser);
        break;
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
          <Heart className="h-12 w-12 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">You've seen everyone!</h2>
        <p className="text-gray-600 mb-6 max-w-sm">
          Check back later for new profiles or expand your search filters.
        </p>
        <Button onClick={() => setCurrentIndex(0)} className="bg-gradient-to-r from-pink-500 to-purple-600">
          <RotateCcw className="h-4 w-4 mr-2" />
          Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Cards Stack */}
      <div className="relative w-full max-w-sm h-[600px] mb-6">
        {availableUsers.slice(currentIndex, Math.min(currentIndex + 3, availableUsers.length)).map((user, index) => (
          <div
            key={user.id}
            ref={(el) => cardRefs.current[currentIndex + index] = el}
            className="absolute inset-0"
            style={{
              zIndex: 3 - index,
              transform: `scale(${1 - index * 0.05}) translateY(${index * 4}px)`,
              opacity: 1 - index * 0.2,
            }}
          >
            <EnhancedSwipeCard
              user={user}
              mode="date"
              onSwipe={(direction) => index === 0 && handleSwipe(direction as "left" | "right" | "up", user)}
              onShowProfile={() => {}}
              onShowDetails={() => {}}
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        {showRewind && (
          <RewindFeature 
            onRewind={onRewind || (() => {})} 
            rewindCount={0}
            maxRewinds={3}
            isPremium={false}
          />
        )}
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleManualAction('dislike')}
          disabled={isLoading}
          className="rounded-full w-14 h-14 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50"
        >
          <X className="h-6 w-6 text-gray-600 hover:text-red-500" />
        </Button>

        <SuperLikeButton
          onSuperLike={() => handleManualAction('superlike')}
          disabled={isLoading}
        />

        <Button
          variant="outline"
          size="lg"
          onClick={() => handleManualAction('like')}
          disabled={isLoading}
          className="rounded-full w-14 h-14 border-2 border-green-300 hover:border-green-500 hover:bg-green-50"
        >
          <Heart className="h-6 w-6 text-green-500" fill="currentColor" />
        </Button>

        {showBoost && (
          <BoostProfile 
            onBoost={onBoost || (() => {})}
            isOpen={false}
            onClose={() => {}}
          />
        )}
      </div>

      {/* Match Modal */}
      {showMatch && matchedUser && (
        <MatchModal
          user={matchedUser}
          onClose={() => {
            setShowMatch(false);
            setMatchedUser(null);
          }}
          onChat={() => {
            setShowMatch(false);
            setMatchedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default SwipeStack;
