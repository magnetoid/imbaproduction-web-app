# IMBA-CMS — Modular Architecture (Core + Plugin/Template Contract)

**Date:** 2026-06-02
**Status:** Approved design — ready for implementation planning
**Scope:** Sub-project 1 of the IMBA-CMS effort — the kernel, the plugin/template contract, and extraction of all *currently implemented* features into plugins.

---

## 1. Goal

Rebuild the `imbaproduction-web-app` monolith into **IMBA-CMS**: a standalone, modular CMS in its own repo that uses **templates** and **plugins** as separate, independently reusable units, serving as the central base for all of Marko's future projects.

A new project consumes IMBA-CMS by composing `@imba/core` + a chosen set of `@imba/plugin-*` + one `@imba/template-*`.

## 2. Decisions (locked during brainstorming)

| # | Decision | Choice |
|---|---|---|
| D1 | Consumption model | **Monorepo of packages** (pnpm workspaces + Turborepo); build-time composition; publish to npm later |
| D2 | Migration path | **Incremental extraction** — keep `apps/imbaproduction` shippable at every step |
| D3 | Data layer | **Standardize on self-hosted Supabase, one seam** — `core.db`; plugins never import `@supabase/*` directly; each plugin owns its migrations/RLS/types |
| D4 | First milestone scope | **Kernel + ALL implemented features extracted** + the IMBA template (one spec) |
| D5 | Plugin model | **Approach A** — `definePlugin()` manifests, explicit `createCMS({template, plugins:[...]})`, one package per feature + shared `@imba/ui` |

**Reality check baked into the design:** The "AI CRM" described in the old README is largely aspirational — there is no `admin/crm/` folder and nothing imports `lib/ai.ts`. So "all features" means all **built** features. `plugin-crm` is *designed for* but **not** part of this extraction.

## 3. Monorepo layout

```
imba-cms/                          (new standalone repo)
├── pnpm-workspace.yaml            pnpm workspaces + Turborepo pipelines
├── turbo.json
├── packages/
│   ├── core/                      @imba/core      — the kernel
│   ├── ui/                        @imba/ui        — shadcn primitives + PageHero/Pill*/LogoStrip
│   ├── tsconfig/  eslint-config/  tailwind-preset/   shared tooling configs
│   ├── plugin-blog/               @imba/plugin-blog
│   ├── plugin-portfolio/  plugin-media/  plugin-team/
│   ├── plugin-services/   plugin-testimonials/  plugin-hero/
│   ├── plugin-quotes/     plugin-seo/  plugin-translations/  plugin-import/
│   └── template-cinema/           @imba/template-cinema (current IMBA look)
├── apps/
│   └── imbaproduction/            createCMS({template, plugins, site}) — thin shell
└── supabase/
    └── functions/                 Deno edge fns (send-email, ai-proxy, stripe-*, calcom-webhook)
```

**Dependency rule (one direction only):** `app → template → plugins → core ← ui`.
Core depends on nothing IMBA-specific. Plugins depend on `core` + `ui`. Templates depend on `core` + `ui` + the plugins they skin. The app only composes.

## 4. `@imba/core` — the kernel

Owns everything reusable and nothing IMBA-specific:

- **`createCMS(config)`** — collects plugin/template manifests, validates them, builds the registries, returns a `<Router>` plus the composed migration list.
- **Registries** built at boot: public routes, admin pages + nav groups, settings, i18n namespaces, dashboard widgets, migrations.
- **Data seam — `core.db`**: the single configured Supabase client. Carries forward the existing build-time-URL → `/supabase` nginx same-origin fallback. Plugins import `db` from core, never `@supabase/*`.
- **`core.auth`**: GoTrue wrapper (`session`, `signIn`, `signOut`, `isAdmin`) — generalizes today's `AdminLayout` gate.
- **Admin shell + Dashboard + SiteSettings**: the admin chrome, the auth gate, and a Dashboard that aggregates plugin-contributed widgets.
- **i18n runtime** (react-i18next) + `LanguageSwitcher`; locales are open-ended (EN/SR today).
- **Migration runner CLI** (`imba migrate`): generalizes the current `scripts/migrate.sh` — collects each plugin's `migrations/` from the composed set, topo-sorts by dependency then version, applies via `docker exec` into `supabase-db`, tracks applied IDs in `schema_migrations`.

