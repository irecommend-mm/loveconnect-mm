
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { LocationData } from '@/types/FriendDateTypes';

interface LocationBannerProps {
  location: LocationData | null;
  locationLoading: boolean;
  activeTab: string;
  onLocationEnable: () => void;
}

const LocationBanner = ({ location, locationLoading, activeTab, onLocationEnable }: LocationBannerProps) => {
  if (location || locationLoading || (activeTab !== 'discover' && activeTab !== 'browse')) {
    return null;
  }

  return (
    <div className="mx-2 sm:mx-4 mt-4 mb-4 bg-blue-50 border border-blue-200 rounded-2xl p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-blue-800 truncate">Enable location</p>
            <p className="text-xs text-blue-600 truncate">Find people near you</p>
          </div>
        </div>
        <Button 
          onClick={onLocationEnable} 
          size="sm" 
          className="bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ml-2 flex-shrink-0"
        >
          Enable
        </Button>
      </div>
    </div>
  );
};

export default LocationBanner;
