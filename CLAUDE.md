# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo is split into two halves with **no root `package.json`**:

- **`imba-production/`** — the React 18 + TypeScript + Vite SPA (public site + `/admin` CMS + `/admin/crm` AI CRM). **All `npm` commands run from here, not the repo root.**
- **Repo root** — infrastructure: `docker-compose.yml`, `migrations/` (sequential SQL), `supabase/functions/` (Deno Edge Functions), `init.sql`, and `scripts/` (migration runner). There are two `docker-compose.yml` files (root and `imba-production/`); the root one runs the full Supabase stack.

## Commands

Frontend (run from `imba-production/`):

```bash
npm install
npm run dev      # Vite dev server on http://localhost:3000  (vite.config.ts sets port 3000)
npm run build    # tsc && vite build — type errors FAIL the build
npm run lint     # eslint, --max-warnings 0 (zero warnings tolerated)
npm run preview  # serve the production build
```

There is **no test runner configured** — no `test` script and no test framework in `package.json`. Don't assume `npm test` exists.

Infrastructure / database (run from repo root):

```bash
docker compose up -d                       # start Supabase stack + app
./scripts/migrate.sh                        # apply pending migrations
./scripts/migrate.sh --status               # show applied/pending
./scripts/migrate.sh --dry-run              # preview without applying
./scripts/new-migration.sh "description"    # scaffold migrations/VNNN__description.sql
```

`migrate.sh` finds the running `supabase-db-<COOLIFY_APP_ID>` Docker container, `docker exec`s `psql` into it, creates a `schema_migrations` tracking table, and applies each `migrations/V*.sql` in version order, skipping ones already recorded. It does **not** use the Supabase CLI migration system. Override the container with `COOLIFY_APP_ID=<id> ./scripts/migrate.sh`.

## Architecture

**Single-client Supabase + heavy client-side rendering.** Everything is a React SPA talking to self-hosted Supabase (PostgreSQL + PostgREST + GoTrue + Kong). There is no separate Node backend for the app — server logic lives in Postgres (RLS) and Supabase Edge Functions.

**Supabase client — `src/lib/supabase.ts`** is the hub. It exports the single `supabase` client AND all shared TypeScript types (`PortfolioItem`, `BlogPost`, `BlogCategory`, …) — types live here, not in a separate `types.ts`. The client URL is baked from `VITE_SUPABASE_URL` at build time, but **falls back to the same-origin nginx proxy at `/supabase`** when the env var is missing/placeholder, so the app works on any domain without a correct build arg.

**AI integration — `src/lib/ai.ts` (read this before touching any AI feature).** All model calls go through the **`ai-proxy` Supabase Edge Function** via `supabase.functions.invoke('ai-proxy', …)`, never directly to a provider from the browser. Use the helpers `callAIText()` / `callAIJSON()`. It is **multi-provider** (`anthropic | openai | gemini | perplexity | ollama`); the active provider/model, API keys, SMTP config, and company context all come from the **`crm_runtime_settings` DB table** (single row, `id=1`) via `getCRMRuntimeSettings()`.

> ⚠️ The root `README.md` is stale on two points: it says the dev server is on `:5173` (actual: `:3000`) and that the Anthropic key lives in "browser localStorage, never sent to server" (actual: keys live server-side in `crm_runtime_settings` and AI runs through the `ai-proxy` edge function). Trust the code.

**Routing — `src/App.tsx`** is a flat `react-router-dom` route table: public pages wrapped in `PublicLayout` (Nav/Footer + skip-link), and the entire `/admin/*` tree under `AdminLayout`. The `@/` import alias maps to `src/`.

**Admin auth has no `ProtectedRoute` component.** `src/admin/AdminLayout.tsx` *is* the gate: it calls `supabase.auth.getSession()` / `onAuthStateChange()`, and renders an inline `signInWithPassword` login card when there's no session. GoTrue issues the JWT; Postgres RLS enforces `is_admin()` on all writes (public tables allow anonymous `SELECT`). Adding an admin page = add a route inside the `AdminLayout` subtree in `App.tsx`.

**Edge Functions — root `supabase/functions/`** (Deno): `ai-proxy`, `send-email`, `calcom-webhook`, `stripe-checkout`, `stripe-webhook`. Deploy with `supabase functions deploy <name>`. (The README only documents `send-email`.)

## Conventions & stack notes

- **Styling:** Tailwind + shadcn/ui (Radix primitives in `src/components/ui/`). Design tokens and custom HUD/cinematic utility classes live in `tailwind.config.ts` / global CSS (`--ember`, `--cyber`, `--ink`, `--gold`; `.hud-card`, `.glow-cyber`, etc.).
- **i18n:** `react-i18next`, EN + SR, locales in `src/i18n/locales/`. Admin has a `TranslationsAdmin` editor.
- **Rich text:** TipTap (`@tiptap/*`) powers the blog editor.
- **CRM Kanban:** drag-and-drop uses `@hello-pangea/dnd`.
- **Data fetching:** `@tanstack/react-query` is available; most admin screens query Supabase directly.
- **SEO:** `react-helmet-async` + Schema.org JSON-LD; `public/robots.txt`, `public/llms.txt`, and `public/sitemap.xml` are maintained deliberately (AI-crawler allow rules) — keep them in sync when routes change.

## When adding a database change

1. `./scripts/new-migration.sh "what changed"` → edit the new `migrations/V*.sql`.
2. Add the table/columns to RLS with the `is_admin()` write policy + anon `SELECT` if public.
3. Add/extend the matching TypeScript interface in `src/lib/supabase.ts`.
4. `./scripts/migrate.sh` against the running stack.
