-- Update all cron jobs to read CRON_SECRET from site_settings table
-- instead of current_setting() which requires ALTER DATABASE (blocked in this environment)

-- Daily report evening
SELECT cron.unschedule('generate-daily-report-evening');
SELECT cron.schedule(
  'generate-daily-report-evening',
  '0 18 * * *',
  $$SELECT net.http_post(
    url:='https://cyjacdvuszdlysjdkeis.supabase.co/functions/v1/generate-daily-report',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', (SELECT value FROM site_settings WHERE key = 'cron_secret' LIMIT 1)
    ),
    body:='{"source": "cron-evening"}'::jsonb
  ) AS request_id;$$
);

-- Daily report morning backup
SELECT cron.unschedule('generate-daily-report-morning');
SELECT cron.schedule(
  'generate-daily-report-morning',
  '0 6 * * *',
  $$SELECT net.http_post(
    url:='https://cyjacdvuszdlysjdkeis.supabase.co/functions/v1/generate-daily-report',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', (SELECT value FROM site_settings WHERE key = 'cron_secret' LIMIT 1)
    ),
    body:='{"source": "cron-morning-backup"}'::jsonb
  ) AS request_id;$$
);

-- Weekly report
SELECT cron.unschedule('generate-weekly-report');
SELECT cron.schedule(
  'generate-weekly-report',
  '0 18 * * 0',
  $$SELECT net.http_post(
    url:='https://cyjacdvuszdlysjdkeis.supabase.co/functions/v1/generate-weekly-report',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', (SELECT value FROM site_settings WHERE key = 'cron_secret' LIMIT 1)
    ),
    body:='{"source": "cron-weekly"}'::jsonb
  ) AS request_id;$$
);

-- Scrape crypto news every 2 hours
SELECT cron.unschedule('scrape-crypto-news-every-2-hours');
SELECT cron.schedule(
  'scrape-crypto-news-every-2-hours',
  '0 */2 * * *',
  $$SELECT net.http_post(
    url:='https://cyjacdvuszdlysjdkeis.supabase.co/functions/v1/scrape-crypto-news',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', (SELECT value FROM site_settings WHERE key = 'cron_secret' LIMIT 1)
    ),
    body:='{}'::jsonb
  ) AS request_id;$$
);

-- Health check every 30 min
SELECT cron.unschedule('health-check-every-30-min');
SELECT cron.schedule(
  'health-check-every-30-min',
  '*/30 * * * *',
  $$SELECT net.http_post(
    url:='https://cyjacdvuszdlysjdkeis.supabase.co/functions/v1/health-check',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT value FROM site_settings WHERE key = 'cron_secret' LIMIT 1)
    ),
    body:='{}'::jsonb
  ) AS request_id;$$
);