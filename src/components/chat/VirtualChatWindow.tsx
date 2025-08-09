
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Heart, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ChatRoomParticipant {
  id: string;
  name: string;
  age: number;
  photos: string[];
  isOnline: boolean;
  roomType: 'friend' | 'date';
}

interface VirtualChatWindowProps {
  participant: ChatRoomParticipant;
  onClose: () => void;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

export const VirtualChatWindow = ({ participant, onClose, onBack }: VirtualChatWindowProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isMatched, setIsMatched] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowFeedback(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || showFeedback) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || 'current-user',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate response from other user
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: participant.id,
        senderName: participant.name,
        content: `Thanks for your message! I'm enjoying our chat.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    
    // Simulate checking if both users liked each other
    if (type === 'like') {
      // Simulate 50% chance of mutual like for demo
      const isMutualLike = Math.random() > 0.5;
      setTimeout(() => {
        setIsMatched(isMutualLike);
      }, 1000);
    }
  };

  const handleFinish = () => {
    if (isMatched) {
      // Navigate to regular chat interface or show match modal
      console.log('New match created!');
    }
    onClose();
  };

  if (showFeedback) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white">
          <CardHeader className="text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src={participant.photos[0]} alt={participant.name} />
              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">
              {isMatched ? '🎉 It\'s a Match!' : 'How was your chat?'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {isMatched ? (
              <div>
                <p className="text-green-600 font-medium mb-4">
                  You both liked each other! You can now continue chatting.
                </p>
                <Button 
                  onClick={handleFinish}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  Continue Chatting
                </Button>
              </div>
            ) : feedback ? (
              <div>
                <p className="text-gray-600 mb-4">
                  {feedback === 'like' 
                    ? 'Thanks for the feedback! We\'ll let you know if they liked you back.'
                    : 'Thanks for the feedback. Better luck next time!'
                  }
                </p>
                <Button onClick={handleFinish} variant="outline" className="w-full">
                  Back to Chat Rooms
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  Rate your chat experience with {participant.name}
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => handleFeedback('like')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button
                    onClick={() => handleFeedback('dislike')}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Pass
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col bg-white">
        {/* Header */}
        <CardHeader className="flex flex-row items-center space-y-0 pb-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-3 h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={participant.photos[0]} alt={participant.name} />
              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{participant.name}</h3>
              <p className="text-sm text-gray-600">{participant.age} years old</p>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-mono font-bold ${timeLeft <= 60 ? 'text-red-500' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-xs text-gray-500">remaining</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-3 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Heart className="h-8 w-8 mx-auto mb-2 text-pink-400" />
              <p>Start your conversation!</p>
              <p className="text-sm">You have {formatTime(timeLeft)} to chat.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  message.senderId === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={timeLeft === 0}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim() || timeLeft === 0}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {timeLeft <= 60 && timeLeft > 0 && (
            <p className="text-xs text-red-500 mt-2 text-center">
              ⏰ Chat will end in {timeLeft} seconds
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
