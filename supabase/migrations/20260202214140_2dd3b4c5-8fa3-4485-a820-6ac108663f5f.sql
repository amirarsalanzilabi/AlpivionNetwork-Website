-- Update the function to SECURITY DEFINER so it can access flight_registrations
-- while only returning aggregate counts (no user data exposed)
CREATE OR REPLACE FUNCTION public.get_flight_participant_counts()
RETURNS TABLE (flight_id UUID, participant_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT flight_id, COUNT(*) as participant_count
  FROM public.flight_registrations
  GROUP BY flight_id;
$$;

-- Ensure permissions are set
GRANT EXECUTE ON FUNCTION public.get_flight_participant_counts() TO anon, authenticated;