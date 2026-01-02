-- Create table to track report generation attempts
CREATE TABLE public.report_generation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_report_generation_log_date ON public.report_generation_log(date);
CREATE INDEX idx_report_generation_log_status ON public.report_generation_log(status);

-- Enable RLS
ALTER TABLE public.report_generation_log ENABLE ROW LEVEL SECURITY;

-- Public read access for monitoring
CREATE POLICY "Public read access for report_generation_log"
ON public.report_generation_log
FOR SELECT
USING (true);

-- Add comment
COMMENT ON TABLE public.report_generation_log IS 'Tracks daily report generation attempts for debugging and monitoring';