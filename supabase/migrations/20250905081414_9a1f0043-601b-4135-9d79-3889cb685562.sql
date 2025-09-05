-- Fix function search path issue
CREATE OR REPLACE FUNCTION expire_friend_requests()
RETURNS trigger AS $$
BEGIN
  UPDATE public.friend_requests 
  SET status = 'expired' 
  WHERE expires_at < now() AND status = 'pending';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;