-- CRITICAL SECURITY FIXES - Remove all existing overly permissive policies first
-- Then create secure authentication-based policies

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles when authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all photos" ON public.photos;
DROP POLICY IF EXISTS "Users can view photos when authenticated" ON public.photos;
DROP POLICY IF EXISTS "Users can view all interests" ON public.interests;
DROP POLICY IF EXISTS "Users can view interests when authenticated" ON public.interests;
DROP POLICY IF EXISTS "Users can view all events" ON public.group_events;
DROP POLICY IF EXISTS "Users can view events when authenticated" ON public.group_events;
DROP POLICY IF EXISTS "Users can view event attendees" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can view event attendees when authenticated" ON public.event_attendees;

-- 1. SECURE PROFILES - Only authenticated users can see profiles with proper restrictions
CREATE POLICY "Authenticated users can view profiles with restrictions" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid() = user_id  -- Own profile
    OR (incognito = false AND privacy_level != 'private')  -- Non-incognito, non-private profiles
  )
);

-- 2. SECURE PHOTOS - Only authenticated users can see photos with same restrictions as profiles
CREATE POLICY "Authenticated users can view photos with restrictions" 
ON public.photos 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid() = user_id  -- Own photos
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = photos.user_id 
      AND p.incognito = false
      AND COALESCE(p.privacy_level, 'normal') != 'private'
    )
  )
);

-- 3. SECURE INTERESTS - Only for matched users or own interests
CREATE POLICY "Authenticated users can view interests selectively" 
ON public.interests 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid() = user_id  -- Own interests
    OR EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE (m.user1_id = auth.uid() AND m.user2_id = interests.user_id)
      OR (m.user2_id = auth.uid() AND m.user1_id = interests.user_id)
    )
  )
);

-- 4. SECURE EVENTS - Only authenticated users can see public events or their own
CREATE POLICY "Authenticated users can view public events" 
ON public.group_events 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid() = creator_id
    OR is_public = true
  )
);

-- 5. SECURE EVENT ATTENDEES - Only for event participants
CREATE POLICY "Event participants can view attendees" 
ON public.event_attendees 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.group_events ge 
      WHERE ge.id = event_attendees.event_id 
      AND ge.creator_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.event_attendees ea 
      WHERE ea.event_id = event_attendees.event_id 
      AND ea.user_id = auth.uid()
    )
  )
);

-- 6. ADD PRIVACY COLUMNS IF NOT EXISTS
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_level text DEFAULT 'normal' 
CHECK (privacy_level IN ('private', 'normal', 'public'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_distance boolean DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_last_active boolean DEFAULT true;

-- 7. UPDATE DATABASE FUNCTIONS FOR SECURITY
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    R decimal := 6371;
    dLat decimal;
    dLon decimal;
    a decimal;
    c decimal;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    a := sin(dLat/2) * sin(dLat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2) * sin(dLon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN R * c;
END;
$$;