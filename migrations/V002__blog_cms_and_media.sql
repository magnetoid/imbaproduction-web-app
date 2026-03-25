-- ═══════════════════════════════════════════════════════════
--  V002: Blog CMS tables, media library, enhanced blog_posts
--  Safe to re-run (idempotent)
-- ═══════════════════════════════════════════════════════════

-- ── Blog categories ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id   UUID REFERENCES public.blog_categories(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Blog tags ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename      TEXT NOT NULL,
  original_name TEXT,
  mime_type     TEXT,
  size          INTEGER,
  url           TEXT NOT NULL,
  alt           TEXT,
  caption       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── New columns on blog_posts ────────────────────────────────
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

-- ── RLS for new tables ───────────────────────────────────────
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts_tags  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files      ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_categories' AND policyname='public_read_blog_categories') THEN
    CREATE POLICY "public_read_blog_categories" ON public.blog_categories FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_categories' AND policyname='admin_all_blog_categories') THEN
    CREATE POLICY "admin_all_blog_categories" ON public.blog_categories TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_tags' AND policyname='public_read_blog_tags') THEN
    CREATE POLICY "public_read_blog_tags" ON public.blog_tags FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_tags' AND policyname='admin_all_blog_tags') THEN
    CREATE POLICY "admin_all_blog_tags" ON public.blog_tags TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts_tags' AND policyname='public_read_posts_tags') THEN
    CREATE POLICY "public_read_posts_tags" ON public.blog_posts_tags FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts_tags' AND policyname='admin_all_posts_tags') THEN
    CREATE POLICY "admin_all_posts_tags" ON public.blog_posts_tags TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_files' AND policyname='public_read_media_files') THEN
    CREATE POLICY "public_read_media_files" ON public.media_files FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_files' AND policyname='admin_all_media_files') THEN
    CREATE POLICY "admin_all_media_files" ON public.media_files TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON public.blog_categories, public.blog_tags, public.blog_posts_tags, public.media_files TO anon;
GRANT ALL ON public.blog_categories, public.blog_tags, public.blog_posts_tags, public.media_files TO authenticated, service_role;
