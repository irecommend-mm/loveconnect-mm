
-- Update user profile to set incognito mode (assuming we need to add this feature)
-- First, let's add an incognito column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS incognito BOOLEAN DEFAULT FALSE;

-- Set the specific user to incognito mode
UPDATE profiles 
SET incognito = TRUE 
WHERE user_id = '11111111-1111-1111-1111-111111111001';

-- Also update their visibility in the app by setting verified to false if needed
UPDATE profiles 
SET verified = FALSE 
WHERE user_id = '11111111-1111-1111-1111-111111111001';
