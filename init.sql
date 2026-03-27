-- ═══════════════════════════════════════════════════════════
--  Imba Production — Database Init
--  Runs on first Supabase PostgreSQL startup
-- ═══════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ── Schemas ─────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;

-- ── Roles ───────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ═══════════════════════════════════════════════════════════
--  TABLES
-- ═══════════════════════════════════════════════════════════

-- ── Team members ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  role        TEXT,
  bio         TEXT,
  photo_url   TEXT,
  social_links JSONB DEFAULT '{}',
  sort_order  INTEGER DEFAULT 0,
  published   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Portfolio items ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('brand','ai','product','social','drone','post','elearning')),
  client_name     TEXT,
  thumbnail_url   TEXT,
  video_url       TEXT,
  vimeo_id        TEXT,
  youtube_id      TEXT,
  description     TEXT,
  results         JSONB DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  featured        BOOLEAN DEFAULT false,
  published       BOOLEAN DEFAULT false,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Blog posts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  excerpt           TEXT,
  body              TEXT,
  cover_image_url   TEXT,
  author_id         UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  category          TEXT,
  tags              TEXT[] DEFAULT '{}',
  seo_title         TEXT,
  seo_description   TEXT,
  read_time_minutes INTEGER,
  published         BOOLEAN DEFAULT false,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Services ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  tagline           TEXT,
  description       TEXT,
  long_description  TEXT,
  cover_image_url   TEXT,
  icon_key          TEXT,
  features          JSONB DEFAULT '[]',
  pricing_hint      TEXT,
  sort_order        INTEGER DEFAULT 0,
  published         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Testimonials ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.testimonials (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name       TEXT NOT NULL,
  client_role       TEXT,
  client_company    TEXT,
  client_avatar_url TEXT,
  text              TEXT NOT NULL,
  rating            INTEGER CHECK (rating BETWEEN 1 AND 5),
  portfolio_item_id UUID REFERENCES public.portfolio_items(id) ON DELETE SET NULL,
  featured          BOOLEAN DEFAULT false,
  published         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Quote requests ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  company       TEXT,
  service_type  TEXT,
  budget_range  TEXT,
  message       TEXT,
  status        TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','proposal_sent','closed_won','closed_lost')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Site settings ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Blog categories ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id   UUID REFERENCES public.blog_categories(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Blog tags ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Post ↔ Tag junction ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_posts_tags (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ── Media library ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename      TEXT NOT NULL,
  original_name TEXT,
  mime_type     TEXT,
  size          INTEGER,
  url           TEXT NOT NULL,
  alt           TEXT,
  caption       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Add new columns to blog_posts ────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='status') THEN
    ALTER TABLE public.blog_posts ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='author_name') THEN
    ALTER TABLE public.blog_posts ADD COLUMN author_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='og_image_url') THEN
    ALTER TABLE public.blog_posts ADD COLUMN og_image_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='category_id') THEN
    ALTER TABLE public.blog_posts ADD COLUMN category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='featured_image_url') THEN
    ALTER TABLE public.blog_posts ADD COLUMN featured_image_url TEXT;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
