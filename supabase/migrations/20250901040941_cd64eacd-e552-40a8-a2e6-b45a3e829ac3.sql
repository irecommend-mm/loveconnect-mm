
-- Add missing columns to group_events table
ALTER TABLE public.group_events 
ADD COLUMN is_public boolean DEFAULT true;
