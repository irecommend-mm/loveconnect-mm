
import React from 'react';
import { Bell, MapPin, Heart, Calendar, Filter, Users } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  onNotificationsClick?: () => void;
  onEventsClick?: () => void;
  onFilterClick?: () => void;
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
    <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 safe-area-pt z-40">
      <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mr-3">
            <Heart className="h-5 w-5 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            {showLocation && location && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Discovery Filter Button - Show on discover and browse tabs */}
          {onFilterClick && (
            <button
              onClick={onFilterClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Virtual ChatRoom Button */}
          {onChatRoomClick && (
            <button
              onClick={onChatRoomClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Users className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Local Events Button */}
          {onEventsClick && (
            <button
              onClick={onEventsClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Calendar className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Notifications Button */}
          {onNotificationsClick && (
            <button
              onClick={onNotificationsClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
