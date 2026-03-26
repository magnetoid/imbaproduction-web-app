# imba.production — Web App

> Cinematic video production powered by AI strategy.
> Full-stack web app + AI-powered CRM, built for **imbaproduction.com**.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Backend | Self-hosted Supabase (PostgreSQL + PostgREST + GoTrue + Kong) |
| Auth | GoTrue (Supabase Auth) — JWT-based admin sessions |
| Cache | Redis 7 (session / rate limiting) |
| Infra | Docker Compose + Traefik reverse proxy |
| Deploy | Coolify (or any Docker host) |
| AI | Anthropic Claude API (claude-opus-4-6) |
| DnD | @hello-pangea/dnd (Kanban drag-and-drop) |
| i18n | react-i18next (EN/SR) |
| SEO | react-helmet-async + Schema.org JSON-LD |
| Email | Supabase Edge Function → SMTP relay |

---

## Project Structure

```
imbaproduction-web-app/
├── imba-production/          # React SPA (Vite)
│   ├── src/
│   │   ├── pages/            # Public routes
│   │   │   ├── Home.tsx
│   │   │   ├── Work.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Blog.tsx / BlogPost.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── Reviews.tsx
│   │   ├── admin/            # CMS admin panel
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminLanding.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── HeroVideosAdmin.tsx
│   │   │   ├── PortfolioAdmin.tsx
│   │   │   ├── BlogAdmin.tsx
│   │   │   ├── BlogCategoriesAdmin.tsx
│   │   │   ├── MediaAdmin.tsx
│   │   │   ├── TestimonialsAdmin.tsx
│   │   │   ├── QuoteRequests.tsx
│   │   │   ├── ImportAdmin.tsx
│   │   │   ├── TranslationsAdmin.tsx
│   │   │   └── crm/          # AI CRM
│   │   │       ├── CRMDashboard.tsx
│   │   │       ├── LeadDetail.tsx
│   │   │       ├── AILeadSearcher.tsx
│   │   │       ├── AIOutreach.tsx
│   │   │       ├── AIInbox.tsx
│   │   │       ├── AIAnalytics.tsx
│   │   │       ├── AISettings.tsx
│   │   │       ├── SEOManager.tsx
│   │   │       ├── Proposals.tsx
│   │   │       └── Invoices.tsx
│   │   ├── components/       # Nav, Footer, Seo, QuoteModal…
│   │   ├── contexts/         # QuoteModalContext
│   │   ├── lib/              # supabase.ts client + types
│   │   └── i18n/             # EN/SR translations
│   ├── public/
│   │   ├── robots.txt        # AI crawler rules (GPTBot, Claude, Perplexity…)
│   │   ├── llms.txt          # Context file for AI assistants
│   │   └── sitemap.xml
│   └── Dockerfile
├── migrations/               # Sequential SQL migrations
│   ├── V001__initial_schema.sql
│   ├── V002__blog_cms_and_media.sql
│   ├── V003__seo_and_translations.sql
│   ├── V004__crm_and_homepage_featured.sql
│   ├── V005__ai_crm_modules.sql
│   └── V006__proposals_invoices_scheduling.sql
├── supabase/
│   └── functions/
│       └── send-email/       # Deno Edge Function — SMTP relay
│           └── index.ts
├── scripts/
│   └── kong.yml              # Kong API gateway config
├── docker-compose.yml
└── init.sql                  # DB bootstrap (roles, extensions)
```

---

## Public Routes

| Route | Page |
|-------|------|
| `/` | Home — hero reel, portfolio mosaic, services, stats |
| `/work` | Portfolio grid with category filters |
| `/services` | Services overview |
| `/services/:slug` | Individual service detail pages |
| `/about` | Team and company story |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog post |
| `/contact` | Contact form |
| `/reviews` | Client testimonials (Supabase + fallback) |

---

## Admin CMS — `/admin/cms`

Accessible at `/admin` → **imba.cms**. JWT-authenticated.

