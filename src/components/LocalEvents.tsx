
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Clock, X, Heart, Share2, Check, UserCheck, Eye, EyeOff, Trash2 } from 'lucide-react';
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
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  
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
    if (activeTab === 'my-events') {
      loadJoinRequests();
    }
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
      } else {
        // For browse tab, only show public events
        baseQuery = baseQuery.eq('is_public', true);
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

            const joinedCount = attendeesData?.filter(a => a.status === 'joined').length || 0;

            const typedAttendees: EventAttendee[] = (attendeesData || []).map(attendee => ({
              ...attendee,
              status: attendee.status as 'joined' | 'interested' | 'declined' | 'pending' | 'accepted'
            }));

            return {
              ...event,
              event_type: event.event_type as 'local' | 'virtual',
              creator_name: profileData?.name || 'Unknown',
              creator_photo: photoData?.url || '',
              current_attendees: joinedCount,
              attendees: typedAttendees,
              is_public: event.is_public ?? true
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

  const loadJoinRequests = async () => {
    if (!user) return;

    try {
      const { data: myEvents } = await supabase
        .from('group_events')
        .select('id')
        .eq('creator_id', user.id);

      const eventIds = myEvents?.map(e => e.id) || [];
      
      if (eventIds.length > 0) {
        const { data: requests } = await supabase
          .from('event_attendees')
          .select(`
            *,
            profiles:user_id (name)
          `)
          .in('event_id', eventIds)
          .eq('status', 'pending');

        setJoinRequests(requests || []);
      }
    } catch (error) {
      console.error('Error loading join requests:', error);
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

  const requestToJoin = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'pending'
        });

      if (error) {
        console.error('Error requesting to join event:', error);
      } else {
        const event = events.find(e => e.id === eventId);
        if (event && event.creator_id !== user.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: event.creator_id,
              type: 'event_join_request',
              title: 'New Join Request',
              message: `Someone wants to join your event "${event.title}"`,
              data: { event_id: eventId, requester_id: user.id }
            });
        }
        
        loadEvents();
      }
    } catch (error) {
      console.error('Error requesting to join event:', error);
    }
  };

  const handleJoinRequest = async (attendeeId: string, action: 'accepted' | 'declined') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_attendees')
        .update({ status: action })
        .eq('id', attendeeId);

      if (error) {
        console.error('Error handling join request:', error);
      } else {
        loadJoinRequests();
        loadEvents();
      }
    } catch (error) {
      console.error('Error handling join request:', error);
    }
  };

  const toggleEventVisibility = async (eventId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('group_events')
        .update({ is_public: !isPublic })
        .eq('id', eventId);

      if (error) {
        console.error('Error updating event visibility:', error);
      } else {
        loadEvents();
      }
    } catch (error) {
      console.error('Error updating event visibility:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('group_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
      } else {
        loadEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getUserStatus = (event: GroupEvent) => {
    const userAttendance = event.attendees?.find(a => a.user_id === user?.id);
    return userAttendance?.status || null;
  };

  const hasRequestedToJoin = (event: GroupEvent) => {
    return getUserStatus(event) === 'pending';
  };

  const isUserJoined = (event: GroupEvent) => {
    return getUserStatus(event) === 'accepted' || getUserStatus(event) === 'joined';
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
              Add New
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
              {tab.id === 'my-events' && joinRequests.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {joinRequests.length}
                </Badge>
              )}
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
                        <option value="local">Local Event</option>
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
                      placeholder={newEvent.event_type === 'local' ? 'Event location' : 'Virtual meeting link'}
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
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                      Make event public (others can see and join)
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
            <div className="space-y-6">
              {/* Join Requests Section for My Events */}
              {activeTab === 'my-events' && joinRequests.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-800">Pending Join Requests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {joinRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium">{request.profiles?.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-600">wants to join your event</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleJoinRequest(request.id, 'accepted')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleJoinRequest(request.id, 'declined')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Events List */}
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
                              <Badge variant={event.event_type === 'local' ? 'default' : 'secondary'}>
                                {event.event_type === 'local' ? 'Local' : 'Virtual'}
                              </Badge>
                              {!event.is_public && (
                                <Badge variant="outline" className="text-gray-500">
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
                          
                          <div className="text-right space-y-2">
                            {event.creator_id === user?.id ? (
                              <div className="space-y-2">
                                <Badge variant="outline">Your Event</Badge>
                                <div className="flex space-x-1">
                                  <Button
                                    onClick={() => toggleEventVisibility(event.id, event.is_public)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    {event.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    onClick={() => deleteEvent(event.id)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : hasRequestedToJoin(event) ? (
                              <Badge variant="outline" className="text-yellow-600">
                                Request Sent
                              </Badge>
                            ) : isUserJoined(event) ? (
                              <Badge className="bg-green-500">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Joined
                              </Badge>
                            ) : (
                              <Button
                                onClick={() => requestToJoin(event.id)}
                                size="sm"
                                className="bg-pink-500 hover:bg-pink-600"
                                disabled={event.current_attendees >= event.max_attendees}
                              >
                                {event.current_attendees >= event.max_attendees ? 'Full' : 'Request to Join'}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalEvents;
