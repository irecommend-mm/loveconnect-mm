import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Clock, X, Heart, Share2, Globe, Lock, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GroupEvent, EventAttendee } from '@/types/GroupEvent';

interface LocalEventsProps {
  onClose: () => void;
}

const LocalEvents = ({ onClose }: LocalEventsProps) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-events' | 'joined'>('browse');
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'local' as 'local' | 'virtual',
    location: '',
    event_date: '',
    max_attendees: 10,
    is_public: true
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
        .select(`*`);

      if (activeTab === 'my-events') {
        baseQuery = baseQuery.eq('creator_id', user.id);
      } else if (activeTab === 'joined') {
        const { data: attendeeData } = await supabase
          .from('event_attendees')
          .select('event_id')
          .eq('user_id', user.id)
          .in('status', ['joined', 'accepted']);
        
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
        const eventsWithDetails = await Promise.all(
          (eventsData || []).map(async (event) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', event.creator_id)
              .single();

            const { data: photoData } = await supabase
              .from('photos')
              .select('url')
              .eq('user_id', event.creator_id)
              .eq('is_primary', true)
              .single();

            const { data: attendeesData } = await supabase
              .from('event_attendees')
              .select('*')
              .eq('event_id', event.id);

            const joinedCount = attendeesData?.filter(a => a.status === 'joined' || a.status === 'accepted').length || 0;

            const typedAttendees: EventAttendee[] = (attendeesData || []).map(attendee => ({
              ...attendee,
              status: attendee.status as EventAttendee['status']
            }));

            return {
              ...event,
              event_type: (event.event_type === 'local' || event.event_type === 'virtual') 
                ? event.event_type as 'local' | 'virtual'
                : 'group' as 'group',
              creator_name: profileData?.name || 'Unknown',
              creator_photo: photoData?.url || '',
              current_attendees: joinedCount,
              attendees: typedAttendees,
              is_public: event.is_public ?? true
            } as GroupEvent;
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
          max_attendees: newEvent.max_attendees,
          is_public: newEvent.is_public
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
          event_type: 'local',
          location: '',
          event_date: '',
          max_attendees: 10,
          is_public: true
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
          status: 'pending'
        });

      if (error) {
        console.error('Error joining event:', error);
      } else {
        const event = events.find(e => e.id === eventId);
        if (event && event.creator_id !== user.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: event.creator_id,
              type: 'event_request',
              title: 'New Event Request',
              message: `Someone requested to join your event "${event.title}"`,
              data: { event_id: eventId }
            });
        }
        
        loadEvents();
      }
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const handleJoinRequest = async (eventId: string, userId: string, action: 'accept' | 'deny') => {
    if (!user) return;

    try {
      if (action === 'accept') {
        const { error } = await supabase
          .from('event_attendees')
          .update({ status: 'accepted' })
          .eq('event_id', eventId)
          .eq('user_id', userId);

        if (error) throw error;

        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'event_accepted',
            title: 'Event Request Accepted',
            message: 'Your event request has been accepted!',
            data: { event_id: eventId }
          });
      } else {
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);

        if (error) throw error;
      }

      loadEvents();
    } catch (error) {
      console.error('Error handling join request:', error);
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

  const toggleEventVisibility = async (eventId: string, isPublic: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_events')
        .update({ is_public: !isPublic })
        .eq('id', eventId)
        .eq('creator_id', user.id);

      if (error) {
        console.error('Error updating event visibility:', error);
      } else {
        loadEvents();
      }
    } catch (error) {
      console.error('Error updating event visibility:', error);
    }
  };

  const getUserStatus = (event: GroupEvent) => {
    if (!user) return null;
    const attendee = event.attendees?.find(a => a.user_id === user.id);
    return attendee?.status || null;
  };

  const getPendingRequests = (event: GroupEvent) => {
    return event.attendees?.filter(a => a.status === 'pending') || [];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Local Events & Meetups
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Event
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
                        onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value as 'local' | 'virtual'})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="local">Local Meetup</option>
                        <option value="virtual">Virtual Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Attendees
                      </label>
                      <Input
                        type="number"
                        min="1"
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
                      placeholder={newEvent.event_type === 'virtual' ? 'Video call link' : 'Event location'}
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

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={newEvent.is_public}
                      onChange={(e) => setNewEvent({...newEvent, is_public: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                      Make this event public
                    </label>
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
                events.map((event) => {
                  const userStatus = getUserStatus(event);
                  const pendingRequests = getPendingRequests(event);
                  const isEventType = (event.event_type === 'local' || event.event_type === 'virtual');
                  const eventTypeLabel = isEventType ? event.event_type : 'group';
                  const isEventFull = event.current_attendees >= event.max_attendees;
                  const isPublic = event.is_public ?? true;
                  
                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {event.title}
                              </h3>
                              <Badge variant={eventTypeLabel === 'local' ? 'default' : 'secondary'}>
                                {eventTypeLabel === 'local' ? '📍 Local' : '💻 Virtual'}
                              </Badge>
                              {!isPublic && (
                                <Badge variant="outline">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Private
                                </Badge>
                              )}
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
                              <div className="flex flex-col space-y-2">
                                <Badge variant="outline">Your Event</Badge>
                                <Button
                                  onClick={() => toggleEventVisibility(event.id, isPublic)}
                                  variant="outline"
                                  size="sm"
                                >
                                  {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                </Button>
                                {pendingRequests.length > 0 && (
                                  <Badge variant="secondary">{pendingRequests.length} pending</Badge>
                                )}
                              </div>
                            ) : userStatus === 'pending' ? (
                              <Badge variant="outline">Request Sent</Badge>
                            ) : userStatus === 'accepted' || userStatus === 'joined' ? (
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
                                disabled={isEventFull}
                              >
                                {isEventFull ? 'Full' : 'Request to Join'}
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {event.creator_id === user?.id && pendingRequests.length > 0 && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Pending Requests</h4>
                            <div className="space-y-2">
                              {pendingRequests.map((attendee) => (
                                <div key={attendee.id} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">User request</span>
                                  <div className="space-x-2">
                                    <Button
                                      onClick={() => handleJoinRequest(event.id, attendee.user_id, 'accept')}
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600"
                                    >
                                      <UserCheck className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      onClick={() => handleJoinRequest(event.id, attendee.user_id, 'deny')}
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600"
                                    >
                                      <UserX className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
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
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalEvents;
