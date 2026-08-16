-- Add pilot_id column with auto-increment behavior
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pilot_id SERIAL;

-- Create a unique index on pilot_id
CREATE UNIQUE INDEX IF NOT EXISTS profiles_pilot_id_unique ON public.profiles(pilot_id);

-- Update the handle_new_user function to NOT set display_name (pilot_id auto-generated)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;