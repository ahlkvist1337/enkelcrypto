-- Drop public read policies on operational log tables
DROP POLICY IF EXISTS "Public read access for report_generation_log" ON public.report_generation_log;
DROP POLICY IF EXISTS "Public read access for news_scrape_log" ON public.news_scrape_log;

-- Add admin-only read policies
CREATE POLICY "Admins can read report_generation_log"
ON public.report_generation_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read news_scrape_log"
ON public.news_scrape_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));