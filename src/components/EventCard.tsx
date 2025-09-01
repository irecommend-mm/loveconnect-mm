
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    event_type: string;
    location: string;
    event_date: string;
    max_attendees: number;
    creator_id: string;
    is_public: boolean;
  };
  currentAttendees: number;
  isJoined: boolean;
  creatorName?: string;
  onJoinStatusChange: () => void;
}

const eventTypeEmojis: { [key: string]: string } = {
  coffee: '☕',
  dinner: '🍽️',
  drinks: '🍸',
  activity: '🎯',
  outdoors: '🌲',
  culture: '🎭',
  sports: '⚽',
  networking: '🤝',
  creative: '🎨',
  music: '🎵',
};

const EventCard = ({ 
  event, 
  currentAttendees, 
  isJoined, 
  creatorName,
  onJoinStatusChange 
}: EventCardProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const handleJoinToggle = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (isJoined) {
        // Leave event
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Left Event",
          description: `You've left ${event.title}`,
        });
      } else {
        // Join event
        if (currentAttendees >= event.max_attendees) {
          toast({
            title: "Event Full",
            description: "This event has reached maximum capacity.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: event.id,
            user_id: user.id,
            status: 'confirmed',
          });

        if (error) throw error;

        toast({
          title: "Joined Event! 🎉",
          description: `You're now signed up for ${event.title}`,
        });
      }

      onJoinStatusChange();
    } catch (error) {
      console.error('Error toggling event attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update event attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isEventFull = currentAttendees >= event.max_attendees;
  const isEventPast = new Date(event.event_date) < new Date();
  const isCreator = user?.id === event.creator_id;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Event Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {eventTypeEmojis[event.event_type] || '📅'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 line-clamp-2">
                {event.title}
              </h3>
              {creatorName && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                  <User className="h-3 w-3" />
                  <span>by {creatorName}</span>
                </div>
              )}
            </div>
          </div>
          
          {isCreator && (
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Your Event
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4 text-pink-500" />
            <span className="text-sm font-medium">{formatDate(event.event_date)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4 text-pink-500" />
            <span className="text-sm">{event.location}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="h-4 w-4 text-pink-500" />
            <span className="text-sm">
              {currentAttendees}/{event.max_attendees} attending
            </span>
            {isEventFull && (
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                Full
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-gray-700 text-sm line-clamp-2 mb-4">
            {event.description}
          </p>
        )}

        {/* Attendees Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentAttendees / event.max_attendees) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex space-x-2">
          {!isEventPast && !isCreator && (
            <Button
              onClick={handleJoinToggle}
              disabled={loading || (!isJoined && isEventFull)}
              className={`flex-1 transition-all duration-200 ${
                isJoined
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
              }`}
            >
              {loading ? (
                "..."
              ) : isJoined ? (
                "Leave Event"
              ) : isEventFull ? (
                "Event Full"
              ) : (
                "Join Event"
              )}
            </Button>
          )}
          
          {isEventPast && (
            <div className="flex-1 text-center py-2 text-gray-500 text-sm">
              Event has ended
            </div>
          )}
          
          {isCreator && (
            <div className="flex-1 text-center py-2 text-blue-600 text-sm font-medium">
              Managing your event
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
