-- ═══════════════════════════════════════════════════════════
-- V004 — AI CRM tables + homepage_featured on portfolio_items
-- ═══════════════════════════════════════════════════════════

-- Add homepage_featured flag to portfolio_items
ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS homepage_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- ── CRM Leads ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT        NOT NULL,
  email             TEXT,
  company           TEXT,
  phone             TEXT,
  website           TEXT,
  source            TEXT        NOT NULL DEFAULT 'manual',  -- manual, quote_form, referral, cold
  quote_request_id  UUID        REFERENCES public.quote_requests(id),
  stage             TEXT        NOT NULL DEFAULT 'new',     -- new, qualified, proposal, negotiation, won, lost
  value             DECIMAL(12,2),
  probability       INTEGER     NOT NULL DEFAULT 50 CHECK (probability BETWEEN 0 AND 100),
  service_interest  TEXT,
  budget_range      TEXT,
  notes             TEXT,
  ai_score          INTEGER     CHECK (ai_score BETWEEN 0 AND 100),
  ai_notes          TEXT,
  last_ai_scored_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  next_follow_up    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CRM Activities (timeline) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id    UUID        NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL DEFAULT 'note',  -- note, email, call, meeting, proposal, follow_up
  subject    TEXT,
  body       TEXT        NOT NULL DEFAULT '',
  created_by TEXT        NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE public.crm_leads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_crm_leads" ON public.crm_leads
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_manage_crm_activities" ON public.crm_activities
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

GRANT ALL ON public.crm_leads      TO service_role, authenticated;
GRANT ALL ON public.crm_activities TO service_role, authenticated;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS crm_leads_updated_at ON public.crm_leads;
CREATE TRIGGER crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
