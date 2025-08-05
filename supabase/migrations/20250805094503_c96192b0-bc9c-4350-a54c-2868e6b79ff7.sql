
-- First, drop any existing check constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_drinking_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_smoking_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_exercise_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_relationship_type_check;

-- Update any NULL values in existing data to valid defaults
UPDATE public.profiles
SET 
  drinking = COALESCE(drinking, 'never'),
  smoking = COALESCE(smoking, 'never'),
  exercise = COALESCE(exercise, 'sometimes'),
  relationship_type = COALESCE(relationship_type, 'unsure')
WHERE 
  drinking IS NULL OR 
  smoking IS NULL OR 
  exercise IS NULL OR 
  relationship_type IS NULL;

-- Update any invalid values to valid ones
UPDATE public.profiles
SET 
  drinking = CASE 
    WHEN drinking NOT IN ('never', 'socially', 'regularly') THEN 'never' 
    ELSE drinking 
  END,
  smoking = CASE 
    WHEN smoking NOT IN ('never', 'sometimes', 'regularly') THEN 'never' 
    ELSE smoking 
  END,
  exercise = CASE 
    WHEN exercise NOT IN ('never', 'sometimes', 'regularly', 'often', 'daily') THEN 'sometimes' 
    ELSE exercise 
  END,
  relationship_type = CASE 
    WHEN relationship_type NOT IN ('casual', 'serious', 'friendship', 'unsure') THEN 'unsure' 
    ELSE relationship_type 
  END
WHERE
  drinking NOT IN ('never', 'socially', 'regularly') OR
  smoking NOT IN ('never', 'sometimes', 'regularly') OR
  exercise NOT IN ('never', 'sometimes', 'regularly', 'often', 'daily') OR
  relationship_type NOT IN ('casual', 'serious', 'friendship', 'unsure');

-- Now add the check constraints that allow NULL values
ALTER TABLE public.profiles ADD CONSTRAINT profiles_drinking_check 
CHECK (drinking IS NULL OR drinking IN ('never', 'socially', 'regularly'));

ALTER TABLE public.profiles ADD CONSTRAINT profiles_smoking_check 
CHECK (smoking IS NULL OR smoking IN ('never', 'sometimes', 'regularly'));

ALTER TABLE public.profiles ADD CONSTRAINT profiles_exercise_check 
CHECK (exercise IS NULL OR exercise IN ('never', 'sometimes', 'regularly', 'often', 'daily'));

ALTER TABLE public.profiles ADD CONSTRAINT profiles_relationship_type_check 
CHECK (relationship_type IS NULL OR relationship_type IN ('casual', 'serious', 'friendship', 'unsure'));

-- Remove the trigger that creates default profiles to prevent conflicts
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
