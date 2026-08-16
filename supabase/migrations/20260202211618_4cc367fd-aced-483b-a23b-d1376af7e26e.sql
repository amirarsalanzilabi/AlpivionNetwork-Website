-- Create rate limiting table to track creation events (persists even if content is deleted)
CREATE TABLE public.forum_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('thread', 'comment')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forum_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only view their own rate limit records
CREATE POLICY "Users can view own rate limits"
  ON public.forum_rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own rate limit records
CREATE POLICY "Users can insert own rate limits"
  ON public.forum_rate_limits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_forum_rate_limits_user_action_date 
  ON public.forum_rate_limits (user_id, action_type, created_at);

-- Update thread count function to use rate limits table
CREATE OR REPLACE FUNCTION public.get_user_daily_thread_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only query own thread count';
  END IF;
  
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.forum_rate_limits
  WHERE user_id = p_user_id
    AND action_type = 'thread'
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
    
  RETURN v_count;
END;
$$;

-- Update last thread time function to use rate limits table
CREATE OR REPLACE FUNCTION public.get_user_last_thread_time(p_user_id uuid)
RETURNS timestamp with time zone
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_time TIMESTAMP WITH TIME ZONE;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only query own thread data';
  END IF;
  
  SELECT MAX(created_at) INTO v_last_time
  FROM public.forum_rate_limits
  WHERE user_id = p_user_id
    AND action_type = 'thread';
    
  RETURN v_last_time;
END;
$$;

-- Update comment count function to use rate limits table
CREATE OR REPLACE FUNCTION public.get_user_daily_comment_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only query own comment count';
  END IF;
  
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.forum_rate_limits
  WHERE user_id = p_user_id
    AND action_type = 'comment'
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
    
  RETURN v_count;
END;
$$;

-- Update last comment time function to use rate limits table
CREATE OR REPLACE FUNCTION public.get_user_last_comment_time(p_user_id uuid)
RETURNS timestamp with time zone
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_time TIMESTAMP WITH TIME ZONE;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only query own comment data';
  END IF;
  
  SELECT MAX(created_at) INTO v_last_time
  FROM public.forum_rate_limits
  WHERE user_id = p_user_id
    AND action_type = 'comment';
    
  RETURN v_last_time;
END;
$$;