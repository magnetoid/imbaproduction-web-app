-- V013 — visual page builder (Phase 2)
-- Pages are composed in the admin with Puck and stored as a portable block-JSON
-- tree in `data`. The public site renders published pages from that JSON.

CREATE TABLE IF NOT EXISTS public.pages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL DEFAULT 'Untitled page',
  status       TEXT NOT NULL DEFAULT 'draft',         -- 'draft' | 'published'
  data         JSONB NOT NULL DEFAULT '{}'::jsonb,     -- Puck document (content/root/zones)
  seo          JSONB NOT NULL DEFAULT '{}'::jsonb,     -- { title, description, og_image }
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pages_status_slug_idx ON public.pages (status, slug);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pages' AND policyname='public_read_pages') THEN
    CREATE POLICY "public_read_pages" ON public.pages
      FOR SELECT TO anon, authenticated USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pages' AND policyname='admin_all_pages') THEN
    CREATE POLICY "admin_all_pages" ON public.pages
      TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON public.pages TO anon;
GRANT ALL ON public.pages TO authenticated, service_role;
