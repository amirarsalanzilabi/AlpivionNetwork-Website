-- Remove the redundant email column from issues table
-- The user's email is already securely stored in auth.users and can be 
-- retrieved via user_id when needed for admin purposes

ALTER TABLE public.issues DROP COLUMN email;