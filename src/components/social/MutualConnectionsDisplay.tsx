import React from 'react';
import { Users, Facebook } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface MutualConnection {
  name: string;
  profilePicture?: string;
  mutualFriendCount?: number;
}

interface MutualConnectionsDisplayProps {
  connections: MutualConnection[];
  platform?: 'facebook' | 'instagram' | 'linkedin';
  currentUserName?: string;
}

const MutualConnectionsDisplay = ({ 
  connections, 
  platform = 'facebook',
  currentUserName 
}: MutualConnectionsDisplayProps) => {
  if (connections.length === 0) {
    return null;
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram':
        return <div className="h-4 w-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />;
      case 'linkedin':
        return <div className="h-4 w-4 bg-blue-700 rounded" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      case 'linkedin': return 'LinkedIn';
      default: return 'Social';
    }
  };

  const displayConnections = connections.slice(0, 3); // Show max 3 connections
  const remainingCount = Math.max(0, connections.length - 3);

  return (
    <Card className="border border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          {getPlatformIcon()}
          <span className="text-sm font-medium text-foreground">
            Mutual {getPlatformName()} Friends
          </span>
          <Badge variant="secondary" className="text-xs">
            {connections.length}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {/* Friend Avatars */}
          <div className="flex -space-x-2">
            {displayConnections.map((connection, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold"
                title={connection.name}
              >
                {connection.profilePicture ? (
                  <img
                    src={connection.profilePicture}
                    alt={connection.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  connection.name.charAt(0).toUpperCase()
                )}
              </div>
            ))}
            
            {/* Remaining Count */}
            {remainingCount > 0 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                +{remainingCount}
              </div>
            )}
          </div>

          {/* Names */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-medium">
                {displayConnections[0]?.name}
              </span>
              {displayConnections.length > 1 && (
                <>
                  {displayConnections.length === 2 ? ' and ' : ', '}
                  <span className="font-medium">
                    {displayConnections[1]?.name}
                  </span>
                </>
              )}
              {displayConnections.length > 2 && (
                <>
                  , and <span className="font-medium">{displayConnections[2]?.name}</span>
                </>
              )}
              {remainingCount > 0 && (
                <span className="text-muted-foreground">
                  {remainingCount === 1 
                    ? ` and ${remainingCount} other`
                    : ` and ${remainingCount} others`
                  }
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Friends you both know on {getPlatformName()}
            </p>
          </div>
        </div>

        {/* Connection Strength Indicator */}
        {connections.length >= 5 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Connection Strength</span>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      className={`w-1.5 h-1.5 rounded-full ${
                        dot <= Math.min(5, Math.floor(connections.length / 2))
                          ? 'bg-blue-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-blue-600 font-medium ml-2">Strong</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MutualConnectionsDisplay;