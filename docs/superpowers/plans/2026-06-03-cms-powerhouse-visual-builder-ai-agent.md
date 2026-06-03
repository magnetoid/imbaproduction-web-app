# IMBA CMS Powerhouse — Implementation Plan

> Goal: turn the `imba-production` admin into a **WordPress-grade-or-better CMS** with a **visual page builder** and an **in-app agentic AI page assistant**, plus **SMTP send + IMAP inbox**. CRM UI is explicitly **out of scope** (the CRM DB schema exists but stays unused). Research-backed; see citations.

Date: 2026-06-03 · Stack: React 18 + TS + Vite + Tailwind + shadcn/ui + self-hosted Supabase (Postgres/PostgREST/GoTrue/Kong) + Deno Edge Functions + multi-provider `ai-proxy`.

---

## Research summary (what the evidence says)

### Editor / content (deep-research stream 1, 24/25 claims confirmed)
- **Block editor on free TipTap**: slash-command menu via `@tiptap/suggestion`; custom node extensions = reusable blocks/cards; persist **ProseMirror JSON** (`getJSON()` → `content_json jsonb`), not HTML. Sources: [TipTap slash-commands](https://tiptap.dev/docs/examples/experiments/slash-commands), [TipTap persistence](https://tiptap.dev/docs/editor/core-concepts/persistence).
- **Draft/publish + version history**: sibling Postgres `versions` table (Payload/Ghost model) — immutable snapshots, autosave drafts newer than published, preview-before-publish, one-click restore. No paid TipTap Pro needed. Sources: [Payload versions](https://payloadcms.com/docs/versions/overview), [Ghost post history](https://ghost.org/changelog/post-history/).
- **Coverage gaps** (no confirmed claims, treat as design decisions): media-library UX, command palette, bulk ops, granular roles, multilingual, audit logs.

### Email (stream 1, medium confidence)
- `deno-imap` (JSR, Deno-native) for IMAP; `pg_cron` + `pg_net` to schedule the sync edge function; UID/UIDVALIDITY cursor per [RFC 4549](https://datatracker.ietf.org/doc/html/rfc4549); SMTP via `nodemailer` over `npm:` specifier (matches the official [Supabase send-email-smtp example](https://github.com/supabase/supabase/blob/master/examples/edge-functions/supabase/functions/send-email-smtp/index.ts)).
- **⚠️ Caveat (verified-unverified)**: `deno-imap`'s UID-cursor support was **refuted (1-2)**, and edge-runtime outbound TCP/TLS execution is **unconfirmed**. → IMAP sync may need an **external worker** instead of an edge function. Design for both.

### Visual builder (stream 2 failed on harness error → researched directly)
- **Puck** = `@puckeditor/core` **v0.21.2**, **MIT**. React-native, embeddable as a component, **portable JSON** data model, renders stored pages with `<Render config={config} data={data} />`. Tailwind-compatible, self-hosted, ready-made editor UI. Sources: [Puck GitHub](https://github.com/puckeditor/puck), [Puck + Tailwind guide](https://puckeditor.com/blog/how-to-build-a-react-page-builder-puck-and-tailwind-4).
- **craft.js / GrapesJS**: rejected — you build the entire editor UI yourself (craft.js) or it's framework-agnostic/non-React-native (GrapesJS). Puck ships the UI.
- **Payload**: MIT but a **Next.js-coupled fullstack framework**; its admin editor is **not reusable** in a Vite SPA. "Outside Next.js" = its data Local API only. Using it standalone means replacing Supabase. → **Reject grafting Payload; use Puck.** Sources: [Payload outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs), [Payload license](https://github.com/payloadcms/payload/blob/main/LICENSE.md).

### AI page agent (researched directly)
- **Pattern**: Builder.io **"agent-native"** — agent and UI share one action model; define page-edit actions once (`addBlock`, `editBlock`, `reorder`, `removeBlock`, `setProps`), expose to both UI and LLM as tools. Source: [Builder.io Visual Copilot](https://www.builder.io/c/docs/ve-visualcopilot).
- **Client**: Vercel **AI SDK** `@ai-sdk/react` `useChat` — SSE streaming, custom `api` endpoint, `onToolCall` + `addToolResult` for client-side tool execution; keys stay server-side. Source: [AI SDK useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat).
- **Security**: provider keys never touch the browser — the `useChat` `api` points at a **streaming `ai-proxy`** edge function; tools execute client-side against the Puck data model.

---

## Architecture decisions

1. **Two content systems, one versioning model.**
   - *Articles* (`blog_posts`) keep TipTap, upgraded to block JSON.
   - *Pages* (new `pages` table) use Puck block JSON.
   - Both share a generic `content_versions` table (`entity_type`, `entity_id`, snapshot JSON).
2. **Content stored as JSON, rendered by mapping to React components.** Blog: ProseMirror JSON. Pages: Puck data → `<Render>`. Keep legacy markdown `body` for back-compat during migration.
3. **AI keys stay server-side.** New `ai-proxy-stream` edge function (SSE). Tools run client-side on Puck data.
4. **IMAP sync is abstracted** behind a sync interface so it can run as an edge function *or* an external worker if `deno-imap` can't run in the sandbox.

---

## Staged roadmap (impact × effort, dependency-ordered)

### Phase 1 — WP-grade editor + admin UX (HIGH impact / LOW–MED effort, no risky deps)
- `content_versions` table (+ RLS) and a reusable `useVersions` hook.
- TipTap upgrades: `@tiptap/suggestion` slash menu, blocks (table, code block, callout/card, image-with-caption, embed/iframe, divider), bubble/floating toolbars.
- **Autosave** (debounced `getJSON()` → `content_json`), draft/publish states, "unpublished changes" indicator, preview-before-publish, version history drawer + restore.
- **Command palette** (`cmdk`) for admin nav + quick actions.
- **Bulk operations** on list screens (multi-select publish/unpublish/delete).
- Migration: `blog_posts.content_json jsonb`; render JSON on public site, fall back to markdown `body`.
- *Ships independently. No new heavy deps.*

### Phase 2 — Visual page builder (HIGH impact / MED–HIGH effort)
- `pages` table: `id, slug, title, status, published_at, data jsonb, seo jsonb, created_at, updated_at` + RLS (anon SELECT where `status='published'`, `is_admin()` write) + `content_versions` integration.
- Add `@puckeditor/core`. Build a **Puck config** mapping the site's real components/blocks (Hero, Section, Columns, RichText, Image, CTA, Gallery, ClientLogoStrip, Testimonials…) styled with existing Tailwind tokens.
- Admin: `/admin/pages` (list, new, duplicate, delete) + `/admin/pages/edit/:id` (Puck editor with autosave + versions + publish).
- Public: catch-all route renders published `pages.data` via `<Render config data />` inside `PublicLayout`; SEO from `pages.seo`; keep sitemap/llms.txt in sync.
- *Depends on Phase 1 versioning.*

### Phase 3 — In-app agentic AI page assistant (HIGH impact / HIGH effort)
- `ai-proxy-stream` edge function: SSE streaming + tool-call protocol over the existing multi-provider settings (`crm_runtime_settings`); keys server-side.
- Chat panel docked in the Puck editor. `@ai-sdk/react` `useChat` → `api: /functions/v1/ai-proxy-stream`.
- **Page-edit tool model** (agent-native): `addBlock(type, props, at)`, `editBlock(id, props)`, `removeBlock(id)`, `reorder(id, to)`, `setRoot(props)`, `describePage()` — execute client-side against Puck data via `onToolCall`/`addToolResult`, grounded in a JSON-Schema of available block types.
- **Safe apply**: every AI mutation goes through a preview/diff with accept/undo; nothing persists without author confirm; full undo via version snapshots.
- *Depends on Phase 2 data model + config.*

### Phase 4 — Email: SMTP send + IMAP inbox (MED impact / MED effort, semi-independent)
- **SMTP**: existing `send-email` fn + `crm_runtime_settings` SMTP config already present → add admin **compose + send-test** UI; reuse `nodemailer` npm pattern.
- **IMAP inbox**: `inbox_messages` schema extended (`uid bigint, uidvalidity bigint, mailbox, thread_id, raw, parsed`); a sync routine with **UID/UIDVALIDITY cursor** (RFC 4549), batched ~100/fetch; scheduled by `pg_cron`+`pg_net`. **Spike first**: verify `deno-imap` runs in the edge sandbox (outbound TCP/TLS); if not, run sync as an external worker. Inbox UI: list/thread/read, mark-read, reply (→ SMTP).
- *Independent of 1–3; can be scheduled whenever.*

---

## Risks / open questions
- **`deno-imap` in edge runtime** — unverified TCP/TLS + UID support. Mitigation: Phase 4 spike; external-worker fallback.
- **Block JSON ↔ public rendering parity** — public site must render every Puck/TipTap block type. Mitigation: shared component registry used by both editor and `<Render>`.
- **AI edit safety** — never auto-persist; preview/diff/undo mandatory.
- **Markdown→JSON migration** for existing posts — dual-read (JSON else markdown) during transition.
- **Scope** — this is multi-week; each phase ships independently.

## Source index
TipTap: [slash](https://tiptap.dev/docs/examples/experiments/slash-commands) · [persistence](https://tiptap.dev/docs/editor/core-concepts/persistence) — Versioning: [Payload](https://payloadcms.com/docs/versions/overview) · [Ghost](https://ghost.org/changelog/post-history/) — Puck: [GitHub](https://github.com/puckeditor/puck) · [Tailwind guide](https://puckeditor.com/blog/how-to-build-a-react-page-builder-puck-and-tailwind-4) — Payload: [outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs) · [license](https://github.com/payloadcms/payload/blob/main/LICENSE.md) — AI: [Builder.io Visual Copilot](https://www.builder.io/c/docs/ve-visualcopilot) · [AI SDK useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) — Email: [deno-imap](https://github.com/workingdevshero/deno-imap) · [Supabase scheduled fns](https://supabase.com/docs/guides/functions/schedule-functions) · [RFC 4549](https://datatracker.ietf.org/doc/html/rfc4549) · [send-email-smtp example](https://github.com/supabase/supabase/blob/master/examples/edge-functions/supabase/functions/send-email-smtp/index.ts)
