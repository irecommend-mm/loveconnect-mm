
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Heart, X } from 'lucide-react';
import { useCrossedPaths } from '@/hooks/useCrossedPaths';

interface CrossedPathsModalProps {
  open: boolean;
  onClose: () => void;
}

export const CrossedPathsModal = ({ open, onClose }: CrossedPathsModalProps) => {
  const { crossedPaths, loading } = useCrossedPaths();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-pink-500" />
            <span>Crossed Paths</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : crossedPaths.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No crossed paths yet</h3>
            <p className="text-gray-500">When you cross paths with other users, they'll appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {crossedPaths.map((crossedPath) => (
              <div key={crossedPath.id} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={crossedPath.user.photos[0] || '/placeholder.svg'}
                    alt={crossedPath.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{crossedPath.user.name}</h4>
                      <span className="text-sm text-gray-600">{crossedPath.user.age}</span>
                      {crossedPath.user.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{Math.round(crossedPath.averageDistance)}m away</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(crossedPath.lastCrossingTime)}</span>
                      </div>
                    </div>

                    {crossedPath.crossingCount > 1 && (
                      <div className="text-sm text-pink-600 font-medium mb-2">
                        Crossed paths {crossedPath.crossingCount} times
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{crossedPath.user.bio}</p>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                        <Heart className="h-4 w-4 mr-1" />
                        Like
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <X className="h-4 w-4 mr-1" />
                        Pass
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
