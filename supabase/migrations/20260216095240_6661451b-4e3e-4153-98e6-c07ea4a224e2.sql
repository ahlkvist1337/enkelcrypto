
-- Create health_check_log table
CREATE TABLE public.health_check_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  status_code INTEGER,
  is_healthy BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_check_log ENABLE ROW LEVEL SECURITY;

-- Admins can read
CREATE POLICY "Admins can read health_check_log"
  ON public.health_check_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for fast lookups
CREATE INDEX idx_health_check_log_function_checked 
  ON public.health_check_log (function_name, checked_at DESC);

-- Auto-cleanup: delete logs older than 7 days
CREATE OR REPLACE FUNCTION public.cleanup_old_health_checks()
RETURNS void
LANGUAGE sql
SET search_path = 'public'
AS $$
  DELETE FROM public.health_check_log WHERE checked_at < now() - interval '7 days';
$$;
