-- Allow anyone to view flight registrations for counting participants
CREATE POLICY "Anyone can view flight registrations for counts"
ON public.flight_registrations
FOR SELECT
USING (true);