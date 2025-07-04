/*
  # Setup bolt-version Database Schema

  1. New Tables
    - `profiles` - User profile information
    - `photos` - User photos with position and primary flag
    - `interests` - User interests/hobbies
    - `swipes` - User swipe actions (like/dislike/super_like)
    - `matches` - Matched users
    - `messages` - Chat messages between matched users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Set up storage bucket for profile images

  3. Functions
    - Distance calculation function for location-based matching
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL CHECK (age >= 18 AND age <= 100),
  bio text,
  location text,
  job text,
  education text,
  height text,
  zodiac_sign text,
  relationship_type text CHECK (relationship_type IN ('serious', 'casual', 'friends', 'unsure')),
  children text CHECK (children IN ('have', 'want', 'dont_want', 'unsure')),
  smoking text CHECK (smoking IN ('yes', 'no', 'sometimes')),
  drinking text CHECK (drinking IN ('yes', 'no', 'sometimes')),
  exercise text CHECK (exercise IN ('often', 'sometimes', 'never')),
  verified boolean DEFAULT false,
  incognito boolean DEFAULT false,
  latitude decimal,
  longitude decimal,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  position integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create interests table
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  interest text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('like', 'dislike', 'super_like')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Photos policies
CREATE POLICY "Users can view all photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Users can manage own photos" ON photos FOR ALL USING (auth.uid() = user_id);

-- Interests policies
CREATE POLICY "Users can view all interests" ON interests FOR SELECT USING (true);
CREATE POLICY "Users can manage own interests" ON interests FOR ALL USING (auth.uid() = user_id);

-- Swipes policies
CREATE POLICY "Users can view own swipes" ON swipes FOR SELECT USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);
CREATE POLICY "Users can insert own swipes" ON swipes FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Matches policies
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "System can create matches" ON matches FOR INSERT WITH CHECK (true);

-- Messages policies
CREATE POLICY "Users can view messages in their matches" ON messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages in their matches" ON messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Create distance calculation function
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Users can upload their own profile images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update their own profile images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete their own profile images" ON storage.objects FOR DELETE USING (
  bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for messages and matches
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE matches REPLICA IDENTITY FULL;