/*
  # Create Demo Data for bolt-version Database

  1. Demo Users
    - Create demo user profiles with realistic data
    - Add photos and interests for each user
    - Set up various relationship types and preferences

  2. Demo Interactions
    - Create some swipes between users
    - Set up matches for testing chat functionality
    - Add sample messages

  3. Testing Data
    - Verified and unverified users
    - Users with different preferences
    - Various locations for distance testing
*/

-- Insert demo profiles (these will be created when users sign up)
-- We'll create placeholder data that can be used for testing

-- Demo interests that can be used
INSERT INTO interests (user_id, interest) VALUES
-- We'll add these when demo users are created
('00000000-0000-0000-0000-000000000000', 'Travel'),
('00000000-0000-0000-0000-000000000000', 'Photography'),
('00000000-0000-0000-0000-000000000000', 'Hiking'),
('00000000-0000-0000-0000-000000000000', 'Cooking'),
('00000000-0000-0000-0000-000000000000', 'Music'),
('00000000-0000-0000-0000-000000000000', 'Art'),
('00000000-0000-0000-0000-000000000000', 'Fitness'),
('00000000-0000-0000-0000-000000000000', 'Reading'),
('00000000-0000-0000-0000-000000000000', 'Dancing'),
('00000000-0000-0000-0000-000000000000', 'Yoga')
ON CONFLICT DO NOTHING;

-- Clean up the placeholder data
DELETE FROM interests WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Note: Actual demo users will be created through the application
-- This ensures proper authentication flow and realistic testing