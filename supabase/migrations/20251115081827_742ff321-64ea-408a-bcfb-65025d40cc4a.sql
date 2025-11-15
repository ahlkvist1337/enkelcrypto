-- Create tables for CryptoWatch

-- Reports table (daily and weekly)
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_reports_date ON public.reports(date DESC);
CREATE INDEX idx_reports_type ON public.reports(type);

-- Winners and losers table
CREATE TABLE public.market_movers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  coin_name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  price_change DECIMAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('winner', 'loser')),
  ai_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_market_movers_date ON public.market_movers(date DESC);

-- News table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_date ON public.news(date DESC);

-- Affiliate links table
CREATE TABLE public.affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Site settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('about_page_content', 'CryptoWatch är en automatiserad tjänst som varje dag sammanfattar kryptomarknaden på enkel svenska. Vi är inte finansiella rådgivare och allt innehåll är endast för informationssyfte.'),
  ('disclaimer', 'CryptoWatch ger inte finansiell rådgivning. Allt innehåll är för information och inte köp/säljrekommendationer. Krypto är volatilt och riskfyllt.');

-- Enable RLS (but make tables public for read access)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_movers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for all users
CREATE POLICY "Public read access for reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Public read access for market_movers" ON public.market_movers FOR SELECT USING (true);
CREATE POLICY "Public read access for news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public read access for active affiliate_links" ON public.affiliate_links FOR SELECT USING (active = true);
CREATE POLICY "Public read access for site_settings" ON public.site_settings FOR SELECT USING (true);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_affiliate_links_updated_at
BEFORE UPDATE ON public.affiliate_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();