
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Message } from '@/types/User';

export const useRealtimeMessages = (matchId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId || !user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          read: !!msg.read_at,
          type: 'text'
        }));
        setMessages(formattedMessages);
      }
      setLoading(false);
    };

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            content: payload.new.content,
            timestamp: new Date(payload.new.created_at),
            read: !!payload.new.read_at,
            type: 'text'
          };
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id 
              ? { ...msg, read: !!payload.new.read_at }
              : msg
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, user]);

  const sendMessage = async (content: string) => {
    if (!matchId || !user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content
      });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsRead
  };
};