--  INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_portfolio_published ON public.portfolio_items(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON public.portfolio_items(category);
-- ── Hero videos ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hero_videos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id          TEXT NOT NULL,
  title               TEXT NOT NULL,
  slide_eyebrow       TEXT,
  slide_headline      TEXT,
  slide_headline_em   TEXT,
  slide_subheadline   TEXT,
  sort_order          INTEGER DEFAULT 0,
  active              BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON public.portfolio_items(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_published ON public.blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(published);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quote_requests(status, created_at DESC);

-- ═══════════════════════════════════════════════════════════
--  UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_portfolio_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_blog_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (COALESCE(NULLIF(current_setting('request.jwt.claims', true), ''), '{}')::jsonb -> 'app_metadata' ->> 'role') = 'admin'
    OR (COALESCE(NULLIF(current_setting('request.jwt.claims', true), ''), '{}')::jsonb -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

ALTER TABLE public.hero_videos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings    ENABLE ROW LEVEL SECURITY;

-- Hero videos: public read active, admin full access
CREATE POLICY "public_read_hero_videos" ON public.hero_videos
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "admin_all_hero_videos" ON public.hero_videos
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Portfolio: public read published, admin full access
CREATE POLICY "public_read_portfolio" ON public.portfolio_items
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin_all_portfolio" ON public.portfolio_items
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Blog: public read published
CREATE POLICY "public_read_blog" ON public.blog_posts
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin_all_blog" ON public.blog_posts
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Services: public read published
CREATE POLICY "public_read_services" ON public.services
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin_all_services" ON public.services
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Testimonials: public read published
CREATE POLICY "public_read_testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin_all_testimonials" ON public.testimonials
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Team: public read published
CREATE POLICY "public_read_team" ON public.team_members
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin_all_team" ON public.team_members
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Quotes: anyone can insert, only admin reads
CREATE POLICY "public_insert_quotes" ON public.quote_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin_all_quotes" ON public.quote_requests
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Site settings: public read, admin write
CREATE POLICY "public_read_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_all_settings" ON public.site_settings
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Blog categories: public read, admin full access
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blog_categories" ON public.blog_categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_all_blog_categories" ON public.blog_categories
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Blog tags: public read, admin full access
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blog_tags" ON public.blog_tags
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_all_blog_tags" ON public.blog_tags
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Blog posts tags: public read, admin full access
ALTER TABLE public.blog_posts_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blog_posts_tags" ON public.blog_posts_tags
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_all_blog_posts_tags" ON public.blog_posts_tags
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Media files: public read, admin full access
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_media_files" ON public.media_files
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_all_media_files" ON public.media_files
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Grant table access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ═══════════════════════════════════════════════════════════
--  SEED DATA
-- ═══════════════════════════════════════════════════════════

INSERT INTO public.site_settings (key, value) VALUES
  ('hero', '{"title":"Stories that move people to act.","subtitle":"We combine cinematic craft with AI-powered strategy to produce brand videos that captivate, convert, and endure.","cta_primary":"See our work","cta_secondary":"Explore services"}'),
  ('stats', '[{"num":"12+","label":"Years"},{"num":"500+","label":"Videos"},{"num":"48h","label":"Turnaround"},{"num":"98%","label":"Satisfaction"}]'),
  ('contact_info', '{"email":"hello@imbaproduction.com","phone":"","address":"007 N Orange St, 4th Floor Suite #3601, Wilmington, Delaware 19801"}'),
  ('seo', '{"title":"Imba Production — Next-Gen Video for Brands","description":"Cinematic video production powered by AI strategy. Brand films, product videos, AI campaigns, drone, and social content.","og_image":""}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.services (name, slug, tagline, description, icon_key, sort_order, published) VALUES
  ('Brand & Commercial Video', 'brand-commercial', 'Cinematic brand films and TV-quality spots', 'We create brand films and commercial video that elevate your identity across every channel.', 'video', 0, true),
  ('AI-Powered Video', 'ai-video', 'Human creativity, machine speed', 'Hyper-personalised, AI-generated campaigns that scale content production without sacrificing quality.', 'ai', 1, true),
  ('Product & Ecommerce Video', 'product-ecommerce', 'Videos that sell', 'Conversion-focused product videos and cooking content designed to stop the scroll and drive purchases.', 'product', 2, true),
  ('Short & Social Video', 'short-social', 'Native to every algorithm', 'TikTok, Instagram Reels, and YouTube Shorts — natively-crafted vertical content.', 'social', 3, true),
  ('Post Production', 'post-production', 'Full-service editing & finishing', 'Edit, colour grade, motion graphics, and sound design from our in-house studio.', 'post', 4, true),
  ('Drone & Aerial', 'drone-aerial', 'Licensed aerial cinematography', 'Stunning aerial footage for events, real estate, sports, and outdoor brands.', 'drone', 5, true),
  ('eLearning Video', 'elearning', 'Training that engages', 'Professional eLearning and corporate training video production at any scale.', 'elearning', 6, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.testimonials (client_name, client_role, client_company, text, rating, featured, published) VALUES
  ('Sarah Andersen', 'CMO', 'FoodCo International', 'Imba Production transformed how we present our brand online. The cooking series they produced generated 3× more traffic than any previous content.', 5, true, true),
  ('Marco Kessler', 'Growth Lead', 'NordShop', 'The AI video campaign was something we had never seen from a production house. Personalisation at scale reduced our CPA by 40%.', 5, false, true),
  ('Julia Larsson', 'Founder', 'Velour Boutique', 'Professional, fast, and genuinely creative. Full product video suite delivered in 48 hours. The team at Imba is exceptional.', 5, false, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.hero_videos (youtube_id, title, slide_eyebrow, slide_headline, slide_headline_em, slide_subheadline, sort_order, active) VALUES
  ('HAHj0TDQZcg', 'A Steampunk Princess',       'Creative Direction',    'Imagination',           'rendered in cinema.',    'Bold creative concepts executed with precision — from the first frame to the final cut.',      0, true),
  ('SgHHbWp64cE', 'Virus House Teaser',          'Brand & Commercial',   'Stories that define',   'your brand.',            'Cinematic brand films that captivate audiences and drive measurable business results.',        1, true),
  ('9k5w1iG_JHM', 'Gen AI Video',                'AI Video Production',  'Human creativity,',     'machine speed.',         'AI-powered campaigns that scale your creative output without sacrificing quality.',            2, true),
  ('_fbHbplDCwo', 'Yoga on the Lake, Serbia',    'Drone & Aerial',       'The world from above,', 'in cinematic 4K.',       'Licensed aerial cinematography for brands that demand a different perspective.',              3, true),
  ('EZUJiL9MeLw', 'The Creature Transformation', 'Post Production & VFX','Every frame crafted',   'with intention.',        'From creature VFX to full colour grades — post-production quality that stands apart.',        4, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.portfolio_items (title, slug, category, client_name, description, results, featured, published, sort_order) VALUES
  ('Cooking Heritage Campaign', 'cooking-heritage', 'brand', 'FoodCo International', 'A cinematic brand film series celebrating culinary heritage.', '{"views":"4.2M","ctr":"↑38%"}', true, true, 0),
  ('FashionTech Reel', 'fashiontech-reel', 'ai', 'NordShop', 'AI-generated fashion campaign with personalised variants.', '{"variants":"2,400","cpa":"↓40%"}', false, true, 1),
  ('Coastal Estate Cinematic Tour', 'coastal-estate', 'drone', 'Prime Real Estate', 'Aerial cinematography showcase for luxury property.', '{"views":"890K"}', false, true, 2),
  ('Ecommerce Product Spot', 'ecommerce-spot', 'product', 'Velour Boutique', 'Product video suite for ecommerce launch.', '{"conversion":"↑22%"}', false, true, 3),
  ('TikTok Series Season 1', 'tiktok-series', 'social', 'BrandX', '12-episode vertical content series for TikTok.', '{"views":"12M","followers":"↑85K"}', false, true, 4)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
--  STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════

-- Create media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, ARRAY['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/webm'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "public_read_media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'media');

CREATE POLICY "admin_upload_media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

CREATE POLICY "admin_delete_media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media');

-- ═══════════════════════════════════════════════════════════
--  SEO PAGES (V003)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.seo_pages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path           TEXT NOT NULL UNIQUE,
  title          TEXT,
  description    TEXT,
  og_title       TEXT,
  og_description TEXT,
  og_image       TEXT,
  canonical      TEXT,
  noindex        BOOLEAN NOT NULL DEFAULT FALSE,
  structured_data JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_seo" ON public.seo_pages
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin_manage_seo" ON public.seo_pages
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

GRANT SELECT ON public.seo_pages TO anon, authenticated;
GRANT ALL ON public.seo_pages TO service_role;

-- ═══════════════════════════════════════════════════════════
--  TRANSLATIONS (V003)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.translations (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale    TEXT NOT NULL,
  namespace TEXT NOT NULL DEFAULT 'common',
  key       TEXT NOT NULL,
  value     TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (locale, namespace, key)
);

ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_translations" ON public.translations
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin_manage_translations" ON public.translations
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

GRANT SELECT ON public.translations TO anon, authenticated;
GRANT ALL ON public.translations TO service_role;

-- ═══════════════════════════════════════════════════════════
--  CRM + HOMEPAGE FEATURED (V004)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS homepage_featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  email             TEXT,
  company           TEXT,
  phone             TEXT,
  website           TEXT,
  source            TEXT        NOT NULL DEFAULT 'manual',
  quote_request_id  UUID        REFERENCES public.quote_requests(id),
  stage             TEXT        NOT NULL DEFAULT 'new',
  value             DECIMAL(12,2),
  probability       INTEGER     NOT NULL DEFAULT 50,
  service_interest  TEXT,
  budget_range      TEXT,
  notes             TEXT,
  ai_score          INTEGER,
  ai_notes          TEXT,
  last_ai_scored_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  next_follow_up    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    UUID        NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL DEFAULT 'note',
  subject    TEXT,
  body       TEXT        NOT NULL DEFAULT '',
  created_by TEXT        NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_leads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_crm_leads" ON public.crm_leads
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_manage_crm_activities" ON public.crm_activities
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

GRANT ALL ON public.crm_leads      TO service_role, authenticated;
GRANT ALL ON public.crm_activities TO service_role, authenticated;

-- ═══════════════════════════════════════════════════════════
--  MIGRATION BASELINE
--  On a fresh install init.sql creates the full schema, so
--  we mark all existing migrations as already applied so the
--  migration runner does not try to re-run them.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version    TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checksum   TEXT
);

-- Baseline: mark V001, V002, and V003 as applied on fresh installs
INSERT INTO public.schema_migrations (version) VALUES
  ('V001__initial_schema'),
  ('V002__blog_cms_and_media'),
  ('V003__seo_and_translations'),
  ('V004__crm_and_homepage_featured')
ON CONFLICT (version) DO NOTHING;

-- ── Media Library ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_url TEXT,
  storage_path TEXT UNIQUE,
  storage_url TEXT,
  mime_type TEXT,
  file_size BIGINT,
  alt_text TEXT,
  caption TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT ALL ON public.media_library TO anon, authenticated, service_role;
