
import React from 'react';
import { MessageCircle, Star } from 'lucide-react';
import { User as UserType, Match } from '../types/User';

interface MatchesListProps {
  matches: Match[];
  users: UserType[];
  onChatClick: (user: UserType) => void;
  currentUserId: string;
}

const MatchesList = ({ matches, users, onChatClick, currentUserId }: MatchesListProps) => {
  const getMatchedUser = (match: Match): UserType | null => {
    const otherUserId = match.users.find(id => id !== currentUserId);
    return users.find(user => user.id === otherUserId) || null;
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Active now';
    if (hours < 24) return `Active ${hours}h ago`;
    if (days === 1) return 'Active yesterday';
    return `Active ${days}d ago`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Matches</h2>
        <span className="text-sm text-gray-500">{matches.length} matches</span>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
          <p className="text-gray-500 text-sm">Start swiping to find your perfect match!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(match => {
            const user = getMatchedUser(match);
            if (!user) return null;

            return (
              <div
                key={match.id}
                onClick={() => onChatClick(user)}
                className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="relative">
                  <img
                    src={user.photos[0]}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {user.verified && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 fill-current text-white" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                    <span className="text-sm text-gray-500">{user.age}</span>
                  </div>
                  
                  {match.lastMessage ? (
                    <p className="text-sm text-gray-600 truncate">
                      {match.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-pink-600 font-medium">
                      Say hello! 👋
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {user.lastActive ? formatLastSeen(user.lastActive) : 'Recently active'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {!match.lastMessage && (
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  )}
                  <MessageCircle className="h-5 w-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchesList;
