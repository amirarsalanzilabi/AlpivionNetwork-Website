-- Create forum threads table
CREATE TABLE public.forum_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum comments table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Thread policies: Anyone can view, authenticated users can create (no delete/update)
CREATE POLICY "Anyone can view threads"
ON public.forum_threads
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create threads"
ON public.forum_threads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Comment policies: Anyone can view, authenticated users can create (no delete/update)
CREATE POLICY "Anyone can view comments"
ON public.forum_comments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.forum_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);