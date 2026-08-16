-- FIX 1: Remove public exposure of profiles table (exposes user_id)
DROP POLICY IF EXISTS "Anyone can view public profile info" ON public.profiles;

-- FIX 2: Remove public exposure of flight_registrations table (exposes user activity)
DROP POLICY IF EXISTS "Anyone can view flight registrations for counts" ON public.flight_registrations;

-- Create a secure function to get flight participant counts without exposing individual records
CREATE OR REPLACE FUNCTION public.get_flight_participant_counts()
RETURNS TABLE (flight_id UUID, participant_count BIGINT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT flight_id, COUNT(*) as participant_count
  FROM public.flight_registrations
  GROUP BY flight_id;
$$;

-- Grant execute permission to both anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_flight_participant_counts() TO anon, authenticated;