| Route | Section |
|-------|---------|
| `/admin/dashboard` | Stats overview |
| `/admin/hero-videos` | Hero reel slides (YouTube IDs, copy) |
| `/admin/portfolio` | Portfolio items (video, category, tags) |
| `/admin/media` | Media library |
| `/admin/blog` | Blog posts (rich editor, AI generator) |
| `/admin/blog/categories` | Blog categories |
| `/admin/testimonials` | Client testimonials (star ratings, publish/feature toggles) |
| `/admin/import` | WordPress XML import / export |
| `/admin/seo` | SEO settings per page |
| `/admin/translations` | EN/SR copy editor |
| `/admin/quotes` | Quote request inbox |

---

## AI CRM — `/admin/crm`

Accessible at `/admin` → **imba.crm**. Powered by **Claude claude-opus-4-6**.

### Pipeline (`/admin/crm`)
Drag-and-drop Kanban board with stages: **New → Qualified → Proposal Sent → Negotiation → Won / Lost**

- **Drag-and-drop** cards between columns to move stages (powered by @hello-pangea/dnd)
- Visual feedback: column highlight on hover, card rotation while dragging
- Bulk AI scoring (scores all unscored leads)
- Stage filter chips with value totals
- Win rate stat card
- Overdue follow-up alerts (pulsing red dot)
- Arrow buttons as quick-move fallback

### Lead Detail (`/admin/crm/:id`)
- Stage stepper breadcrumb (click to jump stages)
- Activity log (note / email / call / meeting / proposal / follow-up)
- Next follow-up date with overdue warning
- Last contacted auto-updated on contact activities
- **AI Email Generator** — Claude writes a personalized outreach email
- **AI Proposal Generator** — Claude drafts a proposal outline
- Copy-to-clipboard with "Copied!" feedback

### AI Lead Finder (`/admin/crm/ai-search`)
- Describe target: industry, location, company size, video goal, keywords, count
- Claude generates realistic B2B leads with AI score (0–100) and opportunity summary
- Import individually or bulk import all
- Search history saved to DB

### AI Outreach (`/admin/crm/outreach`)
- One-click AI email generation per lead (fully personalized cold outreach)
- **Auto-appends calendar booking link** if scheduling URL is configured in Settings
- Approval workflow: **Draft → Approve → Send**
- Send via SMTP Edge Function or opens mail client as fallback
- Status tracking: draft / approved / queued / sent / opened / replied / bounced
- Manual compose, inline editing, copy-to-clipboard

### Inbox (`/admin/crm/inbox`)
- Log inbound/outbound email messages, link to CRM leads
- AI analyzes **sentiment** (positive / neutral / negative) and **category** (question / objection / meeting request / bounce)
- AI generates a **suggested reply** — open in mail client or copy
- Unread badge, archive, search, direction filters

### Proposals (`/admin/crm/proposals`)
- **AI-generated proposals** from lead context (company, service, budget, AI assessment)
- Full markdown proposals: Executive Summary, Scope, Deliverables, Timeline, Investment, Next Steps
- Status workflow: **Draft → Sent → Viewed → Signed / Declined / Expired**
- Stats dashboard: total, pending value, signed value, win rate
- Copy-to-clipboard for sending via email or e-signature tools (DocuSign, PandaDoc)

### Invoices (`/admin/crm/invoices`)
- **Auto-create from signed proposals** — one-click from "ready to invoice" bar
- Invoice number auto-generated (INV-YYMM-XXX)
- Multi-currency support (USD, EUR, GBP, SEK, NOK, DKK)
- Tax calculation, due date tracking, auto-overdue detection
- Status workflow: **Draft → Sent → Paid / Overdue / Cancelled**
- Revenue & outstanding amount dashboard
- Stripe-ready columns (`stripe_invoice_id`, `stripe_payment_url`) for future integration

### Analytics (`/admin/crm/analytics`)
- Live KPIs: total leads, avg AI score, emails sent, converted
- Email funnel visualization: sent → opened → replied
- Pipeline stage breakdown
- AI generates **5 actionable sales insights** from live data (saved to DB)

### SEO Manager (`/admin/crm/seo`)
- Per-page health scoring (title, description, OG, schema, canonical)
- SERP preview panel
- Sitemap submission checklist
- robots.txt and llms.txt status

### Settings (`/admin/crm/settings`)
- **Anthropic API key** (browser localStorage, never sent to server)
- **SMTP configuration** — host, port, credentials, from name/email, SSL toggle
- Test SMTP connection (calls Edge Function)
- AI tone, auto-enrich, auto-categorize inbox toggles
- Company profile injected into all AI prompts
- **Meeting scheduling URL** (Cal.com / Calendly) — auto-appended to AI outreach emails

