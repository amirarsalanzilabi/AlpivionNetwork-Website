-- Schedule the cleanup job to run every 5 minutes
SELECT cron.schedule(
  'cleanup-unverified-users',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://tquhcxmevswdvpibukyv.supabase.co/functions/v1/cleanup-unverified-users',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);