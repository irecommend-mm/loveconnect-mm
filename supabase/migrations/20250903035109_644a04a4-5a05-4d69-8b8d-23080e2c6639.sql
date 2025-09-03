-- CRITICAL SECURITY FIXES FOR USER DATA PROTECTION
-- Fix publicly accessible user data by implementing proper RLS policies

-- 1. DROP OVERLY PERMISSIVE POLICIES AND CREATE SECURE ONES

-- Fix profiles table - remove public access and add proper authentication
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view profiles when authenticated" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Users can always see their own profile
    auth.uid() = user_id 
    -- Or they can see profiles that are not in incognito mode
    OR incognito = false
    -- Add geographic filtering (within reasonable distance)
    OR (
      latitude IS NOT NULL 
      AND longitude IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
        AND public.calculate_distance(p.latitude, p.longitude, profiles.latitude, profiles.longitude) <= 100
      )
    )
  )
);

-- Fix photos table - remove public access
DROP POLICY IF EXISTS "Users can view all photos" ON public.photos;

CREATE POLICY "Users can view photos when authenticated" 
ON public.photos 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Users can always see their own photos
    auth.uid() = user_id
    -- Or photos of users whose profiles they can see
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = photos.user_id 
      AND (
        p.incognito = false 
        OR (
          p.latitude IS NOT NULL 
          AND p.longitude IS NOT NULL 
          AND EXISTS (
            SELECT 1 FROM public.profiles user_profile 
            WHERE user_profile.user_id = auth.uid() 
            AND user_profile.latitude IS NOT NULL 
            AND user_profile.longitude IS NOT NULL
            AND public.calculate_distance(user_profile.latitude, user_profile.longitude, p.latitude, p.longitude) <= 100
          )
        )
      )
    )
  )
);

-- Fix interests table - remove public access
DROP POLICY IF EXISTS "Users can view all interests" ON public.interests;

CREATE POLICY "Users can view interests when authenticated" 
ON public.interests 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Users can see their own interests
    auth.uid() = user_id
    -- Or interests of users they have matched with
    OR EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE (m.user1_id = auth.uid() AND m.user2_id = interests.user_id)
      OR (m.user2_id = auth.uid() AND m.user1_id = interests.user_id)
    )
    -- Or interests of users whose profiles they can see (geographic proximity)
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = interests.user_id 
      AND p.incognito = false
      AND p.latitude IS NOT NULL 
      AND p.longitude IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.profiles user_profile 
        WHERE user_profile.user_id = auth.uid() 
        AND user_profile.latitude IS NOT NULL 
        AND user_profile.longitude IS NOT NULL
        AND public.calculate_distance(user_profile.latitude, user_profile.longitude, p.latitude, p.longitude) <= 50
      )
    )
  )
);

-- 2. SECURE EVENT ACCESS
DROP POLICY IF EXISTS "Users can view all events" ON public.group_events;

CREATE POLICY "Users can view events when authenticated" 
ON public.group_events 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Users can see their own events
    auth.uid() = creator_id
    -- Or public events
    OR is_public = true
  )
);

-- 3. SECURE EVENT ATTENDEES
DROP POLICY IF EXISTS "Users can view event attendees" ON public.event_attendees;

CREATE POLICY "Users can view event attendees when authenticated" 
ON public.event_attendees 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Users can see their own attendance
    auth.uid() = user_id
    -- Or attendees of events they created or joined
    OR EXISTS (
      SELECT 1 FROM public.group_events ge 
      WHERE ge.id = event_attendees.event_id 
      AND (
        ge.creator_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.event_attendees ea 
          WHERE ea.event_id = ge.id AND ea.user_id = auth.uid()
        )
      )
    )
  )
);

-- 4. ADD PRIVACY CONTROLS TO PROFILES TABLE
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_level text DEFAULT 'normal' 
CHECK (privacy_level IN ('private', 'normal', 'public'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_distance boolean DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_last_active boolean DEFAULT true;