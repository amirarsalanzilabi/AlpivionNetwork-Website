-- Add unique constraint on display_name in profiles table
ALTER TABLE public.profiles ADD CONSTRAINT profiles_display_name_unique UNIQUE (display_name);