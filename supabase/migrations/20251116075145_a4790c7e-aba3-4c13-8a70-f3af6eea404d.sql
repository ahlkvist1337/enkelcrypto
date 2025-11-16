-- Add full_content column to news table for storing complete article text
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS full_content text;

-- Add image_url column for article images
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS image_url text;