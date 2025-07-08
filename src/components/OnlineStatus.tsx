
import React from 'react';
import { Circle } from 'lucide-react';

interface OnlineStatusProps {
  isOnline: boolean;
  lastActive?: Date;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const OnlineStatus = ({ isOnline, lastActive, size = 'md', showText = false }: OnlineStatusProps) => {
  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return 'More than a week ago';
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (isOnline) {
    return (
      <div className="flex items-center space-x-1">
        <div className={`${sizeClasses[size]} bg-green-500 rounded-full border-2 border-white relative`}>
          <div className={`absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75`} />
        </div>
        {showText && (
          <span className={`text-green-600 font-medium ${textSizeClasses[size]}`}>
            Online
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <div className={`${sizeClasses[size]} bg-gray-400 rounded-full border-2 border-white`} />
      {showText && lastActive && (
        <span className={`text-gray-500 ${textSizeClasses[size]}`}>
          {formatLastActive(lastActive)}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;
