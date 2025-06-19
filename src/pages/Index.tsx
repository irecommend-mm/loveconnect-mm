
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SwipeCard from '../components/SwipeCard';
import ProfileModal from '../components/ProfileModal';
import ChatModal from '../components/ChatModal';
import MatchModal from '../components/MatchModal';
import SettingsModal from '../components/SettingsModal';
import NotificationToast from '../components/NotificationToast';
import MatchesList from '../components/MatchesList';
import { User, Match, SwipeAction, UserSettings } from '../types/User';
import { mockUsers } from '../data/mockUsers';

const Index = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<SwipeAction[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'match' | 'message' | 'like' | 'super_like';
    title: string;
    message: string;
    avatar?: string;
  }>>([]);
  
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      matches: true,
      messages: true,
      likes: true
    },
    privacy: {
      showAge: true,
      showDistance: true,
      incognito: false
    },
    discovery: {
      ageRange: [22, 35],
      maxDistance: 25,
      showMe: 'everyone',
      relationshipType: 'serious'
    }
  });

  const [currentUser] = useState<User>({
    id: 'current-user',
    name: 'Alex',
    age: 28,
    bio: 'Adventure seeker and coffee enthusiast ☕ Love exploring new places and meeting interesting people. Let\'s create some amazing memories together!',
    photos: ['https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400'],
    interests: ['Travel', 'Photography', 'Hiking', 'Coffee', 'Music', 'Art'],
    location: 'San Francisco, CA',
    job: 'Product Designer',
    education: 'Stanford University',
    height: '5\'10"',
    relationshipType: 'serious',
    verified: true,
    lastActive: new Date()
  });

  const addNotification = (type: 'match' | 'message' | 'like' | 'super_like', title: string, message: string, avatar?: string) => {
    if (!settings.notifications[type === 'super_like' ? 'likes' : type]) return;
    
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      avatar
    };
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSwipe = (direction: 'left' | 'right' | 'super', user: User) => {
    const action: SwipeAction = {
      id: Date.now().toString(),
      userId: currentUser.id,
      targetUserId: user.id,
      action: direction === 'left' ? 'dislike' : direction === 'super' ? 'super_like' : 'like',
      timestamp: new Date()
    };
    
    setSwipeHistory([...swipeHistory, action]);

    if (direction === 'right' || direction === 'super') {
      // Simulate match (60% chance for regular like, 80% for super like)
      const matchChance = direction === 'super' ? 0.8 : 0.6;
      if (Math.random() < matchChance) {
        const newMatch: Match = {
          id: Date.now().toString(),
          users: [currentUser.id, user.id],
          timestamp: new Date(),
          isActive: true
        };
        setMatches(prev => [...prev, newMatch]);
        setSelectedUser(user);
        setShowMatch(true);
        
        addNotification('match', 'New Match!', `You and ${user.name} liked each other`, user.photos[0]);
      } else if (direction === 'super') {
        addNotification('super_like', 'Super Like Sent!', `You super liked ${user.name}`, user.photos[0]);
      }
    }
    
    // Move to next user
    if (currentUserIndex < mockUsers.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    } else {
      setCurrentUserIndex(0); // Reset to beginning
    }
  };

  const handleProfileClick = () => {
    setSelectedUser(currentUser);
    setShowProfile(true);
  };

  const handleChatClick = (user: User) => {
    setSelectedUser(user);
    setShowChat(true);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleMatchesClick = () => {
    setShowMatches(true);
  };

  const handleShowProfile = (user: User) => {
    setSelectedUser(user);
    setShowProfile(true);
  };

  const getFilteredUsers = () => {
    return mockUsers.filter(user => {
      // Filter by age range
      if (user.age < settings.discovery.ageRange[0] || user.age > settings.discovery.ageRange[1]) {
        return false;
      }
      
      // Filter by relationship type if specified
      if (settings.discovery.relationshipType && user.relationshipType !== settings.discovery.relationshipType) {
        return false;
      }
      
      // Don't show users we've already swiped on
      if (swipeHistory.some(action => action.targetUserId === user.id)) {
        return false;
      }
      
      return true;
    });
  };

  const filteredUsers = getFilteredUsers();
  const currentSwipeUser = filteredUsers[currentUserIndex % filteredUsers.length];

  // Simulate receiving messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (matches.length > 0 && Math.random() < 0.1) { // 10% chance every 10 seconds
        const randomMatch = matches[Math.floor(Math.random() * matches.length)];
        const matchedUser = mockUsers.find(u => 
          randomMatch.users.includes(u.id) && u.id !== currentUser.id
        );
        
        if (matchedUser) {
          addNotification('message', 'New Message', `${matchedUser.name} sent you a message`, matchedUser.photos[0]);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [matches]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <Navbar 
        onProfileClick={handleProfileClick}
        matches={mockUsers.filter(u => matches.some(m => m.users.includes(u.id)))}
        onChatClick={handleChatClick}
        onSettingsClick={handleSettingsClick}
        onMatchesClick={handleMatchesClick}
      />
      
      <div className="container mx-auto px-4 pt-20 pb-4">
        {showMatches ? (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowMatches(false)}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                ← Back to Discovery
              </button>
            </div>
            <MatchesList
              matches={matches}
              users={mockUsers}
              onChatClick={handleChatClick}
              currentUserId={currentUser.id}
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              {currentSwipeUser ? (
                <SwipeCard 
                  user={currentSwipeUser} 
                  onSwipe={handleSwipe}
                  onShowProfile={handleShowProfile}
                />
              ) : (
                <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    No more profiles to show
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You've seen everyone in your area! Try adjusting your discovery settings.
                  </p>
                  <button
                    onClick={handleSettingsClick}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
                  >
                    Adjust Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProfile && selectedUser && (
        <ProfileModal 
          user={selectedUser}
          onClose={() => setShowProfile(false)}
          isCurrentUser={selectedUser.id === currentUser.id}
        />
      )}

      {showChat && selectedUser && (
        <ChatModal 
          user={selectedUser}
          onClose={() => setShowChat(false)}
        />
      )}

      {showMatch && selectedUser && (
        <MatchModal 
          user={selectedUser}
          onClose={() => setShowMatch(false)}
          onChat={() => {
            setShowMatch(false);
            setShowChat(true);
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      )}

      {/* Notifications */}
      <div className="fixed top-20 right-4 space-y-2 z-40">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            avatar={notification.avatar}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;
