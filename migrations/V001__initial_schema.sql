-- ═══════════════════════════════════════════════════════════
--  V001: Initial schema
--  All core tables for Imba Production CMS
--  Safe to re-run (idempotent — uses IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ── Core tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.team_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  role         TEXT,
  bio          TEXT,
  photo_url    TEXT,
  social_links JSONB DEFAULT '{}',
  sort_order   INTEGER DEFAULT 0,
  published    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  category      TEXT NOT NULL,
  client_name   TEXT,
  thumbnail_url TEXT,
  video_url     TEXT,
  vimeo_id      TEXT,
  youtube_id    TEXT,
  description   TEXT,
  results       JSONB DEFAULT '{}',
  tags          TEXT[] DEFAULT '{}',
  featured      BOOLEAN DEFAULT false,
  published     BOOLEAN DEFAULT false,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE IF NOT EXISTS public.services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  tagline          TEXT,
  description      TEXT,
  long_description TEXT,
  cover_image_url  TEXT,
  icon_key         TEXT,
  features         JSONB DEFAULT '[]',
  pricing_hint     TEXT,
  sort_order       INTEGER DEFAULT 0,
  published        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  company      TEXT,
  service_type TEXT,
  budget_range TEXT,
  message      TEXT,
  status       TEXT DEFAULT 'new',
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hero_videos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_id       TEXT NOT NULL,
  title            TEXT NOT NULL,
  slide_eyebrow    TEXT,
  slide_headline   TEXT,
  slide_headline_em  TEXT,
  slide_subheadline  TEXT,
  sort_order       INTEGER DEFAULT 0,
  active           BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_portfolio_published ON public.portfolio_items(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_category  ON public.portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured  ON public.portfolio_items(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_published      ON public.blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_slug           ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(published);
CREATE INDEX IF NOT EXISTS idx_quotes_status       ON public.quote_requests(status, created_at DESC);

-- ── updated_at trigger ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_portfolio_updated_at ON public.portfolio_items;
CREATE TRIGGER set_portfolio_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_blog_updated_at ON public.blog_posts;
CREATE TRIGGER set_blog_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security ───────────────────────────────────────

ALTER TABLE public.hero_videos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings    ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    (COALESCE(NULLIF(current_setting('request.jwt.claims',true),''),'{}')::jsonb->'app_metadata'->>'role')='admin'
    OR (COALESCE(NULLIF(current_setting('request.jwt.claims',true),''),'{}')::jsonb->'user_metadata'->>'role')='admin',
    false
  );
$$;

DO $$ BEGIN
  -- hero_videos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_videos' AND policyname='public_read_hero_videos') THEN
    CREATE POLICY "public_read_hero_videos" ON public.hero_videos FOR SELECT TO anon, authenticated USING (active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_videos' AND policyname='admin_all_hero_videos') THEN
    CREATE POLICY "admin_all_hero_videos" ON public.hero_videos TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  -- portfolio
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='portfolio_items' AND policyname='public_read_portfolio') THEN
    CREATE POLICY "public_read_portfolio" ON public.portfolio_items FOR SELECT TO anon, authenticated USING (published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='portfolio_items' AND policyname='admin_all_portfolio') THEN
    CREATE POLICY "admin_all_portfolio" ON public.portfolio_items TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  -- blog
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='public_read_blog') THEN
    CREATE POLICY "public_read_blog" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='admin_all_blog') THEN
    CREATE POLICY "admin_all_blog" ON public.blog_posts TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  -- services
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='services' AND policyname='public_read_services') THEN
    CREATE POLICY "public_read_services" ON public.services FOR SELECT TO anon, authenticated USING (published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='services' AND policyname='admin_all_services') THEN
    CREATE POLICY "admin_all_services" ON public.services TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  -- testimonials
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='public_read_testimonials') THEN
    CREATE POLICY "public_read_testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='admin_all_testimonials') THEN
    CREATE POLICY "admin_all_testimonials" ON public.testimonials TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  -- team
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='public_read_team') THEN
    CREATE POLICY "public_read_team" ON public.team_members FOR SELECT TO anon, authenticated USING (published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='admin_all_team') THEN
    CREATE POLICY "admin_all_team" ON public.team_members TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  -- quotes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quote_requests' AND policyname='public_insert_quotes') THEN
    CREATE POLICY "public_insert_quotes" ON public.quote_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quote_requests' AND policyname='admin_all_quotes') THEN
    CREATE POLICY "admin_all_quotes" ON public.quote_requests TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  -- site_settings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='public_read_settings') THEN
    CREATE POLICY "public_read_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='admin_all_settings') THEN
    CREATE POLICY "admin_all_settings" ON public.site_settings TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
