
-- Update the profiles table to support rich user profile data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birthdate DATE,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS orientation TEXT[],
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS lifestyle JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS show_me TEXT[],
ADD COLUMN IF NOT EXISTS love_languages TEXT[],
ADD COLUMN IF NOT EXISTS personality_type TEXT,
ADD COLUMN IF NOT EXISTS body_type TEXT,
ADD COLUMN IF NOT EXISTS height_cm INTEGER,
ADD COLUMN IF NOT EXISTS height_feet FLOAT,
ADD COLUMN IF NOT EXISTS terms_agreement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS video_intro_url TEXT,
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[],
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS dealbreakers TEXT[];

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON public.profiles(age);

-- Update the interests table to remove it since we're moving interests to profiles table as array
-- First, let's migrate existing interests to the new array format
DO $$
DECLARE
    profile_record RECORD;
    user_interests TEXT[];
BEGIN
    -- For each profile, collect their interests into an array
    FOR profile_record IN 
        SELECT user_id 
        FROM public.profiles 
    LOOP
        -- Get all interests for this user
        SELECT array_agg(interest) INTO user_interests
        FROM public.interests 
        WHERE user_id = profile_record.user_id;
        
        -- Update the profile with the interests array
        IF user_interests IS NOT NULL THEN
            UPDATE public.profiles 
            SET lifestyle = COALESCE(lifestyle, '{}')::jsonb || jsonb_build_object('interests', user_interests)
            WHERE user_id = profile_record.user_id;
        END IF;
    END LOOP;
END $$;
