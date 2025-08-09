
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Mic, MicOff, MessageSquare, Heart, Coffee, X } from 'lucide-react';

interface VirtualChatRoomProps {
  isOpen: boolean;
  onClose: () => void;
}

const VirtualChatRoom = ({ isOpen, onClose }: VirtualChatRoomProps) => {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);

  const chatRooms = [
    {
      id: 'friends',
      name: 'Friend ChatRoom',
      icon: Coffee,
      description: 'Casual conversations and making new friends',
      participants: 24,
      color: 'from-blue-400 to-cyan-500',
      online: 8
    },
    {
      id: 'dating',
      name: 'Date ChatRoom',
      icon: Heart,
      description: 'Meet potential romantic connections',
      participants: 18,
      color: 'from-pink-400 to-rose-500',
      online: 12
    }
  ];

  const mockParticipants = [
    { id: '1', name: 'Sarah', photo: '/placeholder.svg', speaking: true },
    { id: '2', name: 'Mike', photo: '/placeholder.svg', speaking: false },
    { id: '3', name: 'Emma', photo: '/placeholder.svg', speaking: false },
    { id: '4', name: 'Alex', photo: '/placeholder.svg', speaking: false },
  ];

  const enterRoom = (roomId: string) => {
    setActiveRoom(roomId);
  };

  const leaveRoom = () => {
    setActiveRoom(null);
    setIsMicOn(false);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Virtual ChatRooms</span>
          </DialogTitle>
        </DialogHeader>

        {!activeRoom ? (
          /* Room Selection */
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Join voice and text chat rooms to meet people from anywhere in the world!
            </p>

            {chatRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                <div className={`h-2 bg-gradient-to-r ${room.color}`}></div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${room.color} rounded-xl flex items-center justify-center`}>
                        <room.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{room.name}</h3>
                        <p className="text-xs text-gray-600">{room.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{room.participants} members</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>{room.online} online</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => enterRoom(room.id)}
                      size="sm"
                      className={`bg-gradient-to-r ${room.color} text-white hover:opacity-90`}
                    >
                      Join Room
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Active Room View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-700">Connected</Badge>
                <span className="text-sm text-gray-600">
                  {chatRooms.find(r => r.id === activeRoom)?.name}
                </span>
              </div>
              <Button
                onClick={leaveRoom}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Participants Grid */}
            <div className="grid grid-cols-2 gap-3">
              {mockParticipants.map((participant) => (
                <Card key={participant.id} className={`p-3 ${participant.speaking ? 'ring-2 ring-green-500' : ''}`}>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={participant.photo} alt={participant.name} />
                        <AvatarFallback>{participant.name[0]}</AvatarFallback>
                      </Avatar>
                      {participant.speaking && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Mic className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-900">{participant.name}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Voice Controls */}
            <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Button
                onClick={toggleMic}
                variant={isMicOn ? "default" : "secondary"}
                size="sm"
                className={isMicOn ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {isMicOn ? "Mute" : "Unmute"}
              </Button>
              
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Text Chat
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VirtualChatRoom;
