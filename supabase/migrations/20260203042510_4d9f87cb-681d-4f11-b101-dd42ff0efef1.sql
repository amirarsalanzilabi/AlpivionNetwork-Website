-- Drop the unused custom_send_email_hook function
-- This was created for the auth hook approach but we're using the manual password reset flow instead
DROP FUNCTION IF EXISTS public.custom_send_email_hook(jsonb);