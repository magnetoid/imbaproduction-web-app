-- ═══════════════════════════════════════════════════════════
--  V005: AI CRM Modules
--  Tables for Leads, Outreach Emails, Inbox, Analytics, and Settings
-- ═══════════════════════════════════════════════════════════

-- ── 1. Leads Table (AI Lead Searcher) ──────────────────────
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name         TEXT NOT NULL,
  contact_name         TEXT,
  email                TEXT,
  phone                TEXT,
  website              TEXT,
  industry             TEXT,
  company_size         TEXT,
  ai_score             INTEGER DEFAULT 0 CHECK (ai_score BETWEEN 0 AND 100),
  ai_summary           TEXT,
  source               TEXT DEFAULT 'manual',
  status               TEXT DEFAULT 'new', -- new, qualified, contacted, converted, lost
  last_interaction_at  TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Outreach Campaigns & Emails (AI Email Generator) ────
CREATE TABLE IF NOT EXISTS public.crm_outreach_campaigns (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  objective   TEXT,
  status      TEXT DEFAULT 'draft', -- draft, active, paused, completed
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_outreach_emails (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id           UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  campaign_id       UUID REFERENCES public.crm_outreach_campaigns(id) ON DELETE SET NULL,
  subject           TEXT NOT NULL,
  body              TEXT NOT NULL,
  status            TEXT DEFAULT 'draft', -- draft, scheduled, sent, bounced, opened, replied
  scheduled_for     TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ,
  ai_generated      BOOLEAN DEFAULT false,
  ai_prompt_used    TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Inbox System ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_inbox_messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id          UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  direction        TEXT NOT NULL, -- inbound, outbound
  subject          TEXT,
  body             TEXT NOT NULL,
  from_email       TEXT,
  to_email         TEXT,
  status           TEXT DEFAULT 'unread', -- unread, read, archived
  ai_sentiment     TEXT, -- positive, neutral, negative
  ai_category      TEXT, -- question, objection, meeting_request, bounce
  ai_suggested_reply TEXT,
  received_at      TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Analytics Data (Predictive Insights) ─────────────────
CREATE TABLE IF NOT EXISTS public.crm_analytics_snapshots (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_date        DATE NOT NULL UNIQUE,
  total_leads          INTEGER DEFAULT 0,
  qualified_leads      INTEGER DEFAULT 0,
  emails_sent          INTEGER DEFAULT 0,
  emails_opened        INTEGER DEFAULT 0,
  emails_replied       INTEGER DEFAULT 0,
  meetings_booked      INTEGER DEFAULT 0,
  revenue_forecast     DECIMAL(10,2) DEFAULT 0,
  ai_insights          JSONB DEFAULT '[]', -- Array of string recommendations
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. AI Settings & Configurations ─────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_ai_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Triggers for updated_at ──────────────────────────────────

DROP TRIGGER IF EXISTS set_crm_leads_updated_at ON public.crm_leads;
CREATE TRIGGER set_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_crm_outreach_campaigns_updated_at ON public.crm_outreach_campaigns;
CREATE TRIGGER set_crm_outreach_campaigns_updated_at
  BEFORE UPDATE ON public.crm_outreach_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_crm_outreach_emails_updated_at ON public.crm_outreach_emails;
CREATE TRIGGER set_crm_outreach_emails_updated_at
  BEFORE UPDATE ON public.crm_outreach_emails
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security (Admin Only) ──────────────────────────

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_ai_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- crm_leads
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='crm_leads' AND policyname='admin_all_crm_leads') THEN
    CREATE POLICY "admin_all_crm_leads" ON public.crm_leads TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  
  -- crm_outreach_campaigns
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='crm_outreach_campaigns' AND policyname='admin_all_crm_outreach_campaigns') THEN
    CREATE POLICY "admin_all_crm_outreach_campaigns" ON public.crm_outreach_campaigns TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  
  -- crm_outreach_emails
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='crm_outreach_emails' AND policyname='admin_all_crm_outreach_emails') THEN
    CREATE POLICY "admin_all_crm_outreach_emails" ON public.crm_outreach_emails TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  -- crm_inbox_messages
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='crm_inbox_messages' AND policyname='admin_all_crm_inbox_messages') THEN
    CREATE POLICY "admin_all_crm_inbox_messages" ON public.crm_inbox_messages TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  -- crm_analytics_snapshots
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='crm_analytics_snapshots' AND policyname='admin_all_crm_analytics_snapshots') THEN
    CREATE POLICY "admin_all_crm_analytics_snapshots" ON public.crm_analytics_snapshots TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  -- crm_ai_settings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='crm_ai_settings' AND policyname='admin_all_crm_ai_settings') THEN
    CREATE POLICY "admin_all_crm_ai_settings" ON public.crm_ai_settings TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Initialize default AI settings
INSERT INTO public.crm_ai_settings (key, value, description) VALUES
  ('ai_auto_enrich', 'true'::jsonb, 'Automatically enrich new leads with AI'),
  ('ai_outreach_tone', '"professional"'::jsonb, 'Default tone for AI generated emails (professional, casual, urgent)'),
  ('ai_inbox_auto_categorize', 'true'::jsonb, 'Automatically categorize and analyze sentiment of incoming emails')
ON CONFLICT (key) DO NOTHING;

GRANT ALL ON public.crm_leads, public.crm_outreach_campaigns, public.crm_outreach_emails, public.crm_inbox_messages, public.crm_analytics_snapshots, public.crm_ai_settings TO authenticated, service_role;
