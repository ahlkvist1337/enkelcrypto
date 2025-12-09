-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a table to track migration progress
CREATE TABLE IF NOT EXISTS public.migration_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  migration_name text NOT NULL UNIQUE,
  current_offset integer NOT NULL DEFAULT 0,
  total_count integer,
  is_complete boolean NOT NULL DEFAULT false,
  last_run_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.migration_progress ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage migration progress
CREATE POLICY "Admins can manage migration progress"
ON public.migration_progress
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public read for status checking
CREATE POLICY "Public read access for migration_progress"
ON public.migration_progress
FOR SELECT
USING (true);

-- Insert initial progress record for news translations
INSERT INTO public.migration_progress (migration_name, current_offset, is_complete)
VALUES ('news_translations', 25, false)
ON CONFLICT (migration_name) DO NOTHING;