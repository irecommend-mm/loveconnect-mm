
-- Add tables and columns needed for advanced matching algorithm

-- Add compatibility scores table
CREATE TABLE public.compatibility_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  overall_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  preference_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  goal_compatibility DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  location_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  interests_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  zodiac_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  behavior_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  last_calculated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Add user activity tracking for behavior analysis
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'profile_view', 'like', 'message_sent', 'login', 'swipe_right', 'swipe_left'
  target_user_id UUID, -- for activities involving another user
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add location history for path crossing detection
CREATE TABLE public.location_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(6, 2), -- accuracy in meters
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add gamification levels
CREATE TABLE public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  activity_level TEXT DEFAULT 'low' CHECK (activity_level IN ('very_active', 'active', 'moderate', 'low', 'inactive')),
  total_score INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  profile_completeness_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add crossed paths tracking
CREATE TABLE public.crossed_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  crossing_count INTEGER DEFAULT 1,
  last_crossing_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_crossing_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  average_distance DECIMAL(8, 2), -- average distance in meters when crossed
  locations JSONB DEFAULT '[]', -- store crossing locations
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Add notifications table for smart push notifications
CREATE TABLE public.push_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL, -- 'match', 'like', 'message', 'safety', 'profile_view', 'crossed_paths'
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.compatibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crossed_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compatibility_scores
CREATE POLICY "Users can view compatibility scores involving them" ON public.compatibility_scores
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for user_activity
CREATE POLICY "Users can insert their own activity" ON public.user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity" ON public.user_activity
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for location_history
CREATE POLICY "Users can manage their location history" ON public.location_history
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_gamification
CREATE POLICY "Users can view their gamification data" ON public.user_gamification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their gamification data" ON public.user_gamification
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for crossed_paths
CREATE POLICY "Users can view crossed paths involving them" ON public.crossed_paths
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for push_notifications
CREATE POLICY "Users can view their notifications" ON public.push_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.push_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_compatibility_scores_user1 ON public.compatibility_scores(user1_id);
CREATE INDEX idx_compatibility_scores_user2 ON public.compatibility_scores(user2_id);
CREATE INDEX idx_compatibility_scores_overall ON public.compatibility_scores(overall_score DESC);

CREATE INDEX idx_user_activity_user ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX idx_user_activity_created ON public.user_activity(created_at DESC);

CREATE INDEX idx_location_history_user ON public.location_history(user_id);
CREATE INDEX idx_location_history_time ON public.location_history(recorded_at DESC);
CREATE INDEX idx_location_history_coords ON public.location_history(latitude, longitude);

CREATE INDEX idx_crossed_paths_user1 ON public.crossed_paths(user1_id);
CREATE INDEX idx_crossed_paths_user2 ON public.crossed_paths(user2_id);
CREATE INDEX idx_crossed_paths_time ON public.crossed_paths(last_crossing_time DESC);

CREATE INDEX idx_push_notifications_user ON public.push_notifications(user_id);
CREATE INDEX idx_push_notifications_read ON public.push_notifications(read);
CREATE INDEX idx_push_notifications_type ON public.push_notifications(type);

-- Function to calculate zodiac compatibility
CREATE OR REPLACE FUNCTION public.calculate_zodiac_compatibility(sign1 TEXT, sign2 TEXT)
RETURNS DECIMAL(3,2) AS $$
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
$$ LANGUAGE plpgsql;

-- Function to detect crossed paths
CREATE OR REPLACE FUNCTION public.detect_crossed_paths()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for crossed paths detection
CREATE TRIGGER trigger_detect_crossed_paths
  AFTER INSERT ON public.location_history
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_crossed_paths();
