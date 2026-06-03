-- V012 — generic content version history (blog posts now; pages in Phase 2)
-- Immutable snapshots of editable content for browse + one-click restore.
-- Admin-only: there is no anonymous read of version history.

CREATE TABLE IF NOT EXISTS public.content_versions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type  TEXT NOT NULL,                 -- 'blog_post' | 'page' | …
  entity_id    UUID NOT NULL,                 -- FK kept loose (cross-table, soft)
  version      INTEGER NOT NULL,              -- monotonic per (entity_type, entity_id)
  title        TEXT,                          -- denormalized for the history list
  snapshot     JSONB NOT NULL,                -- full editable payload at save time
  is_autosave  BOOLEAN NOT NULL DEFAULT false,
  author_id    UUID,                          -- auth.uid() of the saver
  author_email TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_versions_entity_idx
  ON public.content_versions (entity_type, entity_id, version DESC);

-- Allocate the next version number atomically for an entity.
CREATE OR REPLACE FUNCTION public.next_content_version(p_entity_type TEXT, p_entity_id UUID)
RETURNS INTEGER
LANGUAGE sql
AS $$
  SELECT COALESCE(MAX(version), 0) + 1
  FROM public.content_versions
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
$$;

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='content_versions' AND policyname='admin_all_content_versions'
  ) THEN
    CREATE POLICY "admin_all_content_versions"
      ON public.content_versions
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT ALL ON public.content_versions TO authenticated, service_role;
