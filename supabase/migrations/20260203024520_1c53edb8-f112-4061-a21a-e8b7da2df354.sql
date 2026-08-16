-- Add completed status and images to flights table
ALTER TABLE public.flights 
ADD COLUMN is_completed boolean NOT NULL DEFAULT false,
ADD COLUMN images text[] DEFAULT NULL;

-- Create storage bucket for flight photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('flight-photos', 'flight-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to flight photos
CREATE POLICY "Anyone can view flight photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'flight-photos');

-- Only authenticated users can upload (admin check will be in app logic)
CREATE POLICY "Authenticated users can upload flight photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'flight-photos');