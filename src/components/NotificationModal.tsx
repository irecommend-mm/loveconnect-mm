
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, Heart, MessageCircle, Star } from 'lucide-react';

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

const NotificationModal = ({ open, onClose }: NotificationModalProps) => {
  const mockNotifications = [
    {
      id: 1,
      type: 'match',
      title: 'New Match!',
      message: 'You and Sarah liked each other',
      time: '2 minutes ago',
      icon: Heart,
      color: 'text-pink-500'
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'Emma sent you a message',
      time: '5 minutes ago',
      icon: MessageCircle,
      color: 'text-blue-500'
    },
    {
      id: 3,
      type: 'super_like',
      title: 'Super Like!',
      message: 'Someone super liked you',
      time: '1 hour ago',
      icon: Star,
      color: 'text-yellow-500'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {mockNotifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <IconComponent className={`w-5 h-5 mt-1 ${notification.color}`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{notification.title}</h3>
                  <p className="text-gray-600 text-sm">{notification.message}</p>
                  <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
