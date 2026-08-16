-- Create the auth hook for custom email sending
-- This hook intercepts auth emails and routes them to our edge function

-- First, ensure the http extension is available (needed for webhook calls)
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Create the hook function that calls our edge function
CREATE OR REPLACE FUNCTION public.custom_send_email_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  edge_function_url text;
  hook_secret text;
  response extensions.http_response;
  payload text;
BEGIN
  -- Get the edge function URL
  edge_function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-auth-email';
  
  -- If supabase_url setting is not available, construct from project ref
  IF edge_function_url IS NULL OR edge_function_url = '/functions/v1/send-auth-email' THEN
    edge_function_url := 'https://tquhcxmevswdvpibukyv.supabase.co/functions/v1/send-auth-email';
  END IF;

  -- Get the hook secret
  SELECT decrypted_secret INTO hook_secret
  FROM vault.decrypted_secrets
  WHERE name = 'SEND_EMAIL_HOOK_SECRET'
  LIMIT 1;

  -- Prepare the payload (the event already contains user and email_data)
  payload := event::text;

  -- Make HTTP POST request to the edge function
  SELECT * INTO response
  FROM extensions.http((
    'POST',
    edge_function_url,
    ARRAY[
      extensions.http_header('Content-Type', 'application/json'),
      extensions.http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
    ],
    'application/json',
    payload
  )::extensions.http_request);

  -- Check response status
  IF response.status >= 400 THEN
    RAISE EXCEPTION 'Failed to send email: %', response.content;
  END IF;

  -- Return empty object to indicate success
  RETURN '{}'::jsonb;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.custom_send_email_hook(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.custom_send_email_hook(jsonb) TO supabase_auth_admin;