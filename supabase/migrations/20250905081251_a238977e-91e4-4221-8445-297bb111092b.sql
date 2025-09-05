-- Add relationship intent to swipes to track friend vs date mode
ALTER TABLE public.swipes ADD COLUMN relationship_intent text DEFAULT 'date' CHECK (relationship_intent IN ('friend', 'date'));

-- Update stories table to support anonymous posting
ALTER TABLE public.stories ADD COLUMN is_anonymous boolean DEFAULT false;
ALTER TABLE public.stories ADD COLUMN relationship_mode text DEFAULT 'date' CHECK (relationship_mode IN ('friend', 'date'));

-- Create index for better performance
CREATE INDEX idx_swipes_relationship_intent ON public.swipes(relationship_intent);
CREATE INDEX idx_stories_anonymous ON public.stories(is_anonymous);
CREATE INDEX idx_stories_relationship_mode ON public.stories(relationship_mode);

-- Update friend_requests table to add expiration
ALTER TABLE public.friend_requests ADD COLUMN expires_at timestamp with time zone DEFAULT (now() + interval '48 hours');

-- Add RLS policies for stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all active stories" 
ON public.stories 
FOR SELECT 
USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can create their own stories" 
ON public.stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" 
ON public.stories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
ON public.stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add RLS policies for story_interactions
ALTER TABLE public.story_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view story interactions for their stories" 
ON public.story_interactions 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_interactions.story_id AND stories.user_id = auth.uid())
);

CREATE POLICY "Users can create story interactions" 
ON public.story_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story interactions" 
ON public.story_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add RLS policies for story_media
ALTER TABLE public.story_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view story media for active stories" 
ON public.story_media 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_media.story_id AND stories.is_active = true AND stories.expires_at > now())
);

CREATE POLICY "Users can create media for their stories" 
ON public.story_media 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_media.story_id AND stories.user_id = auth.uid())
);

-- Add RLS policies for friend_requests
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friend requests" 
ON public.friend_requests 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create friend requests" 
ON public.friend_requests 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update received friend requests" 
ON public.friend_requests 
FOR UPDATE 
USING (auth.uid() = recipient_id);

-- Create trigger to auto-expire friend requests
CREATE OR REPLACE FUNCTION expire_friend_requests()
RETURNS trigger AS $$
BEGIN
  UPDATE public.friend_requests 
  SET status = 'expired' 
  WHERE expires_at < now() AND status = 'pending';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expire_friend_requests
  AFTER INSERT OR UPDATE ON public.friend_requests
  FOR EACH STATEMENT
  EXECUTE FUNCTION expire_friend_requests();