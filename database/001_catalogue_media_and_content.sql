-- NELLWICK catalogue extension
-- Safe to run more than once. Keeps existing products, variants and supplier maps.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS short_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS feature_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS detail_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS how_to_use text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS care_instructions text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS what_is_included jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS product_faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_type text NOT NULL DEFAULT 'mp4',
  ADD COLUMN IF NOT EXISTS video_poster_url text,
  ADD COLUMN IF NOT EXISTS image_alt text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_note text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS returns_note text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS related_product_slugs text[] NOT NULL DEFAULT ARRAY[]::text[];

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS color_hex text NOT NULL DEFAULT '#779B88',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS image_alt text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_type text NOT NULL DEFAULT 'mp4';

-- Keep media links to web URLs only. This is a data-quality constraint, not
-- a guarantee that the remote host will keep the media available.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_video_type_check;
ALTER TABLE public.products ADD CONSTRAINT products_video_type_check
  CHECK (video_type IN ('mp4', 'youtube', 'vimeo'));

ALTER TABLE public.product_variants DROP CONSTRAINT IF EXISTS product_variants_video_type_check;
ALTER TABLE public.product_variants ADD CONSTRAINT product_variants_video_type_check
  CHECK (video_type IN ('mp4', 'youtube', 'vimeo'));

-- Add public read access to only the new catalogue content through the
-- existing products/variants SELECT policies. No new write policy is added.
