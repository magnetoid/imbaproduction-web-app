-- services table for CMS-driven service detail pages.
-- One row per service. Nested arrays (features, process, portfolio, faq,
-- stats, shorts) live in JSONB columns so admins edit everything from a
-- single form without join tables.
--
-- Existing `services` rows in some installs may have a sparser schema
-- (name/description/long_description). The ADD COLUMN IF NOT EXISTS
-- statements below align it with the public site's ServiceData type
-- without losing existing data.
--
-- Idempotent. Safe to run multiple times.

CREATE TABLE IF NOT EXISTS services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  label       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS service_key TEXT,
  ADD COLUMN IF NOT EXISTS icon        TEXT,
  ADD COLUMN IF NOT EXISTS tagline     TEXT,
  ADD COLUMN IF NOT EXISTS color       TEXT,
  ADD COLUMN IF NOT EXISTS hero_desc   TEXT,
  ADD COLUMN IF NOT EXISTS stats       JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS features    JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS process     JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS portfolio   JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS shorts      JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faq         JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sort_order  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published   BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_services_published_sort
  ON services (published, sort_order);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_public_read" ON services;
CREATE POLICY "services_public_read"
  ON services FOR SELECT
  USING (published = TRUE);

DROP POLICY IF EXISTS "services_admin_all" ON services;
CREATE POLICY "services_admin_all"
  ON services FOR ALL
  TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- No SQL seed here. The admin has a "Seed from defaults" button that
-- inserts all 9 services from src/pages/services/data.ts on demand.
-- The public site falls back to data.ts if this table is empty.
