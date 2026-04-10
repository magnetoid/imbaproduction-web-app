-- ═══════════════════════════════════════════════════════════
--  V010: Email/Proposal Templates + Automation feature flags
-- ═══════════════════════════════════════════════════════════

-- ── Templates table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL,  -- 'email' | 'proposal' | 'follow_up'
  name        TEXT NOT NULL,
  subject     TEXT,           -- for emails
  content     TEXT NOT NULL,
  variables   JSONB DEFAULT '[]',
  ai_generated BOOLEAN DEFAULT false,
  use_count   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_crm_templates_updated_at ON public.crm_templates;
CREATE TRIGGER set_crm_templates_updated_at
  BEFORE UPDATE ON public.crm_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.crm_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='crm_templates' AND policyname='admin_all_crm_templates') THEN
    CREATE POLICY "admin_all_crm_templates" ON public.crm_templates TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT ALL ON public.crm_templates TO authenticated, service_role;

-- ── Starter templates ────────────────────────────────────
INSERT INTO public.crm_templates (type, name, subject, content, variables) VALUES
  ('email', 'Cold outreach — brand video',
   'Quick idea for {{company}}',
   E'Hi {{name}},\n\nI noticed {{company}} is doing interesting work in your space. We recently helped a similar brand grow their video engagement by 3x with a cinematic brand film.\n\nWould you be open to a 15-minute chat about how we could do the same for you?\n\nBest,\nImba Production',
   '["{{name}}","{{company}}"]'::jsonb),

  ('email', 'Follow-up — no response',
   'Following up on {{company}}',
   E'Hi {{name}},\n\nJust wanted to bump this to the top of your inbox. We''ve got a few slots opening up next month for new brand video projects.\n\nStill interested in chatting?',
   '["{{name}}","{{company}}"]'::jsonb),

  ('proposal', 'Standard brand video proposal',
   NULL,
   E'# Video Production Proposal\n\n**Client:** {{company}}\n**Prepared for:** {{name}}\n\n## Executive Summary\nCinematic brand video to elevate {{company}}''s identity and drive measurable results.\n\n## Scope\n- Pre-production: creative brief, script, storyboard\n- Production: full crew, 1-day shoot\n- Post-production: edit, colour grade, sound design\n\n## Deliverables\n- 1x 60-90 second hero film\n- 3x social cutdowns (9:16, 1:1, 16:9)\n- Raw footage archive\n\n## Timeline\n3-4 weeks from kickoff\n\n## Investment\n$8,000 - $15,000 depending on scope\n\n## Next Steps\nReply to confirm and we''ll schedule kickoff.',
   '["{{name}}","{{company}}"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ── Add automation feature flags to crm_runtime_settings ──
ALTER TABLE public.crm_runtime_settings
  ADD COLUMN IF NOT EXISTS auto_score_on_import BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_won_on_proposal_signed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_invoice_on_won BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
