-- ═══════════════════════════════════════════════════════════
--  V011: Stripe + Cal.com integration columns on runtime settings
--  Adds secret key storage for Stripe Checkout and Cal.com
--  source for leads table.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.crm_runtime_settings
  ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stripe_success_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stripe_cancel_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS calcom_webhook_configured BOOLEAN DEFAULT false;

-- Allow 'cal_booking' as a valid lead source (V004 enforces via stage field, source is TEXT)
-- Nothing to alter on crm_leads — source is already TEXT free-form.
