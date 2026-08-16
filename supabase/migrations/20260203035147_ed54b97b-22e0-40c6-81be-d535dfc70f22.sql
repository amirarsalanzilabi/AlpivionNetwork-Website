-- Remove metadata that exposes user identity
ALTER TABLE public.flight_photos DROP COLUMN IF EXISTS uploaded_by;