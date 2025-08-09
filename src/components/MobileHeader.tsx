
import React from 'react';
import { Bell, Calendar, Filter, MapPin, Users } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  onNotificationsClick: () => void;
  onEventsClick: () => void;
  onFilterClick: () => void;
  onChatRoomClick?: () => void;
  showLocation?: boolean;
  location?: string;
}

const MobileHeader = ({ 
  title, 
  onNotificationsClick, 
  onEventsClick, 
  onFilterClick,
  onChatRoomClick,
  showLocation = false,
  location 
}: MobileHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 safe-area-pt">
      <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            {showLocation && location && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                {location}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onNotificationsClick}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>

          {onChatRoomClick && (
            <button
              onClick={onChatRoomClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Users className="h-5 w-5 text-gray-600" />
            </button>
          )}

          <button
            onClick={onEventsClick}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Calendar className="h-5 w-5 text-gray-600" />
          </button>

          <button
            onClick={onFilterClick}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Filter className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
