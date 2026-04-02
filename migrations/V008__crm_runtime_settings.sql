-- V008 — centralized CRM runtime settings

CREATE TABLE IF NOT EXISTS public.crm_runtime_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  anthropic_model TEXT DEFAULT 'claude-sonnet-4-20250514',
  anthropic_temperature NUMERIC DEFAULT 0.2,
  smtp_host TEXT DEFAULT '',
  smtp_port TEXT DEFAULT '587',
  smtp_secure BOOLEAN DEFAULT false,
  smtp_username TEXT DEFAULT '',
  smtp_password TEXT DEFAULT '',
  smtp_from_name TEXT DEFAULT 'Imba Production',
  smtp_from_email TEXT DEFAULT '',
  ai_outreach_tone TEXT DEFAULT 'professional',
  ai_auto_enrich BOOLEAN DEFAULT true,
  ai_inbox_auto_categorize BOOLEAN DEFAULT true,
  company_name TEXT DEFAULT 'Imba Production',
  company_description TEXT DEFAULT 'Cinematic video production powered by AI strategy.',
  usp TEXT DEFAULT 'We combine human creativity with AI to produce cinematic-quality videos at scale.',
  scheduling_url TEXT DEFAULT '',
  lead_sources_enabled JSONB DEFAULT '["manual","quote_form","ai_search"]'::jsonb,
  outreach_daily_limit INTEGER DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.crm_runtime_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.crm_runtime_settings
  ADD COLUMN IF NOT EXISTS ai_outreach_tone TEXT DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS ai_auto_enrich BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_inbox_auto_categorize BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT 'Imba Production',
  ADD COLUMN IF NOT EXISTS company_description TEXT DEFAULT 'Cinematic video production powered by AI strategy.',
  ADD COLUMN IF NOT EXISTS usp TEXT DEFAULT 'We combine human creativity with AI to produce cinematic-quality videos at scale.',
  ADD COLUMN IF NOT EXISTS scheduling_url TEXT DEFAULT '';

UPDATE public.crm_runtime_settings
SET
  ai_outreach_tone = COALESCE(ai_outreach_tone, 'professional'),
  ai_auto_enrich = COALESCE(ai_auto_enrich, true),
  ai_inbox_auto_categorize = COALESCE(ai_inbox_auto_categorize, true),
  company_name = COALESCE(NULLIF(company_name, ''), 'Imba Production'),
  company_description = COALESCE(NULLIF(company_description, ''), 'Cinematic video production powered by AI strategy.'),
  usp = COALESCE(NULLIF(usp, ''), 'We combine human creativity with AI to produce cinematic-quality videos at scale.'),
  scheduling_url = COALESCE(scheduling_url, ''),
  updated_at = NOW()
WHERE id = 1;

ALTER TABLE public.crm_runtime_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='crm_runtime_settings' AND policyname='admin_all_crm_runtime_settings'
  ) THEN
    CREATE POLICY "admin_all_crm_runtime_settings"
      ON public.crm_runtime_settings
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT ALL ON public.crm_runtime_settings TO authenticated, service_role;
