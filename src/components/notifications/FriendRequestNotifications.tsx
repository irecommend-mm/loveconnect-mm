import React from 'react';
import { UserPlus, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFriendRequests } from '@/hooks/useFriendRequests';

const FriendRequestNotifications = () => {
  const { friendRequests, loading, respondToFriendRequest } = useFriendRequests();

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const hoursLeft = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    if (hoursLeft === 0) return 'Expired';
    if (hoursLeft < 24) return `${hoursLeft}h left`;
    return `${Math.ceil(hoursLeft / 24)}d left`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (friendRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-1">No friend requests</h3>
        <p className="text-muted-foreground">
          When someone sends you a friend request, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Friend Requests</h2>
        <Badge variant="secondary">{friendRequests.length} pending</Badge>
      </div>

      <div className="space-y-3">
        {friendRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {request.requester?.photos && request.requester.photos.length > 0 ? (
                    <img
                      src={request.requester.photos[0]}
                      alt={request.requester.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div>
                    <CardTitle className="text-lg">
                      {request.requester?.name}, {request.requester?.age}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeRemaining(request.created_at)}</span>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {request.message && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm italic">"{request.message}"</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => respondToFriendRequest(request.id, 'accepted')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  onClick={() => respondToFriendRequest(request.id, 'rejected')}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FriendRequestNotifications;