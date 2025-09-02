
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft, Video } from 'lucide-react';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useAuth } from '@/hooks/useAuth';
import ReadReceipts from './ReadReceipts';
import OnlineStatus from './OnlineStatus';

interface ChatUser {
  id: string;
  name: string;
  photos: string[];
}

interface ChatInterfaceProps {
  matchId: string;
  otherUser: ChatUser;
  onBack: () => void;
  onVideoCall: () => void;
}

const ChatInterface = ({ matchId, otherUser, onBack, onVideoCall }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useRealtimeMessages(matchId);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageToSend = newMessage.trim();
    setNewMessage('');
    
    try {
      await sendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setNewMessage(messageToSend);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, msgs]) => ({
      date: new Date(date),
      messages: msgs,
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="mr-3"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={otherUser.photos[0]} alt={otherUser.name} />
          <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{otherUser.name}</h2>
          <OnlineStatus isOnline={otherUserOnline} showText size="sm" />
        </div>
        <Button
          onClick={onVideoCall}
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <Video className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messageGroups.map(({ date, messages: dayMessages }) => (
            <div key={date.toDateString()}>
              <div className="text-center mb-4">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDate(date)}
                </span>
              </div>
              
              {dayMessages.map((message, index) => {
                const isOwn = message.senderId === user?.id;
                const showAvatar = !isOwn && (
                  index === 0 || 
                  dayMessages[index - 1]?.senderId !== message.senderId
                );

                return (
                  <div key={message.id}>
                    <div
                      className={`flex items-end space-x-2 ${
                        isOwn ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isOwn && (
                        <Avatar className={`h-8 w-8 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                          <AvatarImage src={otherUser.photos[0]} alt={otherUser.name} />
                          <AvatarFallback className="text-xs">{otherUser.name[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-white/70' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Read Receipts for own messages */}
                    {isOwn && (
                      <div className="flex justify-end mt-1 mr-2">
                        <ReadReceipts
                          messageStatus={message.read ? 'read' : 'delivered'}
                          timestamp={formatTime(message.timestamp)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 text-sm text-gray-500 italic">
          {otherUser.name} is typing...
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex items-center p-4 border-t space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={loading}
        />
        <Button
          type="submit"
          size="sm"
          disabled={loading || !newMessage.trim()}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
