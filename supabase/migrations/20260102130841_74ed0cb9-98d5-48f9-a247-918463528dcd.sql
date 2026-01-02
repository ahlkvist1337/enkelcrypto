-- Create news scrape log table for tracking scrape attempts
CREATE TABLE public.news_scrape_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  articles_fetched integer DEFAULT 0,
  articles_saved integer DEFAULT 0,
  error_message text,
  attempt_number integer NOT NULL DEFAULT 1,
  date date NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.news_scrape_log ENABLE ROW LEVEL SECURITY;

-- Public read access for monitoring
CREATE POLICY "Public read access for news_scrape_log"
ON public.news_scrape_log
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_news_scrape_log_date ON public.news_scrape_log(date);
CREATE INDEX idx_news_scrape_log_status ON public.news_scrape_log(status);