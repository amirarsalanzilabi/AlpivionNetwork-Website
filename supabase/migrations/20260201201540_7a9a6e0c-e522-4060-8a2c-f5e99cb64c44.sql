-- Create events table for community calendar
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view events (public calendar)
CREATE POLICY "Anyone can view events"
  ON public.events
  FOR SELECT
  USING (true);

-- Create index for efficient date queries
CREATE INDEX idx_events_date ON public.events(event_date DESC);