---

## CRM Sidebar Navigation

```
PIPELINE
  └── Pipeline (Kanban board)

AI OUTREACH
  ├── Lead Finder
  ├── Outreach
  └── Inbox

DEAL CLOSING
  ├── Proposals
  └── Invoices

INTELLIGENCE
  ├── Analytics
  └── Settings

LEADS
  └── Quote Requests
```

---

## Database Migrations

Migrations are applied sequentially on first boot via `init.sql`.

| File | Contents |
|------|----------|
| `V001` | Core schema: portfolio, testimonials, hero_videos, quote_requests, services, team |
| `V002` | Blog CMS: posts, categories, tags, media library |
| `V003` | SEO settings, translations, schema_migrations tracker |
| `V004` | CRM pipeline: leads, activities, notes; homepage_featured flag |
| `V005` | AI CRM modules: outreach campaigns, outreach emails, inbox messages, analytics snapshots, AI settings |
| `V006` | Deal closing: proposals (AI-generated, status tracking), invoices (multi-currency, Stripe-ready) |

All tables use **Row Level Security (RLS)**. Public tables allow anonymous SELECT. All writes require `is_admin()` JWT check.

---

## Infrastructure (Docker Compose)

```
imba-web          → Vite/React app served via nginx (:9102)
supabase-kong     → API gateway, routes /supabase/* (:9100)
supabase-rest     → PostgREST REST API (:9103)
supabase-auth     → GoTrue auth service (:9104)
supabase-storage  → File storage (:9105)
supabase-studio   → Supabase Studio UI (:9101)
supabase-meta     → pg-meta (schema inspector)
supabase-db       → PostgreSQL 15 (:15432)
redis             → Cache / rate limiting (:16379)
```

Traefik handles SSL termination + automatic Let's Encrypt certificates.

---

## SMTP Edge Function

The `send-email` Supabase Edge Function handles outreach email delivery.

```bash
# Deploy
supabase link --project-ref YOUR_REF
supabase functions deploy send-email --no-verify-jwt
```

Supports:
- **smtp2go** REST API (recommended — just set host to `smtp.smtp2go.com` and password to your API key)
- Generic SMTP via `deno-smtp` (Gmail, Mailgun, custom SMTP servers)
- Automatic fallback to `mailto:` if Edge Function is not deployed

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/magnetoid/imbaproduction-web-app.git
cd imbaproduction-web-app

# 2. Start all services
docker compose up -d

# 3. Start frontend dev server
cd imba-production
npm install
npm run dev
# → http://localhost:5173

# 4. Admin panel
# → http://localhost:5173/admin
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=http://localhost:9100
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:5173
APP_DOMAIN=imbaproduction.com
POSTGRES_PASSWORD=your-pg-password
JWT_SECRET=your-32-char-secret
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

---

## SEO Features

- Schema.org JSON-LD: `WebSite + SearchAction`, `Organization`, `FAQPage`, `ItemList`, `Review`
- `robots.txt` with explicit allow rules for AI crawlers (GPTBot, Claude-Web, Perplexity, You)
- `/llms.txt` — AI assistant context file (services, pricing, contact, content policy)
- `sitemap.xml` with `lastmod` dates
- Per-page canonical URLs, OG image dimensions, Twitter cards
- Skip-to-content accessibility link
- i18n: English + Serbian

---

## Design System

Dark cinematic theme with cyber cyan technical accents.

| Token | Value | Use |
|-------|-------|-----|
| `--ember` | `#E87A2A` | Primary CTA, active nav |
| `--cyber` | `#00D4FF` | Technical accents, hover states |
| `--ink` | `#0A0A0B` | Background |
| `--smoke` | `#E8E8E8` | Body text |
| `--gold` | `#C9A96E` | Display text accents, CRM theme |

Custom classes: `.hud-card` (corner brackets), `.holo-shimmer`, `.glow-cyber`, `.glow-ember`, `.data-readout`, `.angular-divider`, `.eyebrow-cyber`

---

## License

Private — © 2025 Imba Production LLC. All rights reserved.
