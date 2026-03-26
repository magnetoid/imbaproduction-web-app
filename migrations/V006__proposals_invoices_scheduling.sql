-- ═══════════════════════════════════════════════════════════
--  V006: Proposals, Invoices & Scheduling
--  CRM deal-closing pipeline: proposals → e-sign → invoices
-- ═══════════════════════════════════════════════════════════

-- ── 1. Proposals ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_proposals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id         UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,           -- markdown/HTML proposal body
  amount          DECIMAL(12,2),           -- total proposed amount
  status          TEXT NOT NULL DEFAULT 'draft',  -- draft, sent, viewed, signed, declined, expired
  valid_until     DATE,
  sent_at         TIMESTAMPTZ,
  signed_at       TIMESTAMPTZ,
  ai_generated    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Invoices ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id         UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  proposal_id     UUID REFERENCES public.crm_proposals(id) ON DELETE SET NULL,
  invoice_number  TEXT NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  tax             DECIMAL(12,2) DEFAULT 0,
  total           DECIMAL(12,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  status          TEXT NOT NULL DEFAULT 'draft',  -- draft, sent, paid, overdue, cancelled
  due_date        DATE,
  paid_at         TIMESTAMPTZ,
  stripe_invoice_id   TEXT,                -- for future Stripe integration
  stripe_payment_url  TEXT,                -- Stripe hosted invoice URL
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Triggers ──────────────────────────────────────────────
DROP TRIGGER IF EXISTS set_crm_proposals_updated_at ON public.crm_proposals;
CREATE TRIGGER set_crm_proposals_updated_at
  BEFORE UPDATE ON public.crm_proposals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_crm_invoices_updated_at ON public.crm_invoices;
CREATE TRIGGER set_crm_invoices_updated_at
  BEFORE UPDATE ON public.crm_invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS (Admin Only) ─────────────────────────────────────
ALTER TABLE public.crm_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_invoices  ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='crm_proposals' AND policyname='admin_all_crm_proposals') THEN
    CREATE POLICY "admin_all_crm_proposals" ON public.crm_proposals TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='crm_invoices' AND policyname='admin_all_crm_invoices') THEN
    CREATE POLICY "admin_all_crm_invoices" ON public.crm_invoices TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT ALL ON public.crm_proposals, public.crm_invoices TO authenticated, service_role;
