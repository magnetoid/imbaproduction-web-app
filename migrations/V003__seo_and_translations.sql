-- ═══════════════════════════════════════════════════════════
--  V003: SEO per-page settings + translations table
--  Safe to re-run (idempotent)
-- ═══════════════════════════════════════════════════════════

-- ── Per-page SEO overrides ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seo_pages (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path           TEXT NOT NULL UNIQUE,
  title          TEXT,
  description    TEXT,
  og_title       TEXT,
  og_description TEXT,
  og_image       TEXT,
  canonical      TEXT,
  noindex        BOOLEAN DEFAULT false,
  structured_data JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Translations ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.translations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locale     TEXT NOT NULL,
  namespace  TEXT NOT NULL DEFAULT 'common',
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (locale, namespace, key)
);

CREATE INDEX IF NOT EXISTS idx_translations_locale ON public.translations(locale, namespace);
CREATE INDEX IF NOT EXISTS idx_seo_pages_path      ON public.seo_pages(path);

-- ── updated_at triggers ──────────────────────────────────────
DROP TRIGGER IF EXISTS set_seo_pages_updated_at ON public.seo_pages;
CREATE TRIGGER set_seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_translations_updated_at ON public.translations;
CREATE TRIGGER set_translations_updated_at
  BEFORE UPDATE ON public.translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.seo_pages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='seo_pages' AND policyname='public_read_seo_pages') THEN
    CREATE POLICY "public_read_seo_pages" ON public.seo_pages FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='seo_pages' AND policyname='admin_all_seo_pages') THEN
    CREATE POLICY "admin_all_seo_pages" ON public.seo_pages TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='translations' AND policyname='public_read_translations') THEN
    CREATE POLICY "public_read_translations" ON public.translations FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='translations' AND policyname='admin_all_translations') THEN
    CREATE POLICY "admin_all_translations" ON public.translations TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON public.seo_pages, public.translations TO anon;
GRANT ALL    ON public.seo_pages, public.translations TO authenticated, service_role;
