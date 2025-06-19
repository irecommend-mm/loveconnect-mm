
import React, { useEffect } from 'react';
import { Heart, MessageCircle, Star, X } from 'lucide-react';

interface NotificationToastProps {
  type: 'match' | 'message' | 'like' | 'super_like';
  title: string;
  message: string;
  avatar?: string;
  onClose: () => void;
  duration?: number;
}

const NotificationToast = ({ 
  type, 
  title, 
  message, 
  avatar, 
  onClose, 
  duration = 5000 
}: NotificationToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'match':
        return <Heart className="h-5 w-5 text-pink-500 fill-current" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'like':
        return <Heart className="h-5 w-5 text-green-500" />;
      case 'super_like':
        return <Star className="h-5 w-5 text-blue-500 fill-current" />;
      default:
        return <Heart className="h-5 w-5 text-pink-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'match':
        return 'from-pink-500 to-purple-600';
      case 'message':
        return 'from-blue-500 to-indigo-600';
      case 'like':
        return 'from-green-500 to-emerald-600';
      case 'super_like':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-pink-500 to-purple-600';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-scale-in">
      <div className={`bg-gradient-to-r ${getBgColor()} text-white rounded-2xl shadow-lg p-4 max-w-sm w-full backdrop-blur-sm`}>
        <div className="flex items-start space-x-3">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
            />
          ) : (
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {getIcon()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{title}</h4>
            <p className="text-sm opacity-90 mt-1">{message}</p>
          </div>
          
          <button
            onClick={onClose}
            className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
