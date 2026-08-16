-- Drop policies that use has_role function
DROP POLICY IF EXISTS "Admins can update flights" ON public.flights;
DROP POLICY IF EXISTS "Admins can upload flight photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update flight photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete flight photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can insert flight photos" ON public.flight_photos;
DROP POLICY IF EXISTS "Admins can update flight photos" ON public.flight_photos;
DROP POLICY IF EXISTS "Admins can delete flight photos" ON public.flight_photos;

-- Drop user_roles table and related
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP TABLE IF EXISTS public.user_roles;
DROP FUNCTION IF EXISTS public.has_role;
DROP TYPE IF EXISTS public.app_role;