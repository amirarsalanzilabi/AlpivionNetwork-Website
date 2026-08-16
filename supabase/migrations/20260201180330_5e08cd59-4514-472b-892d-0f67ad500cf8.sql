-- Create a table for user-reported issues
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own issues
CREATE POLICY "Users can create their own issues" 
ON public.issues 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own issues
CREATE POLICY "Users can view their own issues" 
ON public.issues 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a function to count today's issues for a user
CREATE OR REPLACE FUNCTION public.get_user_daily_issue_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.issues
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day'
$$;