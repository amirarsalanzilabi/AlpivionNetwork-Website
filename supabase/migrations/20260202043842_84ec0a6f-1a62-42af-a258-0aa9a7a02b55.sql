-- Fix get_user_daily_issue_count function to only allow users to query their own count
DROP FUNCTION IF EXISTS public.get_user_daily_issue_count(UUID);

CREATE OR REPLACE FUNCTION public.get_user_daily_issue_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verify caller can only query their own count
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only query own issue count';
  END IF;
  
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.issues
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
    
  RETURN v_count;
END;
$$;

-- Add public SELECT policy for profiles (for community features - display_name, avatar_url, pilot_id are safe)
CREATE POLICY "Anyone can view public profile info"
ON public.profiles FOR SELECT
USING (true);

-- Add foreign key constraints to forum tables for referential integrity
-- Using SET NULL on delete to preserve content when users are deleted
ALTER TABLE public.forum_threads 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.forum_threads
  ADD CONSTRAINT forum_threads_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

ALTER TABLE public.forum_comments 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.forum_comments
  ADD CONSTRAINT forum_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;