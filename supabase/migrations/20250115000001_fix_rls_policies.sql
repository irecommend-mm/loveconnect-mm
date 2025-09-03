-- Fix infinite recursion in RLS policies for profiles table
-- This migration addresses the critical issue causing 500 errors

-- First, disable RLS temporarily to stop the recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "profiles_select_policy" ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy" ON public.profiles 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "profiles_delete_policy" ON public.profiles 
  FOR DELETE USING (auth.uid() = user_id);

-- Photos policies
CREATE POLICY "photos_select_policy" ON public.photos 
  FOR SELECT USING (true);

CREATE POLICY "photos_insert_policy" ON public.photos 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "photos_update_policy" ON public.photos 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "photos_delete_policy" ON public.photos 
  FOR DELETE USING (auth.uid() = user_id);

-- Interests policies
CREATE POLICY "interests_select_policy" ON public.interests 
  FOR SELECT USING (true);

CREATE POLICY "interests_insert_policy" ON public.interests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "interests_update_policy" ON public.interests 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "interests_delete_policy" ON public.interests 
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure other tables have working policies
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Swipes policies
DROP POLICY IF EXISTS "Users can view own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can insert own swipes" ON public.swipes;

CREATE POLICY "swipes_select_policy" ON public.swipes 
  FOR SELECT USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);

CREATE POLICY "swipes_insert_policy" ON public.swipes 
  FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Matches policies
DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
DROP POLICY IF EXISTS "System can create matches" ON public.matches;

CREATE POLICY "matches_select_policy" ON public.matches 
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "matches_insert_policy" ON public.matches 
  FOR INSERT WITH CHECK (true);

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.messages;

CREATE POLICY "messages_select_policy" ON public.messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_policy" ON public.messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Add comment explaining the fix
COMMENT ON TABLE public.profiles IS 'RLS policies fixed to prevent infinite recursion - 2025-01-15';
