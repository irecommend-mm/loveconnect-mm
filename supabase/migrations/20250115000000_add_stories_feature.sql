-- Add Stories Feature
-- This migration creates the necessary tables for the stories functionality

-- Stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '48 hours'),
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  super_like_count INTEGER DEFAULT 0,
  friend_request_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Story media (images/videos)
CREATE TABLE public.story_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Story interactions
CREATE TABLE public.story_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'super_like', 'friend_request')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'ignored')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id, interaction_type)
);

-- Friend requests table (if not exists)
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'ignored')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_is_active ON public.stories(is_active);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at);

CREATE INDEX IF NOT EXISTS idx_story_media_story_id ON public.story_media(story_id);
CREATE INDEX IF NOT EXISTS idx_story_media_position ON public.story_media(position);

CREATE INDEX IF NOT EXISTS idx_story_interactions_story_id ON public.story_interactions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_interactions_user_id ON public.story_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_story_interactions_type ON public.story_interactions(interaction_type);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stories
CREATE POLICY "Users can view all active stories" ON public.stories
  FOR SELECT USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can create their own stories" ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" ON public.stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" ON public.stories
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for story media
CREATE POLICY "Users can view story media" ON public.story_media
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own story media" ON public.story_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE stories.id = story_media.story_id 
      AND stories.user_id = auth.uid()
    )
  );

-- Create RLS policies for story interactions
CREATE POLICY "Users can view story interactions" ON public.story_interactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create story interactions" ON public.story_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story interactions" ON public.story_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for friend requests
CREATE POLICY "Users can view their own friend requests" ON public.friend_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create friend requests" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friend requests they're involved in" ON public.friend_requests
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Create function to automatically expire stories
CREATE OR REPLACE FUNCTION expire_old_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.stories 
  SET is_active = false 
  WHERE expires_at <= now() AND is_active = true;
END;
$$;

-- Create a cron job to run this function every hour (if you have pg_cron extension)
-- SELECT cron.schedule('expire-stories', '0 * * * *', 'SELECT expire_old_stories();');

-- Enable realtime for stories
ALTER TABLE public.stories REPLICA IDENTITY FULL;
ALTER TABLE public.story_interactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_interactions;

