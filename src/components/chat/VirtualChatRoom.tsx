
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, Heart, HeartOff, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { User as UserType } from '@/types/User';
import { VirtualChatWindow } from './VirtualChatWindow';

interface VirtualChatRoomProps {
  onClose: () => void;
}

interface ChatRoomParticipant {
  id: string;
  name: string;
  age: number;
  photos: string[];
  isOnline: boolean;
  roomType: 'friend' | 'date';
}

export const VirtualChatRoom = ({ onClose }: VirtualChatRoomProps) => {
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState<'friend' | 'date'>('friend');
  const [selectedParticipant, setSelectedParticipant] = useState<ChatRoomParticipant | null>(null);
  const [participants, setParticipants] = useState<ChatRoomParticipant[]>([]);

  // Mock participants data - in real app, fetch from API
  useEffect(() => {
    const mockParticipants: ChatRoomParticipant[] = [
      {
        id: '1',
        name: 'Emma',
        age: 25,
        photos: ['/placeholder.svg'],
        isOnline: true,
        roomType: 'friend'
      },
      {
        id: '2',
        name: 'James',
        age: 28,
        photos: ['/placeholder.svg'],
        isOnline: true,
        roomType: 'date'
      },
      {
        id: '3',
        name: 'Sarah',
        age: 26,
        photos: ['/placeholder.svg'],
        isOnline: false,
        roomType: 'friend'
      },
      {
        id: '4',
        name: 'Mike',
        age: 30,
        photos: ['/placeholder.svg'],
        isOnline: true,
        roomType: 'date'
      }
    ];
    setParticipants(mockParticipants);
  }, []);

  const filteredParticipants = participants.filter(p => p.roomType === activeRoom && p.isOnline);

  const handleStartChat = (participant: ChatRoomParticipant) => {
    setSelectedParticipant(participant);
  };

  const handleCloseChatWindow = () => {
    setSelectedParticipant(null);
  };

  if (selectedParticipant) {
    return (
      <VirtualChatWindow
        participant={selectedParticipant}
        onClose={handleCloseChatWindow}
        onBack={() => setSelectedParticipant(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="text-xl font-bold">Virtual Chat Rooms</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {/* Room Type Selector */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveRoom('friend')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeRoom === 'friend'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5 mx-auto mb-1" />
              Friend Room
            </button>
            <button
              onClick={() => setActiveRoom('date')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeRoom === 'date'
                  ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className="h-5 w-5 mx-auto mb-1" />
              Date Room
            </button>
          </div>

          {/* Participants Grid */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No one online right now
                </h3>
                <p className="text-gray-500">
                  Check back later or try the other room
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredParticipants.map((participant) => (
                  <Card key={participant.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={participant.photos[0]} alt={participant.name} />
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{participant.name}</h4>
                          <p className="text-sm text-gray-600">{participant.age} years old</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartChat(participant)}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        size="sm"
                      >
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Room Info */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {filteredParticipants.length} people online in {activeRoom} room
              </span>
              <Badge variant="secondary" className="text-xs">
                5 min chat limit
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Chat for 5 minutes, then rate each other. Mutual likes become matches!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
