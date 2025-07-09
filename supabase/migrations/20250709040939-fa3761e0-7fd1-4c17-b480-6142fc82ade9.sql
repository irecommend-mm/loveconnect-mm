
-- Drop functions first
DROP FUNCTION IF EXISTS public.cleanup_expired_stories();
DROP FUNCTION IF EXISTS public.reset_daily_swipe_limits();

-- Drop all RLS policies before dropping tables
DROP POLICY IF EXISTS "Users can complete challenges" ON public.user_challenge_completions;
DROP POLICY IF EXISTS "Users can view their challenge completions" ON public.user_challenge_completions;
DROP POLICY IF EXISTS "Users can view active challenges" ON public.daily_challenges;
DROP POLICY IF EXISTS "System can create achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view their achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can manage their blocks" ON public.blocked_users;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can view conversation starters for their matches" ON public.conversation_starters;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.video_messages;
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.video_messages;
DROP POLICY IF EXISTS "Users can create story views" ON public.story_views;
DROP POLICY IF EXISTS "Users can view story views for their stories" ON public.story_views;
DROP POLICY IF EXISTS "Users can manage own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can view active stories" ON public.stories;
DROP POLICY IF EXISTS "Users can manage own video profiles" ON public.video_profiles;
DROP POLICY IF EXISTS "Users can view approved video profiles" ON public.video_profiles;

-- Drop tables in reverse order (considering foreign key dependencies)
DROP TABLE IF EXISTS public.user_challenge_completions;
DROP TABLE IF EXISTS public.daily_challenges;
DROP TABLE IF EXISTS public.user_achievements;
DROP TABLE IF EXISTS public.blocked_users;
DROP TABLE IF EXISTS public.user_reports;
DROP TABLE IF EXISTS public.conversation_starters;
DROP TABLE IF EXISTS public.video_messages;
DROP TABLE IF EXISTS public.story_views;
DROP TABLE IF EXISTS public.stories;
DROP TABLE IF EXISTS public.video_profiles;

-- Remove columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS video_intro_url;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS video_count;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS verification_video_url;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_video_verified;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS premium_tier;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS daily_swipes_used;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS daily_swipes_reset_date;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS boost_active_until;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS incognito_mode;