## 5. Plugin contract

```ts
export interface Plugin {
  name: string                       // 'blog' — unique, validated
  version: string
  dependsOn?: string[]               // ['media']
  tablePrefix?: string               // 'blog_' — collision-checked
  routes?: RouteDef[]                // public: { path, element, seo? }
  admin?: { nav: NavItem; pages: RouteDef[] }
  migrations?: { id: string; sql: string }[]   // id 'blog.V001' — namespaced
  settings?: { schema: ZodSchema; panel: Component }   // stored in cms_settings
  i18n?: Record<Locale, Resource>    // namespace = plugin name
  dashboard?: WidgetDef[]
  seed?: (ctx: PluginContext) => Promise<void>
  edgeFunctions?: string[]           // declared deps, e.g. ['send-email']
  register?: (ctx: PluginContext) => void   // optional imperative hook
}
export function definePlugin(p: Plugin): Plugin
```

A plugin = one feature's **public components + admin pages + DB migrations + settings + i18n + seed**, fully self-contained. **Plugins own their feature's default public route components**; templates skin them.

`PluginContext` (passed to `register`/`seed`) exposes: `db`, `auth`, `config` (SiteConfig), `t` (i18n), and `registerDashboardWidget()`.

## 6. Template contract

```ts
export interface Template {
  name: string
  tailwindPreset: Partial<Config>    // tokens: ember/cyber/ink/gold + HUD utilities
  layouts: { Public: Component; Admin?: Component }   // Nav/Footer/skip-link chrome
  pages?: RouteDef[]                 // bespoke marketing pages: Home, About, Contact, Pricing
  overrides?: Record<string, Component>   // re-skin a plugin's public slot (e.g. BlogPost)
  expects?: string[]                 // plugin names it assumes present
}
export function defineTemplate(t: Template): Template
```

**The split that matters:** bespoke marketing pages (Home, About, Contact, Pricing) live in the **template**; feature pages (Blog, Work, Services, Reviews) come from **plugins** and are *skinned* by the template via tokens + optional `overrides`.

## 7. Data layer & migrations

- One seam: `core.db`. A core base migration (`core.V001`) creates `schema_migrations`, the shared `is_admin()` function, `site_settings`, and `cms_settings`.
- Each plugin ships `migrations/*.sql` with a **table prefix** (`blog_`, `portfolio_`, …). Core validates prefixes don't collide and that every write policy uses the shared `is_admin()`.
- Public tables keep anon `SELECT`; writes require `is_admin()` — same RLS model as today, owned per-plugin.
- The runner applies migrations in dependency-topological then version order, recording each `id` in `schema_migrations` and skipping already-applied IDs (carrying forward the current `migrate.sh` `--dry-run` / `--status` ergonomics).

## 8. Auth & admin shell

GoTrue stays the auth provider. `core.auth` + the core admin shell replace the bespoke `AdminLayout` gate; plugins inject their admin pages/nav into the shell's registry. Login UI lives in core. RLS `is_admin()` continues to enforce writes server-side.

## 9. Feature → package mapping (the full extraction)

