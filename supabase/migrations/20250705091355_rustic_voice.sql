/*
  # Complete Database Setup for Love Connect

  This file contains all the necessary SQL to set up your new Supabase database
  with all required tables, policies, and configurations.

  Run this in your Supabase SQL Editor to create all tables at once.
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  name text NOT NULL,
  age integer NOT NULL,
  bio text,
  location text,
  job text,
  education text,
  height text,
  zodiac_sign text,
  relationship_type text CHECK (relationship_type IN ('serious', 'casual', 'friends', 'unsure')),
  children text CHECK (children IN ('have', 'want', 'dont_want', 'unsure')),
  smoking text CHECK (smoking IN ('yes', 'no', 'sometimes')),
  drinking text CHECK (drinking IN ('yes', 'no', 'sometimes')),
  exercise text CHECK (exercise IN ('often', 'sometimes', 'never')),
  verified boolean DEFAULT false,
  incognito boolean DEFAULT false,
  latitude numeric,
  longitude numeric,
  last_active timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  url text NOT NULL,
  is_primary boolean DEFAULT false,
  position integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create interests table
CREATE TABLE IF NOT EXISTS public.interests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  interest text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create swipes table
CREATE TABLE IF NOT EXISTS public.swipes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swiper_id uuid REFERENCES auth.users NOT NULL,
  swiped_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('like', 'dislike', 'super_like')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id uuid REFERENCES auth.users NOT NULL,
  user2_id uuid REFERENCES auth.users NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid REFERENCES public.matches ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
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
CREATE TABLE IF NOT EXISTS public.group_events (
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
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.group_events ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL CHECK (status IN ('joined', 'interested', 'declined')),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for photos
DROP POLICY IF EXISTS "Users can view all photos" ON public.photos;
DROP POLICY IF EXISTS "Users can manage own photos" ON public.photos;

CREATE POLICY "Users can view all photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Users can manage own photos" ON public.photos FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for interests
DROP POLICY IF EXISTS "Users can view all interests" ON public.interests;
DROP POLICY IF EXISTS "Users can manage own interests" ON public.interests;

CREATE POLICY "Users can view all interests" ON public.interests FOR SELECT USING (true);
CREATE POLICY "Users can manage own interests" ON public.interests FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for swipes
DROP POLICY IF EXISTS "Users can view own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can insert own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can delete own swipes" ON public.swipes;

CREATE POLICY "Users can view own swipes" ON public.swipes FOR SELECT USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);
CREATE POLICY "Users can insert own swipes" ON public.swipes FOR INSERT WITH CHECK (auth.uid() = swiper_id);
CREATE POLICY "Users can delete own swipes" ON public.swipes FOR DELETE USING (auth.uid() = swiper_id);

-- Create RLS policies for matches
DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
DROP POLICY IF EXISTS "System can create matches" ON public.matches;

CREATE POLICY "Users can view own matches" ON public.matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "System can create matches" ON public.matches FOR INSERT WITH CHECK (true);

-- Create RLS policies for messages
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;

CREATE POLICY "Users can view messages in their matches" ON public.messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages in their matches" ON public.messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );
CREATE POLICY "Users can update own messages" ON public.messages 
  FOR UPDATE USING (auth.uid() = sender_id);

-- Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for group_events
DROP POLICY IF EXISTS "Users can view all events" ON public.group_events;
DROP POLICY IF EXISTS "Users can create events" ON public.group_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.group_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.group_events;

CREATE POLICY "Users can view all events" ON public.group_events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON public.group_events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own events" ON public.group_events FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete their own events" ON public.group_events FOR DELETE USING (auth.uid() = creator_id);

-- Create RLS policies for event_attendees
DROP POLICY IF EXISTS "Users can view event attendees" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can join events" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can update their attendance" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can leave events" ON public.event_attendees;

CREATE POLICY "Users can view event attendees" ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON public.event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their attendance" ON public.event_attendees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave events" ON public.event_attendees FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile images
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

CREATE POLICY "Anyone can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Users can upload their own profile images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update their own profile images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete their own profile images" ON storage.objects FOR DELETE USING (
  bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for messages and matches
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD TABLE public.matches;
ALTER publication supabase_realtime ADD TABLE public.messages;
ALTER publication supabase_realtime ADD TABLE public.notifications;
ALTER publication supabase_realtime ADD TABLE public.group_events;
ALTER publication supabase_realtime ADD TABLE public.event_attendees;

-- Create a distance calculation function
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Insert demo user for testing
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'cbf3880f-be68-4f1e-b33a-2f8d429e5d0d',
  'authenticated',
  'authenticated',
  'demo@loveconnect.com',
  crypt('demo123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Create demo profile
INSERT INTO public.profiles (
  user_id,
  name,
  age,
  bio,
  location,
  job,
  education,
  height,
  zodiac_sign,
  relationship_type,
  children,
  smoking,
  drinking,
  exercise,
  verified,
  latitude,
  longitude
) VALUES (
  'cbf3880f-be68-4f1e-b33a-2f8d429e5d0d',
  'Demo User',
  28,
  'Welcome to Love Connect! This is a demo account to explore the app features.',
  'San Francisco, CA',
  'Software Developer',
  'University of California',
  '5''10"',
  'Gemini',
  'serious',
  'want',
  'no',
  'sometimes',
  'often',
  true,
  37.7749,
  -122.4194
) ON CONFLICT (user_id) DO NOTHING;

-- Add demo photos
INSERT INTO public.photos (user_id, url, is_primary, position) VALUES 
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, 0),
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', false, 1)
ON CONFLICT DO NOTHING;

-- Add demo interests
INSERT INTO public.interests (user_id, interest) VALUES 
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', 'Technology'),
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', 'Travel'),
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', 'Photography'),
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', 'Hiking'),
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', 'Coffee')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! You can now use the demo account: demo@loveconnect.com / demo123456' as message;