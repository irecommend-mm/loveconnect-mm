
import React, { useState } from 'react';
import { X, MapPin, Calendar, Users, Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocalEventsModalProps {
  onClose: () => void;
}

const LocalEventsModal = ({ onClose }: LocalEventsModalProps) => {
  const [activeTab, setActiveTab] = useState('events');

  const mockEvents = [
    {
      id: '1',
      title: 'Singles Wine Tasting',
      date: '2024-01-15',
      time: '7:00 PM',
      location: 'Downtown Wine Bar',
      attendees: 12,
      maxAttendees: 20,
      type: 'social',
      image: '/placeholder.svg'
    },
    {
      id: '2',
      title: 'Hiking Group Meetup',
      date: '2024-01-16',
      time: '9:00 AM',
      location: 'Griffith Park',
      attendees: 8,
      maxAttendees: 15,
      type: 'active',
      image: '/placeholder.svg'
    },
    {
      id: '3',
      title: 'Coffee & Book Club',
      date: '2024-01-18',
      time: '6:30 PM',
      location: 'Central Coffee House',
      attendees: 6,
      maxAttendees: 12,
      type: 'casual',
      image: '/placeholder.svg'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Local Events & Meetups</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'events'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-500'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setActiveTab('myevents')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'myevents'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-500'
            }`}
          >
            My Events
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'events' && (
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <div key={event.id} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{event.date} at {event.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{event.attendees}/{event.maxAttendees} attending</span>
                        </div>
                      </div>
                      <Button className="mt-3 w-full bg-gradient-to-r from-pink-500 to-purple-500">
                        Join Event
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'myevents' && (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Yet</h3>
              <p className="text-gray-600">Join some local events to meet new people!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalEventsModal;
