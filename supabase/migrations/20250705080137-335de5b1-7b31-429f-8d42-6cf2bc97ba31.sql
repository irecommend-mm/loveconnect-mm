
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('match', 'message', 'event_invite', 'event_update', 'like')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  data jsonb DEFAULT '{}'::jsonb
);

-- Create group_events table
CREATE TABLE public.group_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('group', 'individual')),
  location text NOT NULL,
  event_date timestamp with time zone NOT NULL,
  max_attendees integer NOT NULL DEFAULT 10,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create event_attendees table
CREATE TABLE public.event_attendees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.group_events ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL CHECK (status IN ('joined', 'interested', 'declined')),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for group_events
CREATE POLICY "Users can view all events" 
  ON public.group_events 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create events" 
  ON public.group_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own events" 
  ON public.group_events 
  FOR UPDATE 
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own events" 
  ON public.group_events 
  FOR DELETE 
  USING (auth.uid() = creator_id);

-- RLS policies for event_attendees
CREATE POLICY "Users can view event attendees" 
  ON public.event_attendees 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can join events" 
  ON public.event_attendees 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their attendance" 
  ON public.event_attendees 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave events" 
  ON public.event_attendees 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable real-time for notifications and events
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_attendees;
