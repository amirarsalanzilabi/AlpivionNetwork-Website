-- 1) Secure flight-photos bucket: restrict write operations to admins
DO $$
BEGIN
  -- Drop the previously created permissive policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload flight photos'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can upload flight photos" ON storage.objects';
  END IF;
END $$;

-- Admins can upload flight photos
CREATE POLICY "Admins can upload flight photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'flight-photos' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update/delete flight photos (optional but useful)
CREATE POLICY "Admins can update flight photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'flight-photos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'flight-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete flight photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'flight-photos' AND public.has_role(auth.uid(), 'admin'));

-- 2) Create normalized flight_photos table (URLs only; files stay in storage)
CREATE TABLE IF NOT EXISTS public.flight_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id uuid NOT NULL REFERENCES public.flights(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flight_photos_flight_id ON public.flight_photos(flight_id);

ALTER TABLE public.flight_photos ENABLE ROW LEVEL SECURITY;

-- Anyone can view photos metadata for a flight (no PII)
CREATE POLICY "Anyone can view flight photos"
ON public.flight_photos FOR SELECT
USING (true);

-- Only admins can insert/update/delete photo metadata
CREATE POLICY "Admins can insert flight photos"
ON public.flight_photos FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = uploaded_by);

CREATE POLICY "Admins can update flight photos"
ON public.flight_photos FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete flight photos"
ON public.flight_photos FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3) Ensure flights has RLS enabled (should already be) and keep UPDATE admin-only
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;