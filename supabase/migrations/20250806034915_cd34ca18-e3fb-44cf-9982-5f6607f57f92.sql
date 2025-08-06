
-- Add social media integration fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_username text,
ADD COLUMN IF NOT EXISTS spotify_connected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS spotify_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS voice_intro_url text,
ADD COLUMN IF NOT EXISTS facebook_id text,
ADD COLUMN IF NOT EXISTS social_verified boolean DEFAULT false;

-- Create table for user reports and blocks
CREATE TABLE IF NOT EXISTS public.user_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  UNIQUE(reporter_id, reported_id)
);

-- Create table for blocked users
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create table for mutual friends (when Facebook integration is added)
CREATE TABLE IF NOT EXISTS public.mutual_friends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mutual_friend_name text NOT NULL,
  facebook_friend_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutual_friends ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_reports
CREATE POLICY "Users can create reports" ON public.user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.user_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Create RLS policies for blocked_users
CREATE POLICY "Users can block others" ON public.blocked_users
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can view their blocks" ON public.blocked_users
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others" ON public.blocked_users
  FOR DELETE USING (auth.uid() = blocker_id);

-- Create RLS policies for mutual_friends
CREATE POLICY "Users can view mutual friends" ON public.mutual_friends
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Enable realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for matches table  
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(blocker_id uuid, blocked_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE blocker_id = $1 AND blocked_id = $2
  );
END;
$$;

-- Update messages RLS policy to exclude blocked users
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.messages;
CREATE POLICY "Users can view messages in their matches" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
      AND NOT is_user_blocked(auth.uid(), messages.sender_id)
      AND NOT is_user_blocked(messages.sender_id, auth.uid())
    )
  );
