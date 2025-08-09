
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventsModalProps {
  open: boolean;
  onClose: () => void;
}

const EventsModal = ({ open, onClose }: EventsModalProps) => {
  const mockEvents = [
    {
      id: 1,
      title: 'Coffee Meetup',
      location: 'Central Park Cafe',
      date: '2024-02-15',
      time: '2:00 PM',
      attendees: 8,
      maxAttendees: 12
    },
    {
      id: 2,
      title: 'Art Gallery Walk',
      location: 'Downtown Gallery',
      date: '2024-02-16',
      time: '6:00 PM',
      attendees: 15,
      maxAttendees: 20
    },
    {
      id: 3,
      title: 'Hiking Adventure',
      location: 'Mountain Trail',
      date: '2024-02-17',
      time: '9:00 AM',
      attendees: 6,
      maxAttendees: 10
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Local Events & Meetups
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {mockEvents.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span>{event.date} at {event.time}</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees}/{event.maxAttendees}</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" size="sm">
                Join Event
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventsModal;
