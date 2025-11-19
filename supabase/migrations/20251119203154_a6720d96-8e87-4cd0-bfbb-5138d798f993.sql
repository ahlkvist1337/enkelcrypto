-- Add unique constraint on title column in news table to enable upsert
ALTER TABLE public.news ADD CONSTRAINT news_title_unique UNIQUE (title);