
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Clock, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

const eventTypes = [
  { value: 'coffee', label: 'Coffee Meetup', icon: '☕' },
  { value: 'dinner', label: 'Dinner', icon: '🍽️' },
  { value: 'drinks', label: 'Drinks', icon: '🍸' },
  { value: 'activity', label: 'Activity', icon: '🎯' },
  { value: 'outdoors', label: 'Outdoor Adventure', icon: '🌲' },
  { value: 'culture', label: 'Cultural Event', icon: '🎭' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'networking', label: 'Networking', icon: '🤝' },
  { value: 'creative', label: 'Creative Workshop', icon: '🎨' },
  { value: 'music', label: 'Music & Arts', icon: '🎵' },
];

const EventCreationModal = ({ isOpen, onClose, onEventCreated }: EventCreationModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    location: '',
    event_date: '',
    max_attendees: 8,
    is_public: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('group_events')
        .insert({
          ...formData,
          creator_id: user.id,
          event_date: new Date(formData.event_date).toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Event Created! 🎉",
        description: `Your ${formData.title} event has been created successfully.`,
      });

      onEventCreated();
      onClose();
      setFormData({
        title: '',
        description: '',
        event_type: '',
        location: '',
        event_date: '',
        max_attendees: 8,
        is_public: true,
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Coffee & Chat in Central Park"
              required
              className="w-full"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <Select 
              value={formData.event_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center space-x-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location *
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Starbucks, 123 Main St"
              required
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date & Time *
            </label>
            <Input
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
              min={getMinDateTime()}
              required
            />
          </div>

          {/* Max Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Max Attendees
            </label>
            <Select 
              value={formData.max_attendees.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, max_attendees: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 4, 6, 8, 10, 12, 15, 20].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} people
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell people what to expect..."
              rows={3}
            />
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_public" className="text-sm text-gray-700">
              Make this event public (visible to all users)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventCreationModal;
