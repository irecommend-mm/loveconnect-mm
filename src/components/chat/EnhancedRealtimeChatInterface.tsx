
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Phone, Video, Image, Smile, Paperclip, MoreVertical } from 'lucide-react';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useAuth } from '@/hooks/useAuth';
import { SafetyMenu } from '../safety/SafetyMenu';

interface EnhancedRealtimeChatInterfaceProps {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    photos: string[];
  };
}

export const EnhancedRealtimeChatInterface = ({ matchId, otherUser }: EnhancedRealtimeChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useRealtimeMessages(matchId);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    setIsTyping(true);
    await sendMessage(newMessage);
    setNewMessage('');
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle image upload logic here
      console.log('File selected:', file);
    }
  };

  const handleVideoCall = () => {
    // Video call logic
    console.log('Starting video call...');
  };

  const handleVoiceCall = () => {
    // Voice call logic
    console.log('Starting voice call...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Enhanced Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={otherUser.photos[0] || '/placeholder.svg'}
              alt={otherUser.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceCall}
            className="rounded-full w-10 h-10 hover:bg-pink-100"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVideoCall}
            className="rounded-full w-10 h-10 hover:bg-purple-100"
          >
            <Video className="h-4 w-4" />
          </Button>
          <SafetyMenu userId={otherUser.id} userName={otherUser.name} />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-pink-500" />
            </div>
            <p className="text-gray-500">Start your conversation!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                message.senderId === user?.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md'
                  : 'bg-white text-gray-900 border rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === user?.id ? 'text-pink-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {message.read && message.senderId === user?.id && (
                  <span className="ml-1">✓</span>
                )}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-md shadow-sm border">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImageUpload}
            className="rounded-full w-10 h-10 hover:bg-gray-100"
          >
            <Image className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12 rounded-full border-gray-200 focus:border-pink-300 focus:ring-pink-200"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim() || isTyping}
            className="rounded-full w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