| Package | From today's code | Owns (tables) |
|---|---|---|
| `@imba/core` | AdminLayout, Dashboard, SiteSettings, supabase client, i18n, utils, view-transitions | `schema_migrations`, `site_settings`, `cms_settings`, `is_admin()` |
| `@imba/ui` | `components/ui/*`, PageHero, Pill*, ClientLogoStrip | — |
| `plugin-blog` | Blog, BlogPost, BlogAdmin, BlogCategoriesAdmin, BlogPostEdit, TiptapEditor, blog-seed-data | `blog_*` |
| `plugin-portfolio` | Work, PortfolioAdmin, PortfolioEdit | `portfolio_*` |
| `plugin-media` | MediaAdmin | `media_*` |
| `plugin-team` | TeamAdmin, TeamMemberEdit (+ TeamSection for About) | `team_*` |
| `plugin-services` | Services, ServicePage, ServicesAdmin, ServiceEdit | `services_*` |
| `plugin-testimonials` | Reviews, TestimonialsAdmin, TestimonialEdit | `testimonials_*` |
| `plugin-hero` | HeroVideosAdmin, HeroVideoEdit (+ Hero for Home) | `hero_*` |
| `plugin-quotes` | QuoteModal, QuoteModalContext, Contact form, QuoteRequests | `quote_*` (uses `send-email`) |
| `plugin-seo` | SEOManager, Seo, robots/llms/sitemap | `seo_*` |
| `plugin-translations` | TranslationsAdmin, LanguageSwitcher wiring | `translations_*` |
| `plugin-import` | ImportAdmin (WP XML) — `dependsOn: [blog, media]` | — |
| `template-cinema` | Nav, Footer, Home, About, Contact, Pricing, tokens, HUD classes | — |
| `apps/imbaproduction` | `main.tsx`, `App.tsx` → `createCMS({...})` + branding | — |

## 10. Config & de-branding

Hardcoded IMBA strings (`site-settings.ts`, `Seo.tsx`, `Footer.tsx`, `QuoteModal.tsx`) move into a single `SiteConfig` passed to `createCMS` (name, domain, logo, social, contact, default locale). No plugin or template hardcodes "Imba".

## 11. Edge functions

Stay Deno, at repo-root `supabase/functions/`, deployed via the Supabase CLI. Plugins only **declare** the functions they need (`edgeFunctions: ['send-email']`); the app knows what to deploy. `ai-proxy`, `stripe-*`, `calcom-webhook` stay parked for the future CRM plugin.

## 12. Tooling

pnpm workspaces + Turborepo (`build` / `lint` / `typecheck` / `dev` pipelines); shared `@imba/tsconfig`, `@imba/eslint-config`, `@imba/tailwind-preset`. Vite (in the app) resolves workspace packages. Lint stays zero-warnings; `tsc` still gates the build.

## 13. Testing *(new — repo currently has none)*

Introduce **Vitest + React Testing Library**. Core gets real unit tests for the parts that must not break: **manifest validation, registry composition, migration ordering, collision detection**. Each plugin gets a smoke test (mounts admin + public) and a migration-SQL parse check.

## 14. Error handling / validation

`createCMS` fails fast at boot with clear messages on: duplicate plugin names, duplicate route/admin paths, missing `dependsOn`, `tablePrefix` collisions. The migration runner rejects duplicate migration IDs and reports unresolved dependency order.

## 15. Out of scope (this spec) / future

- **`plugin-crm`** — no code exists to extract; the contract is designed so it slots in later (its edge functions already parked).
- Runtime/DB-driven plugin toggling, npm publishing/release pipeline, multi-backend data adapters — all deferred.

## 16. Risks & mitigations

1. **"All features at once" validates the contract late** → the implementation plan extracts **`plugin-blog` first** as the contract proof, keeps `apps/imbaproduction` green, then fans out the rest against the proven pattern.
2. **Tailwind theming across packages** (shared preset + template token overrides) needs care to avoid style drift.
3. **Incremental extraction discipline** — the app must build and run after every plugin moves.
4. **`.mcp.json` portability** (separate, minor) — the generated config pins an absolute `--root`; revisit for the new repo so it's machine-independent.

## 17. Decomposition roadmap (beyond this spec)

| Sub-project | Deliverable |
|---|---|
| **1 (this spec)** | Core kernel + plugin/template contract + all built features extracted + `template-cinema` + `apps/imbaproduction` |
| 2 | New consumer templates + per-plugin polish; optional npm publishing/release pipeline |
| 3 | `plugin-crm` (AI CRM) greenfield on the proven contract — `ai-proxy`, `stripe-*`, `calcom-webhook`, leads/proposals/invoices |
| 4 | Optional: runtime/DB-driven plugin & theme toggling (WordPress-style admin) |
