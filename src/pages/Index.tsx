
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SwipeCard from '../components/SwipeCard';
import ProfileModal from '../components/ProfileModal';
import ChatModal from '../components/ChatModal';
import MatchModal from '../components/MatchModal';
import { User } from '../types/User';
import { mockUsers } from '../data/mockUsers';

const Index = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [matches, setMatches] = useState<User[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser] = useState<User>({
    id: 'current-user',
    name: 'You',
    age: 25,
    bio: 'Your profile',
    photos: ['https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400'],
    interests: ['Travel', 'Photography', 'Hiking'],
    location: 'San Francisco, CA'
  });

  const handleSwipe = (direction: 'left' | 'right', user: User) => {
    if (direction === 'right') {
      // Simulate match (50% chance)
      if (Math.random() > 0.5) {
        setMatches([...matches, user]);
        setSelectedUser(user);
        setShowMatch(true);
      }
    }
    
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

  const currentSwipeUser = mockUsers[currentUserIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      <Navbar 
        onProfileClick={handleProfileClick}
        matches={matches}
        onChatClick={handleChatClick}
      />
      
      <div className="container mx-auto px-4 pt-20 pb-4">
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            {currentSwipeUser && (
              <SwipeCard 
                user={currentSwipeUser} 
                onSwipe={handleSwipe}
              />
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default Index;
