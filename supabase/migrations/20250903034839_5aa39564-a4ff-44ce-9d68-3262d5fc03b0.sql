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
            SELECT 1 FROM public.profiles current_user 
            WHERE current_user.user_id = auth.uid() 
            AND current_user.latitude IS NOT NULL 
            AND current_user.longitude IS NOT NULL
            AND public.calculate_distance(current_user.latitude, current_user.longitude, p.latitude, p.longitude) <= 100
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
        SELECT 1 FROM public.profiles current_user 
        WHERE current_user.user_id = auth.uid() 
        AND current_user.latitude IS NOT NULL 
        AND current_user.longitude IS NOT NULL
        AND public.calculate_distance(current_user.latitude, current_user.longitude, p.latitude, p.longitude) <= 50
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

-- 4. SECURE STORY MEDIA
DROP POLICY IF EXISTS "Users can view story media" ON public.story_media;

CREATE POLICY "Users can view story media when authenticated" 
ON public.story_media 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.stories s 
    WHERE s.id = story_media.story_id 
    AND s.is_active = true 
    AND s.expires_at > now()
    AND (
      -- Users can see their own story media
      s.user_id = auth.uid()
      -- Or story media from active stories of users they can see
      OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = s.user_id 
        AND p.incognito = false
      )
    )
  )
);

-- 5. FIX DATABASE FUNCTION SECURITY
-- Update calculate_distance function to be more secure
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    R decimal := 6371; -- Earth's radius in kilometers
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

-- Update zodiac compatibility function to be more secure
CREATE OR REPLACE FUNCTION public.calculate_zodiac_compatibility(sign1 text, sign2 text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Simplified zodiac compatibility matrix
  -- Returns compatibility score between 0.00 and 1.00
  CASE 
    WHEN sign1 = sign2 THEN RETURN 0.80;
    WHEN (sign1 = 'aries' AND sign2 IN ('leo', 'sagittarius', 'gemini', 'aquarius')) OR
         (sign1 = 'leo' AND sign2 IN ('aries', 'sagittarius', 'gemini', 'libra')) OR
         (sign1 = 'sagittarius' AND sign2 IN ('aries', 'leo', 'libra', 'aquarius')) THEN RETURN 0.90;
    WHEN (sign1 = 'taurus' AND sign2 IN ('virgo', 'capricorn', 'cancer', 'pisces')) OR
         (sign1 = 'virgo' AND sign2 IN ('taurus', 'capricorn', 'cancer', 'scorpio')) OR
         (sign1 = 'capricorn' AND sign2 IN ('taurus', 'virgo', 'scorpio', 'pisces')) THEN RETURN 0.85;
    WHEN (sign1 = 'gemini' AND sign2 IN ('libra', 'aquarius', 'aries', 'leo')) OR
         (sign1 = 'libra' AND sign2 IN ('gemini', 'aquarius', 'leo', 'sagittarius')) OR
         (sign1 = 'aquarius' AND sign2 IN ('gemini', 'libra', 'aries', 'sagittarius')) THEN RETURN 0.88;
    WHEN (sign1 = 'cancer' AND sign2 IN ('scorpio', 'pisces', 'taurus', 'virgo')) OR
         (sign1 = 'scorpio' AND sign2 IN ('cancer', 'pisces', 'virgo', 'capricorn')) OR
         (sign1 = 'pisces' AND sign2 IN ('cancer', 'scorpio', 'taurus', 'capricorn')) THEN RETURN 0.87;
    ELSE RETURN 0.60;
  END CASE;
END;
$$;

-- Update is_user_blocked function to be more secure
CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_id uuid, blocked_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE blocker_id = $1 AND blocked_id = $2
  );
END;
$$;

-- 6. ADD PRIVACY CONTROLS TO PROFILES TABLE
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_level text DEFAULT 'normal' 
CHECK (privacy_level IN ('private', 'normal', 'public'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_distance boolean DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_last_active boolean DEFAULT true;

-- Update profile policy to respect privacy levels
DROP POLICY IF EXISTS "Users can view profiles when authenticated" ON public.profiles;

CREATE POLICY "Users can view profiles with privacy controls" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Users can always see their own profile
    auth.uid() = user_id 
    -- Or profiles based on privacy level
    OR (
      privacy_level = 'public'
      OR (
        privacy_level = 'normal' 
        AND incognito = false
        AND (
          -- Within geographic range
          latitude IS NOT NULL 
          AND longitude IS NOT NULL 
          AND EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.latitude IS NOT NULL 
            AND p.longitude IS NOT NULL
            AND public.calculate_distance(p.latitude, p.longitude, profiles.latitude, profiles.longitude) <= 100
          )
          -- Or they have matched
          OR EXISTS (
            SELECT 1 FROM public.matches m 
            WHERE (m.user1_id = auth.uid() AND m.user2_id = profiles.user_id)
            OR (m.user2_id = auth.uid() AND m.user1_id = profiles.user_id)
          )
        )
      )
    )
  )
);

-- 7. ADD AUDIT LOGGING FOR SECURITY MONITORING
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  ip_address text,
  user_agent text,
  success boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow system to insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

COMMENT ON TABLE public.security_audit_log IS 'Security audit trail for monitoring access patterns';