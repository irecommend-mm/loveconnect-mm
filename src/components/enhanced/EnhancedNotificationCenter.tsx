import React, { useState, useEffect } from 'react';
import { Bell, X, Settings, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import ActivityFeed from '@/components/notifications/ActivityFeed';
import NotificationSettingsModal from './NotificationSettingsModal';

interface EnhancedNotificationCenterProps {
  onClose: () => void;
}

const EnhancedNotificationCenter = ({ onClose }: EnhancedNotificationCenterProps) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = usePushNotifications();
  
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => n.type === activeTab);
  };

  const getCategoryCount = (category: string) => {
    if (category === 'all') return notifications.length;
    return notifications.filter(n => n.type === category).length;
  };

  const getUnreadCountForCategory = (category: string) => {
    if (category === 'all') return unreadCount;
    return notifications.filter(n => n.type === category && !n.read).length;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary/80"
              >
                Mark all read
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all" className="text-xs">
                All
                {getUnreadCountForCategory('all') > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {getUnreadCountForCategory('all')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="match" className="text-xs">
                Matches
                {getUnreadCountForCategory('match') > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {getUnreadCountForCategory('match')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="like" className="text-xs">
                Likes
                {getUnreadCountForCategory('like') > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {getUnreadCountForCategory('like')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="message" className="text-xs">
                Messages
                {getUnreadCountForCategory('message') > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {getUnreadCountForCategory('message')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="safety" className="text-xs">
                Safety
                {getUnreadCountForCategory('safety') > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {getUnreadCountForCategory('safety')}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="all" className="p-6 h-full overflow-y-auto">
              <ActivityFeed />
            </TabsContent>
            
            <TabsContent value="match" className="p-6 h-full overflow-y-auto">
              <div className="space-y-4">
                {getFilteredNotifications().length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No match notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredNotifications().map((notification) => (
                      <div key={notification.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.createdAt.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="like" className="p-6 h-full overflow-y-auto">
              <div className="space-y-4">
                {getFilteredNotifications().length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No like notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredNotifications().map((notification) => (
                      <div key={notification.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.createdAt.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="message" className="p-6 h-full overflow-y-auto">
              <div className="space-y-4">
                {getFilteredNotifications().length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No message notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredNotifications().map((notification) => (
                      <div key={notification.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.createdAt.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="safety" className="p-6 h-full overflow-y-auto">
              <div className="space-y-4">
                {getFilteredNotifications().length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No safety notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredNotifications().map((notification) => (
                      <div key={notification.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.createdAt.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Notification Settings Modal */}
        {showSettings && (
          <NotificationSettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedNotificationCenter;