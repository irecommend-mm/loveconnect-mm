
export interface EventAttendee {
  id: string;
  user_id: string;
  event_id: string;
  status: 'joined' | 'interested' | 'declined' | 'pending' | 'accepted';
  joined_at: string;
  user_name?: string;
  user_photo?: string;
}

export interface GroupEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'group' | 'individual' | 'local' | 'virtual';
  location: string;
  event_date: string;
  max_attendees: number;
  creator_id: string;
  creator_name: string;
  creator_photo: string;
  current_attendees: number;
  attendees: EventAttendee[];
  is_public?: boolean;
  created_at: string;
}
