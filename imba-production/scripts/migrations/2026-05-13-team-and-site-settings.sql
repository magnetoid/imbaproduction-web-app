-- Two new CMS surfaces: team members and global site settings.
--
-- 1) team_members      — drives About > "The team" section
-- 2) site_settings     — flat key/value store (JSONB) for footer, social,
--                         contact info, and other globally-shared copy
--
-- Both tables are idempotent. Run once in the Supabase SQL editor.

-- ── team_members ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  role         TEXT,
  bio          TEXT,
  photo_url    TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  sort_order   INTEGER DEFAULT 0,
  published    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_published_sort
  ON team_members (published, sort_order);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Public can read published team members.
DROP POLICY IF EXISTS "team_members_public_read" ON team_members;
CREATE POLICY "team_members_public_read"
  ON team_members FOR SELECT
  USING (published = TRUE);

-- Authenticated users (admins) have full access.
DROP POLICY IF EXISTS "team_members_admin_all" ON team_members;
CREATE POLICY "team_members_admin_all"
  ON team_members FOR ALL
  TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- Seed two founders if the table is empty (matches the hardcoded
-- About.tsx fallback so the public page looks the same before and
-- after the migration).
INSERT INTO team_members (name, slug, role, bio, photo_url, social_links, sort_order, published)
SELECT * FROM (VALUES
  (
    'Ljubica Jevremovic',
    'ljubica-jevremovic',
    'Partner & Creative Director',
    'A visionary video producer who has worked for leading Silicon Valley brands. The creative engine of Imba Production — she brings cinematic craft and bold storytelling to every project.',
    '/team/ljubica.jpg',
    '{"linkedin":"https://linkedin.com/in/ljubica-jevremovic","instagram":"https://instagram.com/imbaproduction"}'::jsonb,
    0,
    TRUE
  ),
  (
    'Marko Tiosavljevic',
    'marko-tiosavljevic',
    'Partner & Marketing Strategist',
    '20+ years in creative and digital marketing. Ensures every video is built around a clear business strategy — driving leads, sales, and brand equity for clients worldwide.',
    '/team/marko.jpg',
    '{"linkedin":"https://linkedin.com/in/marko-tiosavljevic","instagram":"https://instagram.com/imbaproduction"}'::jsonb,
    1,
    TRUE
  )
) AS seed(name, slug, role, bio, photo_url, social_links, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM team_members);


-- ── site_settings ───────────────────────────────────────────────────────
-- Flat key/value store. Values are JSONB so they can hold strings,
-- objects, or arrays without further schema work. One row per key.

CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON site_settings;
CREATE POLICY "site_settings_public_read"
  ON site_settings FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "site_settings_admin_write" ON site_settings;
CREATE POLICY "site_settings_admin_write"
  ON site_settings FOR ALL
  TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- Seed default keys that match the current hardcoded copy.
INSERT INTO site_settings (key, value) VALUES
  ('contact_email',    '"hello@imbaproduction.com"'::jsonb),
  ('contact_address',  '{"line1":"007 N Orange St, 4th Floor","line2":"Suite #3601","city":"Wilmington","region":"DE","postal":"19801","country":"United States"}'::jsonb),
  ('contact_response', '"We respond to all project enquiries within 24 hours, Monday to Friday."'::jsonb),
  ('footer_tagline',   '"Video production that drives revenue, not just views. Cinematic craft, AI-speed delivery, built around your business goals."'::jsonb),
  ('footer_services',  '[
    {"label":"Brand Video","href":"/services/brand-video"},
    {"label":"AI Video","href":"/services/ai-video"},
    {"label":"Product Video","href":"/services/product-video"},
    {"label":"Social Video","href":"/services/social-video"},
    {"label":"Post Production","href":"/services/post-production"},
    {"label":"eLearning","href":"/services/elearning-video"}
  ]'::jsonb),
  ('footer_company',   '[
    {"label":"About Us","to":"/about"},
    {"label":"Our Work","to":"/work"},
    {"label":"Reviews","to":"/reviews"},
    {"label":"Blog","to":"/blog"},
    {"label":"Contact","to":"/contact"},
    {"label":"Careers","to":"/about"}
  ]'::jsonb),
  ('social_links',     '[
    {"label":"IG","name":"Instagram","href":"https://instagram.com/imbaproduction"},
    {"label":"YT","name":"YouTube","href":"https://youtube.com/channel/UCV4zBHquBoo4NLw0tMi2ZKQ"},
    {"label":"TK","name":"TikTok","href":"https://tiktok.com/@imbaproduction"},
    {"label":"LI","name":"LinkedIn","href":"https://linkedin.com/company/imba-production"},
    {"label":"X","name":"X / Twitter","href":"https://twitter.com/productionimba"},
    {"label":"FV","name":"Fiverr","href":"https://fiverr.com/imbaproduction"}
  ]'::jsonb)
ON CONFLICT (key) DO NOTHING;
