-- FIX REMAINING SECURITY WARNINGS FROM LINTER

-- 1. Update detect_crossed_paths function to fix search_path security warning
CREATE OR REPLACE FUNCTION public.detect_crossed_paths()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update crossed paths when users are within 100 meters of each other
  -- within the last 24 hours
  INSERT INTO public.crossed_paths (user1_id, user2_id, crossing_count, last_crossing_time, first_crossing_time, average_distance, locations)
  SELECT 
    LEAST(NEW.user_id, lh.user_id) as user1_id,
    GREATEST(NEW.user_id, lh.user_id) as user2_id,
    1 as crossing_count,
    NEW.recorded_at as last_crossing_time,
    NEW.recorded_at as first_crossing_time,
    public.calculate_distance(NEW.latitude, NEW.longitude, lh.latitude, lh.longitude) * 1000 as average_distance,
    ARRAY[json_build_object('lat', NEW.latitude, 'lng', NEW.longitude, 'time', NEW.recorded_at)]::jsonb as locations
  FROM public.location_history lh
  WHERE lh.user_id != NEW.user_id
    AND lh.recorded_at >= NEW.recorded_at - INTERVAL '24 hours'
    AND lh.recorded_at <= NEW.recorded_at + INTERVAL '1 hour'
    AND public.calculate_distance(NEW.latitude, NEW.longitude, lh.latitude, lh.longitude) * 1000 <= 100
  ON CONFLICT (user1_id, user2_id) 
  DO UPDATE SET
    crossing_count = crossed_paths.crossing_count + 1,
    last_crossing_time = NEW.recorded_at,
    average_distance = (crossed_paths.average_distance + EXCLUDED.average_distance) / 2,
    locations = crossed_paths.locations || EXCLUDED.locations,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- 2. Update expire_old_stories function to fix search_path security warning
CREATE OR REPLACE FUNCTION public.expire_old_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stories 
  SET is_active = false 
  WHERE expires_at <= now() AND is_active = true;
END;
$$;

-- 3. Update check_for_match function to be more secure
CREATE OR REPLACE FUNCTION public.check_for_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NEW.action = 'like' THEN
    IF EXISTS (
      SELECT 1 FROM public.swipes 
      WHERE swiper_id = NEW.swiped_id 
      AND swiped_id = NEW.swiper_id 
      AND action = 'like'
    ) THEN
      INSERT INTO public.matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id)
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON MIGRATION IS 'Fixed remaining function security warnings by setting proper search_path for all functions';