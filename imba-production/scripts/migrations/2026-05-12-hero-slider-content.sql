-- Hero slider content — make slide image and CTA buttons editable from the admin.
--
-- Adds five optional TEXT columns to hero_videos:
--   slide_image_url            — custom background image (falls back to YouTube thumb)
--   slide_primary_cta_label    — primary button text   (default: "See our work")
--   slide_primary_cta_href     — primary button link   (default: /work)
--   slide_secondary_cta_label  — ghost button text     (default: "Start a project")
--   slide_secondary_cta_href   — ghost button link     (default: /contact)
--
-- All columns are nullable. Existing rows continue to render unchanged because
-- the Home component falls back to the previous hard-coded defaults when a
-- field is empty.
--
-- Safe to run more than once thanks to IF NOT EXISTS.

ALTER TABLE hero_videos
  ADD COLUMN IF NOT EXISTS slide_image_url            TEXT,
  ADD COLUMN IF NOT EXISTS slide_primary_cta_label    TEXT,
  ADD COLUMN IF NOT EXISTS slide_primary_cta_href     TEXT,
  ADD COLUMN IF NOT EXISTS slide_secondary_cta_label  TEXT,
  ADD COLUMN IF NOT EXISTS slide_secondary_cta_href   TEXT;
