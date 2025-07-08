
-- Add video support to profiles table
ALTER TABLE public.profiles 
ADD COLUMN video_intro_url TEXT,
ADD COLUMN video_count INTEGER DEFAULT 0,
ADD COLUMN verification_video_url TEXT,
ADD COLUMN is_video_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN premium_tier TEXT DEFAULT 'free' CHECK (premium_tier IN ('free', 'premium', 'plus')),
ADD COLUMN daily_swipes_used INTEGER DEFAULT 0,
ADD COLUMN daily_swipes_reset_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN boost_active_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN incognito_mode BOOLEAN DEFAULT FALSE;

-- Create video_profiles table for multiple videos per user
CREATE TABLE public.video_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL CHECK (video_type IN ('intro', 'prompt_response', 'lifestyle', 'talent')),
  prompt_question TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_flags JSONB DEFAULT '{}'::jsonb
);

-- Create stories table for 24-hour disappearing content
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create story_views table to track who viewed stories
CREATE TABLE public.story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Create video_messages table for video messaging
CREATE TABLE public.video_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'voice', 'video', 'duet')),
  content TEXT, -- For text messages
  media_url TEXT, -- For voice/video messages
  thumbnail_url TEXT, -- For video messages
  duration_seconds INTEGER, -- For voice/video messages
  reply_to_message_id UUID REFERENCES public.video_messages(id),
  is_disappearing BOOLEAN DEFAULT FALSE,
  disappears_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create conversation_starters table for AI-generated prompts
CREATE TABLE public.conversation_starters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  suggestion TEXT NOT NULL,
  based_on JSONB DEFAULT '{}'::jsonb, -- Store what it's based on (shared interests, etc.)
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_reports table for safety
CREATE TABLE public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users NOT NULL,
  reported_user_id UUID REFERENCES auth.users NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('inappropriate_content', 'harassment', 'spam', 'fake_profile', 'other')),
  description TEXT,
  evidence_urls TEXT[], -- Array of URLs for screenshots/videos
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT
);

-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID REFERENCES auth.users NOT NULL,
  blocked_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create user_achievements table for gamification
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('first_match', 'video_verified', 'streak_3', 'streak_7', 'popular_profile', 'conversation_starter')),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Create daily_challenges table
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('video_prompt', 'story_post', 'conversation_starter')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt_question TEXT,
  reward_type TEXT DEFAULT 'badge',
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(challenge_date, challenge_type)
);

-- Create user_challenge_completions table
CREATE TABLE public.user_challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submission_url TEXT, -- URL to video/content submitted for challenge
  UNIQUE(user_id, challenge_id)
);

-- Add RLS policies for video_profiles
ALTER TABLE public.video_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approved video profiles" 
  ON public.video_profiles 
  FOR SELECT 
  USING (moderation_status = 'approved');

CREATE POLICY "Users can manage own video profiles" 
  ON public.video_profiles 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add RLS policies for stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active stories" 
  ON public.stories 
  FOR SELECT 
  USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can manage own stories" 
  ON public.stories 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add RLS policies for story_views
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view story views for their stories" 
  ON public.story_views 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = story_views.story_id 
    AND stories.user_id = auth.uid()
  ));

CREATE POLICY "Users can create story views" 
  ON public.story_views 
  FOR INSERT 
  WITH CHECK (auth.uid() = viewer_id);

-- Add RLS policies for video_messages
ALTER TABLE public.video_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their matches" 
  ON public.video_messages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = video_messages.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  ));

CREATE POLICY "Users can send messages in their matches" 
  ON public.video_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = video_messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Add RLS policies for other tables
ALTER TABLE public.conversation_starters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_completions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for the new tables
CREATE POLICY "Users can view conversation starters for their matches" 
  ON public.conversation_starters 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = conversation_starters.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  ));

CREATE POLICY "Users can create reports" 
  ON public.user_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" 
  ON public.user_reports 
  FOR SELECT 
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can manage their blocks" 
  ON public.blocked_users 
  FOR ALL 
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can view their achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" 
  ON public.user_achievements 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view active challenges" 
  ON public.daily_challenges 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can view their challenge completions" 
  ON public.user_challenge_completions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can complete challenges" 
  ON public.user_challenge_completions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to clean up expired stories
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
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

-- Create function to reset daily swipe limits
CREATE OR REPLACE FUNCTION public.reset_daily_swipe_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET daily_swipes_used = 0, daily_swipes_reset_date = CURRENT_DATE
  WHERE daily_swipes_reset_date < CURRENT_DATE;
END;
$$;
