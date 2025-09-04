import React, { useState } from 'react';
import { X, Bell, BellOff, Heart, MessageCircle, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  category: 'matches' | 'messages' | 'activity' | 'safety';
}

const NotificationSettingsModal = ({ isOpen, onClose }: NotificationSettingsModalProps) => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    // Matches & Connections
    {
      id: 'new_matches',
      title: 'New Matches',
      description: 'When you get a new match',
      icon: <Heart className="h-4 w-4 text-pink-500" />,
      enabled: true,
      category: 'matches'
    },
    {
      id: 'super_likes',
      title: 'Super Likes',
      description: 'When someone super likes you',
      icon: <Heart className="h-4 w-4 text-yellow-500 fill-current" />,
      enabled: true,
      category: 'matches'
    },
    {
      id: 'likes_received',
      title: 'Likes Received',
      description: 'When someone likes your profile',
      icon: <Heart className="h-4 w-4 text-red-500" />,
      enabled: false,
      category: 'matches'
    },
    
    // Messages
    {
      id: 'new_messages',
      title: 'New Messages',
      description: 'When you receive a new message',
      icon: <MessageCircle className="h-4 w-4 text-green-500" />,
      enabled: true,
      category: 'messages'
    },
    {
      id: 'message_requests',
      title: 'Message Requests',
      description: 'When someone wants to start a conversation',
      icon: <MessageCircle className="h-4 w-4 text-blue-500" />,
      enabled: true,
      category: 'messages'
    },
    
    // Activity
    {
      id: 'profile_views',
      title: 'Profile Views',
      description: 'When someone views your profile',
      icon: <Users className="h-4 w-4 text-purple-500" />,
      enabled: false,
      category: 'activity'
    },
    {
      id: 'story_interactions',
      title: 'Story Interactions',
      description: 'When someone interacts with your story',
      icon: <Bell className="h-4 w-4 text-orange-500" />,
      enabled: true,
      category: 'activity'
    },
    
    // Safety
    {
      id: 'safety_alerts',
      title: 'Safety Alerts',
      description: 'Important safety and security updates',
      icon: <Shield className="h-4 w-4 text-red-600" />,
      enabled: true,
      category: 'safety'
    }
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id 
        ? { ...setting, enabled: !setting.enabled }
        : setting
    ));
  };

  const getSettingsByCategory = (category: NotificationSetting['category']) => {
    return settings.filter(setting => setting.category === category);
  };

  const getCategoryTitle = (category: NotificationSetting['category']) => {
    switch (category) {
      case 'matches': return 'Matches & Connections';
      case 'messages': return 'Messages';
      case 'activity': return 'Activity';
      case 'safety': return 'Safety & Security';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Notification Settings</h2>
            <p className="text-sm text-muted-foreground">Choose what notifications you want to receive</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Matches & Connections */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {getCategoryTitle('matches')}
            </h3>
            <div className="space-y-4">
              {getSettingsByCategory('matches').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {setting.icon}
                    <div className="flex-1">
                      <Label htmlFor={setting.id} className="text-sm font-medium cursor-pointer">
                        {setting.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={setting.id}
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Messages */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {getCategoryTitle('messages')}
            </h3>
            <div className="space-y-4">
              {getSettingsByCategory('messages').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {setting.icon}
                    <div className="flex-1">
                      <Label htmlFor={setting.id} className="text-sm font-medium cursor-pointer">
                        {setting.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={setting.id}
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Activity */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {getCategoryTitle('activity')}
            </h3>
            <div className="space-y-4">
              {getSettingsByCategory('activity').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {setting.icon}
                    <div className="flex-1">
                      <Label htmlFor={setting.id} className="text-sm font-medium cursor-pointer">
                        {setting.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={setting.id}
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Safety */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {getCategoryTitle('safety')}
            </h3>
            <div className="space-y-4">
              {getSettingsByCategory('safety').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {setting.icon}
                    <div className="flex-1">
                      <Label htmlFor={setting.id} className="text-sm font-medium cursor-pointer">
                        {setting.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={setting.id}
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                    disabled={setting.category === 'safety'} // Safety notifications should always be enabled
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button 
            onClick={onClose}
            className="w-full"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;