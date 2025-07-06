import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Clock, X, Heart, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GroupEvent {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  event_type: 'group' | 'individual';
  location: string;
  event_date: string;
  max_attendees: number;
  current_attendees: number;
  created_at: string;
  creator_name?: string;
  creator_photo?: string;
  attendees?: EventAttendee[];
}

interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: 'joined' | 'interested' | 'declined';
  joined_at: string;
  user_name?: string;
  user_photo?: string;
}

interface GroupEventsProps {
  onClose: () => void;
}

const GroupEvents = ({ onClose }: GroupEventsProps) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-events' | 'joined'>('browse');
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'group' as 'group' | 'individual',
    location: '',
    event_date: '',
    max_attendees: 10
  });

  useEffect(() => {
    loadEvents();
  }, [activeTab]);

  const loadEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let baseQuery = supabase
        .from('group_events')
        .select(`
          *
        `);

      if (activeTab === 'my-events') {
        baseQuery = baseQuery.eq('creator_id', user.id);
      } else if (activeTab === 'joined') {
        // First get event IDs where user has joined
        const { data: attendeeData } = await supabase
          .from('event_attendees')
          .select('event_id')
          .eq('user_id', user.id)
          .eq('status', 'joined');
        
        const eventIds = attendeeData?.map(a => a.event_id) || [];
        if (eventIds.length === 0) {
          setEvents([]);
          setLoading(false);
          return;
        }
        
        baseQuery = baseQuery.in('id', eventIds);
      }

      const { data: eventsData, error } = await baseQuery
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } else {
        // Load additional data for each event
        const eventsWithDetails = await Promise.all(
          (eventsData || []).map(async (event) => {
            // Load creator profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', event.creator_id)
              .single();

            // Load creator photo
            const { data: photoData } = await supabase
              .from('photos')
              .select('url')
              .eq('user_id', event.creator_id)
              .eq('is_primary', true)
              .single();

            // Load attendees
            const { data: attendeesData } = await supabase
              .from('event_attendees')
              .select('*')
              .eq('event_id', event.id);

            // Count joined attendees
            const joinedCount = attendeesData?.filter(a => a.status === 'joined').length || 0;

            // Cast attendees to proper type
            const typedAttendees: EventAttendee[] = (attendeesData || []).map(attendee => ({
              ...attendee,
              status: attendee.status as 'joined' | 'interested' | 'declined'
            }));

            return {
              ...event,
              event_type: event.event_type as 'group' | 'individual',
              creator_name: profileData?.name || 'Unknown',
              creator_photo: photoData?.url || '',
              current_attendees: joinedCount,
              attendees: typedAttendees
            };
          })
        );
        
        setEvents(eventsWithDetails);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_events')
        .insert({
          creator_id: user.id,
          title: newEvent.title,
          description: newEvent.description,
          event_type: newEvent.event_type,
          location: newEvent.location,
          event_date: newEvent.event_date,
          max_attendees: newEvent.max_attendees
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
      } else {
        setShowCreateForm(false);
        setNewEvent({
          title: '',
          description: '',
          event_type: 'group',
          location: '',
          event_date: '',
          max_attendees: 10
        });
        loadEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_attendees')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status: 'joined'
        });

      if (error) {
        console.error('Error joining event:', error);
      } else {
        // Create notification for event creator
        const event = events.find(e => e.id === eventId);
        if (event && event.creator_id !== user.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: event.creator_id,
              type: 'event_update',
              title: 'New Event Attendee',
              message: `Someone joined your event "${event.title}"`,
              data: { event_id: eventId }
            });
        }
        
        loadEvents();
      }
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving event:', error);
      } else {
        loadEvents();
      }
    } catch (error) {
      console.error('Error leaving event:', error);
    }
  };

  const isUserJoined = (event: GroupEvent) => {
    return event.attendees?.some(a => a.user_id === user?.id && a.status === 'joined') || false;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Group Events & Activities
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { id: 'browse', label: 'Browse Events' },
            { id: 'my-events', label: 'My Events' },
            { id: 'joined', label: 'Joined Events' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showCreateForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Event</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title
                    </label>
                    <Input
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="Describe your event..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type
                      </label>
                      <select
                        value={newEvent.event_type}
                        onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value as 'group' | 'individual'})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="group">Group Event</option>
                        <option value="individual">Individual Meetup</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Attendees
                      </label>
                      <Input
                        type="number"
                        min="2"
                        max="50"
                        value={newEvent.max_attendees}
                        onChange={(e) => setNewEvent({...newEvent, max_attendees: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <Input
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      placeholder="Event location"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                      Create Event
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No events found</p>
                </div>
              ) : (
                events.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {event.title}
                            </h3>
                            <Badge variant={event.event_type === 'group' ? 'default' : 'secondary'}>
                              {event.event_type === 'group' ? 'Group' : 'Individual'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          
                          <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(event.event_date).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>{event.current_attendees}/{event.max_attendees} attendees</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {event.creator_id === user?.id ? (
                            <Badge variant="outline">Your Event</Badge>
                          ) : isUserJoined(event) ? (
                            <Button
                              onClick={() => leaveEvent(event.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                            >
                              Leave Event
                            </Button>
                          ) : (
                            <Button
                              onClick={() => joinEvent(event.id)}
                              size="sm"
                              className="bg-pink-500 hover:bg-pink-600"
                              disabled={event.current_attendees >= event.max_attendees}
                            >
                              {event.current_attendees >= event.max_attendees ? 'Full' : 'Join Event'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-pink-600">
                              {event.creator_name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            Created by {event.creator_name}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Share2 className="h-4 w-4 text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Heart className="h-4 w-4 text-gray-500 hover:text-pink-500" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupEvents;
