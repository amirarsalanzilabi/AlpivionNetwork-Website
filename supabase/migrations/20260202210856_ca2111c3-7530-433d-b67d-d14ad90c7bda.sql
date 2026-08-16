-- Create function to get user's daily thread count
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
  -- Verify caller can only query their own count
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only query own thread count';
  END IF;
  
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.forum_threads
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
    
  RETURN v_count;
END;
$$;

-- Create function to get user's last thread timestamp
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
  -- Verify caller can only query their own data
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only query own thread data';
  END IF;
  
  SELECT MAX(created_at) INTO v_last_time
  FROM public.forum_threads
  WHERE user_id = p_user_id;
    
  RETURN v_last_time;
END;
$$;