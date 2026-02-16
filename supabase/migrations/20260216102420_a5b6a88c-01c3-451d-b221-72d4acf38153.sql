
-- Add slug column
ALTER TABLE public.news ADD COLUMN slug text;

-- Create function to generate slug from Swedish title
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  result text;
BEGIN
  result := lower(title);
  -- Replace Swedish characters
  result := replace(result, 'å', 'a');
  result := replace(result, 'ä', 'a');
  result := replace(result, 'ö', 'o');
  result := replace(result, 'é', 'e');
  result := replace(result, 'ü', 'u');
  -- Remove everything except letters, numbers, spaces, hyphens
  result := regexp_replace(result, '[^a-z0-9\s\-]', '', 'g');
  -- Replace whitespace with hyphens
  result := regexp_replace(result, '\s+', '-', 'g');
  -- Remove multiple consecutive hyphens
  result := regexp_replace(result, '-+', '-', 'g');
  -- Trim hyphens from start/end
  result := trim(both '-' from result);
  -- Max 80 chars
  result := left(result, 80);
  RETURN result;
END;
$function$;

-- Backfill slugs for existing news
UPDATE public.news SET slug = generate_slug(title) WHERE slug IS NULL;

-- Handle any duplicate slugs by appending a suffix
DO $$
DECLARE
  rec RECORD;
  counter int;
  new_slug text;
BEGIN
  FOR rec IN 
    SELECT id, slug FROM public.news 
    WHERE slug IN (SELECT slug FROM public.news GROUP BY slug HAVING count(*) > 1)
    ORDER BY date DESC
  LOOP
    SELECT count(*) INTO counter FROM public.news WHERE slug = rec.slug AND id < rec.id;
    IF counter > 0 THEN
      new_slug := rec.slug || '-' || counter;
      UPDATE public.news SET slug = new_slug WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE public.news ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_news_slug ON public.news (slug);
