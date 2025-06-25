
-- Create some demo matches for testing chat functionality
-- Replace 'cbf3880f-be68-4f1e-b33a-2f8d429e5d0d' with your actual demo user ID

-- First, create some swipes from demo user to other users
INSERT INTO "public"."swipes" ("swiper_id", "swiped_id", "action", "created_at") VALUES 
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', '11111111-1111-1111-1111-111111111001', 'like', NOW()),
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', '11111111-1111-1111-1111-111111111002', 'like', NOW()),
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', '11111111-1111-1111-1111-111111111003', 'like', NOW());

-- Create reciprocal swipes from other users to demo user (to create matches)
INSERT INTO "public"."swipes" ("swiper_id", "swiped_id", "action", "created_at") VALUES 
('11111111-1111-1111-1111-111111111001', 'cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', 'like', NOW()),
('11111111-1111-1111-1111-111111111002', 'cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', 'like', NOW()),
('11111111-1111-1111-1111-111111111003', 'cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', 'like', NOW());

-- Create match records
INSERT INTO "public"."matches" ("user1_id", "user2_id", "created_at", "is_active") VALUES 
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', '11111111-1111-1111-1111-111111111001', NOW(), true),
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', '11111111-1111-1111-1111-111111111002', NOW(), true),
('cbf3880f-be68-4f1e-b33a-2f8d429e5d0d', '11111111-1111-1111-1111-111111111003', NOW(), true);
