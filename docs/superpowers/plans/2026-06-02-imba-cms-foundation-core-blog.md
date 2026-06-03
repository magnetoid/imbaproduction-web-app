# IMBA-CMS Foundation — Core Kernel + Blog Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the IMBA-CMS pnpm/Turborepo monorepo with a working `@imba/core` kernel and prove the plugin/template contract end-to-end by extracting the Blog feature into `@imba/plugin-blog`, skinned by `@imba/template-cinema`, running as `apps/imbaproduction`.

**Architecture:** Build-time composition. `@imba/core` exposes `definePlugin`/`defineTemplate` manifest factories and a `createCMS({ template, plugins, site, supabase })` function that validates manifests, composes registries (routes, admin nav, migrations, dashboard widgets), and returns a React `<Router>`. Plugins own their feature's public components, admin pages, SQL migrations, and i18n; the single data seam is `core.db` (the configured Supabase client). Dependency direction is one-way: `app → template → plugins → core ← ui`.

**Tech Stack:** pnpm workspaces, Turborepo, TypeScript 5, React 18, Vite 5, react-router-dom 6, Vitest + React Testing Library, Tailwind CSS 3, Supabase JS, Zod (manifest validation).

**Source of truth:** Spec at `docs/superpowers/specs/2026-06-02-imba-cms-modular-architecture-design.md`. The existing app to extract from lives at `imba-production/` in the current repo; this plan builds a fresh `imba-cms/` tree (decision D2 = incremental, but the new monorepo is a clean root that the existing code is moved into).

**Conventions for every task:** TDD — write the failing test, watch it fail, implement minimally, watch it pass, commit. Run tests with `pnpm --filter <pkg> test`. Type-check with `pnpm --filter <pkg> typecheck`. Keep `apps/imbaproduction` building (`pnpm --filter imbaproduction build`) from Phase F onward.

---

## File Structure (created by this plan)

```
imba-cms/
├── package.json                         root scripts, devDeps (turbo, typescript, vitest)
├── pnpm-workspace.yaml                  workspace globs
├── turbo.json                           build/lint/typecheck/test pipelines
├── tsconfig.base.json                   shared compiler options
├── vitest.workspace.ts                  workspace test config
├── packages/
│   ├── tsconfig/package.json            @imba/tsconfig (shared tsconfig presets)
│   ├── tailwind-preset/                 @imba/tailwind-preset (tokens + HUD utilities)
│   ├── ui/                              @imba/ui (button, card, input — minimal for blog)
│   ├── core/
│   │   ├── package.json                 @imba/core
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       ├── types.ts                 Plugin, Template, RouteDef, MigrationDef, SiteConfig…
│   │       ├── define.ts                definePlugin, defineTemplate
│   │       ├── validate.ts              validatePlugins (zod + cross-manifest checks)
│   │       ├── registry.ts             buildRegistry (route/admin/dashboard composition)
│   │       ├── migrations.ts            orderMigrations (topo-sort + collision detection)
│   │       ├── db.ts                    createDb (configured Supabase client + url fallback)
│   │       ├── auth.ts                  createAuth (GoTrue wrapper)
│   │       ├── createCMS.tsx            createCMS (ties it together → <Router>)
│   │       ├── AdminShell.tsx           admin chrome + auth gate
│   │       ├── i18n.ts                  react-i18next runtime + LanguageSwitcher
│   │       └── index.ts                 public exports
│   ├── plugin-blog/
│   │   ├── package.json                 @imba/plugin-blog
│   │   └── src/
│   │       ├── migrations/V001_blog.sql blog_* tables + RLS
│   │       ├── types.ts                 BlogPost, BlogCategory
│   │       ├── public/Blog.tsx          listing (moved + retargeted)
│   │       ├── public/BlogPost.tsx      detail (moved + retargeted)
│   │       ├── admin/*.tsx              BlogAdmin, BlogCategoriesAdmin, BlogPostEdit, TiptapEditor
│   │       ├── seed.ts                  blog-seed-data → seed(ctx)
│   │       └── index.ts                 definePlugin({...}) manifest
│   └── template-cinema/
│       ├── package.json                 @imba/template-cinema
│       └── src/
│           ├── tokens.css               ember/cyber/ink/gold + HUD classes
│           ├── PublicLayout.tsx         Nav + Footer + skip-link
│           ├── pages/Home.tsx           minimal marketing home
│           └── index.ts                 defineTemplate({...}) manifest
└── apps/
    └── imbaproduction/
        ├── package.json
        ├── vite.config.ts
        ├── index.html
        └── src/
            ├── main.tsx                 ReactDOM.render(<App/>)
            └── App.tsx                  createCMS({ template, plugins, site, supabase })
```

---

## Phase A — Monorepo foundation

### Task A1: Initialize the monorepo root

**Files:**
- Create: `imba-cms/package.json`
- Create: `imba-cms/pnpm-workspace.yaml`
- Create: `imba-cms/.gitignore`

- [ ] **Step 1: Create the workspace manifest**

`imba-cms/pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 2: Create the root package.json**

`imba-cms/package.json`:

```json
{
  "name": "imba-cms",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "dev": "turbo run dev"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.4.0",
    "vitest": "^2.1.0"
  },
  "packageManager": "pnpm@9.12.0"
}
```

- [ ] **Step 3: Create .gitignore**

`imba-cms/.gitignore`:

```
node_modules/
dist/
.turbo/
*.tsbuildinfo
coverage/
.env
.env.local
```

- [ ] **Step 4: Install and verify the workspace resolves**

Run: `cd imba-cms && pnpm install`
Expected: completes without error, creates `pnpm-lock.yaml` and `node_modules/`.

- [ ] **Step 5: Commit**

```bash
cd imba-cms && git init && git add -A
git commit -m "chore: initialize imba-cms pnpm monorepo root"
```

### Task A2: Turborepo pipelines + shared TypeScript base

**Files:**
- Create: `imba-cms/turbo.json`
- Create: `imba-cms/tsconfig.base.json`
- Create: `imba-cms/packages/tsconfig/package.json`

- [ ] **Step 1: Create turbo.json**

`imba-cms/turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "typecheck": { "dependsOn": ["^build"] },
    "lint": {},
    "test": {},
    "dev": { "cache": false, "persistent": true }
  }
}
```

- [ ] **Step 2: Create the shared compiler base**

`imba-cms/tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "composite": false,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 3: Expose the base as a shared package**

`imba-cms/packages/tsconfig/package.json`:

```json
{
  "name": "@imba/tsconfig",
  "version": "0.1.0",
  "private": true,
  "files": ["base.json"]
}
```

Then create `imba-cms/packages/tsconfig/base.json` with the same content as `tsconfig.base.json` (so packages can `extends: "@imba/tsconfig/base.json"`).

- [ ] **Step 4: Verify turbo runs (no tasks yet)**

Run: `cd imba-cms && pnpm turbo run build`
Expected: turbo runs, reports "No tasks were executed" (no packages define build yet). No error.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: add turborepo pipelines and shared tsconfig base"
```

---

## Phase B — `@imba/core` kernel

### Task B1: Scaffold the core package

**Files:**
- Create: `imba-cms/packages/core/package.json`
- Create: `imba-cms/packages/core/tsconfig.json`
- Create: `imba-cms/packages/core/vitest.config.ts`

- [ ] **Step 1: Create the package manifest**

`imba-cms/packages/core/package.json`:

```json
{
  "name": "@imba/core",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "react-i18next": "^16.6.6",
    "i18next": "^25.10.9",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@imba/tsconfig": "workspace:*",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.2.48",
    "jsdom": "^25.0.0",
    "typescript": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create the package tsconfig**

`imba-cms/packages/core/tsconfig.json`:

```json
{
  "extends": "@imba/tsconfig/base.json",
  "include": ["src"]
}
```

- [ ] **Step 3: Create the vitest config (jsdom for React tests)**

`imba-cms/packages/core/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { environment: 'jsdom', globals: true },
})
```

- [ ] **Step 4: Install workspace deps**

Run: `cd imba-cms && pnpm install`
Expected: links `@imba/tsconfig`, installs core deps, no error.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold @imba/core package"
```

### Task B2: Core type contracts

**Files:**
- Create: `imba-cms/packages/core/src/types.ts`
- Test: `imba-cms/packages/core/src/types.test.ts`

- [ ] **Step 1: Write the failing test (types compile + identity holds)**

`imba-cms/packages/core/src/types.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import type { Plugin, Template, RouteDef, MigrationDef, SiteConfig } from './types'

describe('type contracts', () => {
  it('a minimal Plugin object satisfies the Plugin type', () => {
    const p: Plugin = { name: 'demo', version: '0.0.0' }
    expect(p.name).toBe('demo')
  })

  it('a minimal Template object satisfies the Template type', () => {
    const Public = () => null
    const t: Template = { name: 'bare', layouts: { Public } }
    expect(t.name).toBe('bare')
  })

  it('MigrationDef requires id and sql', () => {
    const m: MigrationDef = { id: 'demo.V001', sql: 'select 1;' }
    expect(m.id).toBe('demo.V001')
  })

  it('SiteConfig and RouteDef are usable', () => {
    const site: SiteConfig = { name: 'X', domain: 'x.com', defaultLocale: 'en', locales: ['en'] }
    const Page = () => null
    const r: RouteDef = { path: '/x', element: Page }
    expect(site.name + r.path).toBe('X/x')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — `Cannot find module './types'`.

- [ ] **Step 3: Write the type definitions**

`imba-cms/packages/core/src/types.ts`:

```ts
import type { ComponentType } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

export type Locale = string
export type Component = ComponentType<Record<string, unknown>>

export interface RouteDef {
  path: string
  element: Component
  seo?: { title?: string; description?: string }
}

export interface NavItem {
  group: string
  label: string
  path: string
  icon?: string
}

export interface AdminDef {
  nav: NavItem
  pages: RouteDef[]
}

export interface MigrationDef {
  id: string // namespaced, e.g. 'blog.V001'
  sql: string
}

export interface WidgetDef {
  id: string
  render: Component
}

export interface SiteConfig {
  name: string
  domain: string
  defaultLocale: Locale
  locales: Locale[]
  logoUrl?: string
  social?: Record<string, string>
  contactEmail?: string
}

export interface AuthApi {
  getSession: () => Promise<unknown>
  onChange: (cb: (session: unknown) => void) => () => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export interface PluginContext {
  db: SupabaseClient
  auth: AuthApi
  config: SiteConfig
}

export interface Plugin {
  name: string
  version: string
  dependsOn?: string[]
  tablePrefix?: string
  routes?: RouteDef[]
  admin?: AdminDef
  migrations?: MigrationDef[]
  i18n?: Record<Locale, Record<string, string>>
  dashboard?: WidgetDef[]
  seed?: (ctx: PluginContext) => Promise<void>
  edgeFunctions?: string[]
  register?: (ctx: PluginContext) => void
}

export interface Template {
  name: string
  pages?: RouteDef[]
  layouts: { Public: Component; Admin?: Component }
  overrides?: Record<string, Component>
  expects?: string[]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(core): plugin/template type contracts"
```

### Task B3: `definePlugin` / `defineTemplate` factories

**Files:**
- Create: `imba-cms/packages/core/src/define.ts`
- Test: `imba-cms/packages/core/src/define.test.ts`

- [ ] **Step 1: Write the failing test**

`imba-cms/packages/core/src/define.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { definePlugin, defineTemplate } from './define'

describe('define factories', () => {
  it('definePlugin returns the manifest unchanged (identity, typed)', () => {
    const p = definePlugin({ name: 'blog', version: '1.0.0' })
    expect(p).toEqual({ name: 'blog', version: '1.0.0' })
  })

  it('defineTemplate returns the manifest unchanged', () => {
    const Public = () => null
    const t = defineTemplate({ name: 'cinema', layouts: { Public } })
    expect(t.name).toBe('cinema')
    expect(t.layouts.Public).toBe(Public)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — `Cannot find module './define'`.

- [ ] **Step 3: Implement the factories**

`imba-cms/packages/core/src/define.ts`:

```ts
import type { Plugin, Template } from './types'

export function definePlugin(plugin: Plugin): Plugin {
  return plugin
}

export function defineTemplate(template: Template): Template {
  return template
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(core): definePlugin/defineTemplate factories"
```

### Task B4: Manifest validation (`validatePlugins`)

**Files:**
- Create: `imba-cms/packages/core/src/validate.ts`
- Test: `imba-cms/packages/core/src/validate.test.ts`

- [ ] **Step 1: Write the failing tests (one assertion per rule)**

`imba-cms/packages/core/src/validate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validatePlugins } from './validate'
import type { Plugin } from './types'

const Page = () => null
const base = (over: Partial<Plugin>): Plugin => ({ name: 'x', version: '1.0.0', ...over })

describe('validatePlugins', () => {
  it('passes for a valid, non-conflicting set', () => {
    expect(() =>
      validatePlugins([
        base({ name: 'blog', tablePrefix: 'blog_', routes: [{ path: '/blog', element: Page }] }),
        base({ name: 'shop', tablePrefix: 'shop_', routes: [{ path: '/shop', element: Page }] }),
      ]),
    ).not.toThrow()
  })

  it('throws on duplicate plugin names', () => {
    expect(() => validatePlugins([base({ name: 'blog' }), base({ name: 'blog' })])).toThrow(/duplicate plugin name: blog/i)
  })

  it('throws on a missing dependsOn target', () => {
    expect(() => validatePlugins([base({ name: 'import', dependsOn: ['blog'] })])).toThrow(/import.*depends on.*blog/i)
  })

  it('throws on tablePrefix collision', () => {
    expect(() =>
      validatePlugins([base({ name: 'a', tablePrefix: 'shared_' }), base({ name: 'b', tablePrefix: 'shared_' })]),
    ).toThrow(/tableprefix collision: shared_/i)
  })

  it('throws on duplicate public route paths', () => {
    expect(() =>
      validatePlugins([
        base({ name: 'a', routes: [{ path: '/dup', element: Page }] }),
        base({ name: 'b', routes: [{ path: '/dup', element: Page }] }),
      ]),
    ).toThrow(/duplicate route path: \/dup/i)
  })

  it('throws on duplicate admin nav paths', () => {
    const admin = (p: string) => ({ nav: { group: 'G', label: 'L', path: p }, pages: [] })
    expect(() =>
      validatePlugins([base({ name: 'a', admin: admin('/admin/dup') }), base({ name: 'b', admin: admin('/admin/dup') })]),
    ).toThrow(/duplicate admin path: \/admin\/dup/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — `Cannot find module './validate'`.

- [ ] **Step 3: Implement validation**

`imba-cms/packages/core/src/validate.ts`:

```ts
import type { Plugin } from './types'

export function validatePlugins(plugins: Plugin[]): void {
  const names = new Set<string>()
  for (const p of plugins) {
    if (names.has(p.name)) throw new Error(`Duplicate plugin name: ${p.name}`)
    names.add(p.name)
  }

  for (const p of plugins) {
    for (const dep of p.dependsOn ?? []) {
      if (!names.has(dep)) throw new Error(`Plugin "${p.name}" depends on "${dep}", which is not registered`)
    }
  }

  const prefixes = new Map<string, string>()
  for (const p of plugins) {
    if (!p.tablePrefix) continue
    const owner = prefixes.get(p.tablePrefix)
    if (owner) throw new Error(`tablePrefix collision: ${p.tablePrefix} used by "${owner}" and "${p.name}"`)
    prefixes.set(p.tablePrefix, p.name)
  }

  const routePaths = new Set<string>()
  for (const p of plugins) {
    for (const r of p.routes ?? []) {
      if (routePaths.has(r.path)) throw new Error(`Duplicate route path: ${r.path}`)
      routePaths.add(r.path)
    }
  }

  const adminPaths = new Set<string>()
  for (const p of plugins) {
    if (!p.admin) continue
    if (adminPaths.has(p.admin.nav.path)) throw new Error(`Duplicate admin path: ${p.admin.nav.path}`)
    adminPaths.add(p.admin.nav.path)
    for (const page of p.admin.pages) {
      if (adminPaths.has(page.path)) throw new Error(`Duplicate admin path: ${page.path}`)
      adminPaths.add(page.path)
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: PASS (6 validate tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(core): manifest validation with clear boot-time errors"
```

### Task B5: Migration ordering (`orderMigrations`)

**Files:**
- Create: `imba-cms/packages/core/src/migrations.ts`
- Test: `imba-cms/packages/core/src/migrations.test.ts`

- [ ] **Step 1: Write the failing tests**

`imba-cms/packages/core/src/migrations.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { orderMigrations } from './migrations'
import type { Plugin } from './types'

const p = (name: string, ids: string[], dependsOn?: string[]): Plugin => ({
  name,
  version: '1.0.0',
  dependsOn,
  migrations: ids.map((id) => ({ id, sql: `-- ${id}` })),
})

describe('orderMigrations', () => {
  it('orders dependencies before dependents', () => {
    const out = orderMigrations([p('import', ['import.V001'], ['blog']), p('blog', ['blog.V001'])])
    expect(out.map((m) => m.id)).toEqual(['blog.V001', 'import.V001'])
  })

  it('sorts a single plugin migrations by id', () => {
    const out = orderMigrations([p('blog', ['blog.V002', 'blog.V001'])])
    expect(out.map((m) => m.id)).toEqual(['blog.V001', 'blog.V002'])
  })

  it('throws on duplicate migration ids across plugins', () => {
    expect(() => orderMigrations([p('a', ['dup.V001']), p('b', ['dup.V001'])])).toThrow(/duplicate migration id: dup\.V001/i)
  })

  it('throws on a dependency cycle', () => {
    expect(() => orderMigrations([p('a', ['a.V001'], ['b']), p('b', ['b.V001'], ['a'])])).toThrow(/cycle/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — `Cannot find module './migrations'`.

- [ ] **Step 3: Implement topo-sort + collision detection**

`imba-cms/packages/core/src/migrations.ts`:

```ts
import type { MigrationDef, Plugin } from './types'

export function orderMigrations(plugins: Plugin[]): MigrationDef[] {
  // Topological sort of plugins by dependsOn (Kahn's algorithm).
  const byName = new Map(plugins.map((p) => [p.name, p]))
  const indegree = new Map<string, number>(plugins.map((p) => [p.name, 0]))
  const dependents = new Map<string, string[]>(plugins.map((p) => [p.name, []]))

  for (const p of plugins) {
    for (const dep of p.dependsOn ?? []) {
      if (!byName.has(dep)) continue // missing deps are caught by validatePlugins
      indegree.set(p.name, (indegree.get(p.name) ?? 0) + 1)
      dependents.get(dep)!.push(p.name)
    }
  }

  const queue = [...indegree.entries()].filter(([, d]) => d === 0).map(([n]) => n).sort()
  const order: string[] = []
  while (queue.length) {
    const name = queue.shift()!
    order.push(name)
    for (const child of dependents.get(name)!.sort()) {
      indegree.set(child, indegree.get(child)! - 1)
      if (indegree.get(child) === 0) queue.push(child)
    }
    queue.sort()
  }
  if (order.length !== plugins.length) throw new Error('Migration ordering failed: dependency cycle detected')

  const seen = new Set<string>()
  const result: MigrationDef[] = []
  for (const name of order) {
    const migrations = [...(byName.get(name)!.migrations ?? [])].sort((a, b) => a.id.localeCompare(b.id))
    for (const m of migrations) {
      if (seen.has(m.id)) throw new Error(`Duplicate migration id: ${m.id}`)
      seen.add(m.id)
      result.push(m)
    }
  }
  return result
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: PASS (4 migration tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(core): deterministic migration ordering with cycle + collision checks"
```

### Task B6: Registry composition (`buildRegistry`)

**Files:**
- Create: `imba-cms/packages/core/src/registry.ts`
- Test: `imba-cms/packages/core/src/registry.test.ts`

- [ ] **Step 1: Write the failing test**

`imba-cms/packages/core/src/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildRegistry } from './registry'
import type { Plugin, Template } from './types'

const Page = () => null
const Public = () => null

const blog: Plugin = {
  name: 'blog',
  version: '1.0.0',
  tablePrefix: 'blog_',
  routes: [{ path: '/blog', element: Page }],
  admin: { nav: { group: 'Content', label: 'Blog', path: '/admin/blog' }, pages: [{ path: '/admin/blog/:id', element: Page }] },
  migrations: [{ id: 'blog.V001', sql: '-- blog' }],
  dashboard: [{ id: 'blog-count', render: Page }],
}

const cinema: Template = {
  name: 'cinema',
  layouts: { Public },
  pages: [{ path: '/', element: Page }],
}

describe('buildRegistry', () => {
  it('merges template pages and plugin routes', () => {
    const reg = buildRegistry([blog], cinema)
    expect(reg.routes.map((r) => r.path).sort()).toEqual(['/', '/blog'])
  })

  it('collects admin nav + pages', () => {
    const reg = buildRegistry([blog], cinema)
    expect(reg.adminNav.map((n) => n.path)).toEqual(['/admin/blog'])
    expect(reg.adminPages.map((p) => p.path)).toEqual(['/admin/blog/:id'])
  })

  it('orders migrations and collects dashboard widgets', () => {
    const reg = buildRegistry([blog], cinema)
    expect(reg.migrations.map((m) => m.id)).toEqual(['blog.V001'])
    expect(reg.dashboard.map((w) => w.id)).toEqual(['blog-count'])
  })

  it('throws when a plugin route path collides with a template page path', () => {
    const clash: Template = { name: 'c', layouts: { Public }, pages: [{ path: '/blog', element: Page }] }
    expect(() => buildRegistry([blog], clash)).toThrow(/route path collides with template: \/blog/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — `Cannot find module './registry'`.

- [ ] **Step 3: Implement registry composition**

`imba-cms/packages/core/src/registry.ts`:

```ts
import type { MigrationDef, NavItem, Plugin, RouteDef, Template, WidgetDef } from './types'
import { validatePlugins } from './validate'
import { orderMigrations } from './migrations'

export interface CMSRegistry {
  routes: RouteDef[]
  adminNav: NavItem[]
  adminPages: RouteDef[]
  migrations: MigrationDef[]
  dashboard: WidgetDef[]
}

export function buildRegistry(plugins: Plugin[], template: Template): CMSRegistry {
  validatePlugins(plugins)

  const templatePaths = new Set((template.pages ?? []).map((p) => p.path))
  for (const p of plugins) {
    for (const r of p.routes ?? []) {
      if (templatePaths.has(r.path)) throw new Error(`Plugin "${p.name}" route path collides with template: ${r.path}`)
    }
  }

  const routes: RouteDef[] = [...(template.pages ?? []), ...plugins.flatMap((p) => p.routes ?? [])]
  const adminNav: NavItem[] = plugins.filter((p) => p.admin).map((p) => p.admin!.nav)
  const adminPages: RouteDef[] = plugins.flatMap((p) => p.admin?.pages ?? [])
  const dashboard: WidgetDef[] = plugins.flatMap((p) => p.dashboard ?? [])
  const migrations = orderMigrations(plugins)

  return { routes, adminNav, adminPages, migrations, dashboard }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: PASS (4 registry tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(core): registry composition from plugins + template"
```

### Task B7: Data seam (`createDb`) with build-time URL fallback

**Files:**
- Create: `imba-cms/packages/core/src/db.ts`
- Test: `imba-cms/packages/core/src/db.test.ts`

- [ ] **Step 1: Write the failing test (URL resolution logic only)**

`imba-cms/packages/core/src/db.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { resolveSupabaseUrl } from './db'

describe('resolveSupabaseUrl', () => {
  it('uses the provided url when valid', () => {
    expect(resolveSupabaseUrl('https://api.example.com', 'https://site.com')).toBe('https://api.example.com')
  })

  it('falls back to <origin>/supabase when url is empty', () => {
    expect(resolveSupabaseUrl('', 'https://site.com')).toBe('https://site.com/supabase')
  })

  it('falls back when url contains a placeholder', () => {
    expect(resolveSupabaseUrl('http://placeholder', 'https://site.com')).toBe('https://site.com/supabase')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — `Cannot find module './db'`.

- [ ] **Step 3: Implement the data seam**

`imba-cms/packages/core/src/db.ts`:

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function resolveSupabaseUrl(buildUrl: string | undefined, origin: string): string {
  const isPlaceholder = !buildUrl || buildUrl.includes('placeholder') || buildUrl.includes('undefined')
  return isPlaceholder ? `${origin}/supabase` : buildUrl
}

export function createDb(opts: { url?: string; anonKey: string; origin?: string }): SupabaseClient {
  const origin = opts.origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const url = resolveSupabaseUrl(opts.url, origin)
  return createClient(url, opts.anonKey || 'placeholder')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: PASS (3 db tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(core): supabase data seam with same-origin url fallback"
```

### Task B8: Auth wrapper (`createAuth`)

**Files:**
- Create: `imba-cms/packages/core/src/auth.ts`
- Test: `imba-cms/packages/core/src/auth.test.ts`

- [ ] **Step 1: Write the failing test (against a fake client)**

`imba-cms/packages/core/src/auth.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { createAuth } from './auth'

function fakeClient() {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '1' } } } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  } as never
}

describe('createAuth', () => {
  it('getSession returns the underlying session', async () => {
    const auth = createAuth(fakeClient())
    await expect(auth.getSession()).resolves.toEqual({ user: { id: '1' } })
  })

  it('signIn maps a successful result to { error: null }', async () => {
    const auth = createAuth(fakeClient())
    await expect(auth.signIn('a@b.com', 'pw')).resolves.toEqual({ error: null })
  })

  it('onChange wires the subscription and returns an unsubscribe fn', () => {
    const client = fakeClient()
    const auth = createAuth(client)
    const off = auth.onChange(() => {})
    expect(typeof off).toBe('function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — `Cannot find module './auth'`.

- [ ] **Step 3: Implement the auth wrapper**

`imba-cms/packages/core/src/auth.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthApi } from './types'

export function createAuth(client: SupabaseClient): AuthApi {
  return {
    async getSession() {
      const { data } = await client.auth.getSession()
      return data.session
    },
    onChange(cb) {
      const { data } = client.auth.onAuthStateChange((_event, session) => cb(session))
      return () => data.subscription.unsubscribe()
    },
    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password })
      return { error: error ? error.message : null }
    },
    async signOut() {
      await client.auth.signOut()
    },
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: PASS (3 auth tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(core): GoTrue auth wrapper (createAuth)"
```

### Task B9: `createCMS` + router assembly

**Files:**
- Create: `imba-cms/packages/core/src/createCMS.tsx`
- Create: `imba-cms/packages/core/src/AdminShell.tsx`
- Test: `imba-cms/packages/core/src/createCMS.test.tsx`

- [ ] **Step 1: Write the failing test (renders a plugin route through the template layout)**

`imba-cms/packages/core/src/createCMS.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { createCMS } from './createCMS'
import { definePlugin } from './define'
import { defineTemplate } from './define'
import type { SiteConfig } from './types'

const site: SiteConfig = { name: 'Test', domain: 't.com', defaultLocale: 'en', locales: ['en'] }

const blog = definePlugin({
  name: 'blog',
  version: '1.0.0',
  routes: [{ path: '/blog', element: () => <div>BLOG PAGE</div> }],
})

const template = defineTemplate({
  name: 'cinema',
  layouts: { Public: ({ children }: { children?: React.ReactNode }) => <div data-testid="shell">{children}</div> },
  pages: [{ path: '/', element: () => <div>HOME</div> }],
})

describe('createCMS', () => {
  it('renders a plugin route wrapped in the template Public layout', () => {
    const cms = createCMS({ template, plugins: [blog], site, supabase: { anonKey: 'k' } })
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <cms.Router />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('shell')).toBeDefined()
    expect(screen.getByText('BLOG PAGE')).toBeDefined()
  })

  it('exposes the composed migration list', () => {
    const cms = createCMS({
      template,
      plugins: [definePlugin({ name: 'blog', version: '1.0.0', migrations: [{ id: 'blog.V001', sql: '-- x' }] })],
      site,
      supabase: { anonKey: 'k' },
    })
    expect(cms.migrations.map((m) => m.id)).toEqual(['blog.V001'])
  })

  it('throws on an invalid plugin set (duplicate names)', () => {
    expect(() =>
      createCMS({
        template,
        plugins: [definePlugin({ name: 'dup', version: '1' }), definePlugin({ name: 'dup', version: '1' })],
        site,
        supabase: { anonKey: 'k' },
      }),
    ).toThrow(/duplicate plugin name: dup/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — `Cannot find module './createCMS'`.

- [ ] **Step 3: Implement a minimal AdminShell**

`imba-cms/packages/core/src/AdminShell.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { AuthApi, NavItem, RouteDef } from './types'

export function AdminShell({ auth, nav, pages }: { auth: AuthApi; nav: NavItem[]; pages: RouteDef[] }) {
  const [session, setSession] = useState<unknown>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    auth.getSession().then((s) => {
      setSession(s)
      setReady(true)
    })
    return auth.onChange(setSession)
  }, [auth])

  if (!ready) return <div>Loading…</div>
  if (!session) return <LoginForm auth={auth} />

  return (
    <div data-testid="admin-shell">
      <nav>
        {nav.map((n) => (
          <a key={n.path} href={n.path}>
            {n.label}
          </a>
        ))}
      </nav>
      <Routes>
        {pages.map((p) => (
          <Route key={p.path} path={p.path.replace(/^\/admin/, '')} element={<p.element />} />
        ))}
      </Routes>
    </div>
  )
}

function LoginForm({ auth }: { auth: AuthApi }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        const { error } = await auth.signIn(email, password)
        setError(error)
      }}
    >
      <input aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input aria-label="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Sign in</button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
```

- [ ] **Step 4: Implement createCMS**

`imba-cms/packages/core/src/createCMS.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom'
import type { MigrationDef, Plugin, SiteConfig, Template } from './types'
import { buildRegistry } from './registry'
import { createDb } from './db'
import { createAuth } from './auth'
import { AdminShell } from './AdminShell'

export interface CMSInstance {
  Router: () => JSX.Element
  migrations: MigrationDef[]
}

export function createCMS(config: {
  template: Template
  plugins: Plugin[]
  site: SiteConfig
  supabase: { url?: string; anonKey: string }
}): CMSInstance {
  const registry = buildRegistry(config.plugins, config.template)
  const db = createDb({ url: config.supabase.url, anonKey: config.supabase.anonKey })
  const auth = createAuth(db)
  const ctx = { db, auth, config: config.site }

  for (const p of config.plugins) p.register?.(ctx)

  const Public = config.template.layouts.Public

  function Router() {
    return (
      <Routes>
        <Route
          path="/admin/*"
          element={<AdminShell auth={auth} nav={registry.adminNav} pages={registry.adminPages} />}
        />
        {registry.routes.map((r) => (
          <Route key={r.path} path={r.path} element={<Public><r.element /></Public>} />
        ))}
      </Routes>
    )
  }

  return { Router, migrations: registry.migrations }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: PASS (3 createCMS tests). If `toBeDefined` matchers need jest-dom, they don't — these use plain truthiness via Testing Library queries that throw when absent.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(core): createCMS router assembly + admin shell"
```

### Task B10: i18n runtime + public exports (`index.ts`)

**Files:**
- Create: `imba-cms/packages/core/src/i18n.ts`
- Create: `imba-cms/packages/core/src/index.ts`
- Test: `imba-cms/packages/core/src/index.test.ts`

- [ ] **Step 1: Write the failing test (public surface)**

`imba-cms/packages/core/src/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import * as core from './index'

describe('@imba/core public API', () => {
  it('exports the documented surface', () => {
    for (const name of ['definePlugin', 'defineTemplate', 'createCMS', 'createDb', 'createAuth', 'buildRegistry', 'orderMigrations', 'validatePlugins', 'initI18n']) {
      expect(typeof (core as Record<string, unknown>)[name]).toBe('function')
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — `Cannot find module './index'`.

- [ ] **Step 3: Implement i18n runtime**

`imba-cms/packages/core/src/i18n.ts`:

```ts
import i18next, { type i18n } from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Locale } from './types'

export function initI18n(opts: {
  defaultLocale: Locale
  resources: Record<Locale, Record<string, Record<string, string>>>
}): i18n {
  void i18next.use(initReactI18next).init({
    lng: opts.defaultLocale,
    fallbackLng: opts.defaultLocale,
    resources: opts.resources,
    interpolation: { escapeValue: false },
  })
  return i18next
}
```

- [ ] **Step 4: Implement the barrel export**

`imba-cms/packages/core/src/index.ts`:

```ts
export * from './types'
export { definePlugin, defineTemplate } from './define'
export { validatePlugins } from './validate'
export { orderMigrations } from './migrations'
export { buildRegistry, type CMSRegistry } from './registry'
export { createDb, resolveSupabaseUrl } from './db'
export { createAuth } from './auth'
export { createCMS, type CMSInstance } from './createCMS'
export { initI18n } from './i18n'
```

- [ ] **Step 5: Run test + typecheck to verify**

Run: `cd imba-cms && pnpm --filter @imba/core test && pnpm --filter @imba/core typecheck`
Expected: PASS, and typecheck reports no errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(core): i18n runtime + public barrel export"
```

---

## Phase C — `@imba/ui` (minimal)

### Task C1: Shared UI package with the primitives blog needs

**Files:**
- Create: `imba-cms/packages/ui/package.json`
- Create: `imba-cms/packages/ui/tsconfig.json`
- Create: `imba-cms/packages/ui/src/index.ts`
- Copy: from `imba-production/src/components/ui/{button,card,input,label}.tsx` and `imba-production/src/lib/utils.ts`

- [ ] **Step 1: Create the package manifest**

`imba-cms/packages/ui/package.json`:

```json
{
  "name": "@imba/ui",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": { "typecheck": "tsc --noEmit", "lint": "eslint src --ext ts,tsx" },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.309.0"
  },
  "peerDependencies": { "react": "^18.2.0" },
  "devDependencies": { "@imba/tsconfig": "workspace:*", "@types/react": "^18.2.48", "typescript": "^5.4.0" }
}
```

- [ ] **Step 2: Create tsconfig**

`imba-cms/packages/ui/tsconfig.json`:

```json
{ "extends": "@imba/tsconfig/base.json", "include": ["src"] }
```

- [ ] **Step 3: Copy the primitives and the `cn` helper**

Copy these files from the existing app into `imba-cms/packages/ui/src/`:
- `imba-production/src/lib/utils.ts` → `packages/ui/src/cn.ts` (it exports `cn`)
- `imba-production/src/components/ui/button.tsx` → `packages/ui/src/button.tsx`
- `imba-production/src/components/ui/card.tsx` → `packages/ui/src/card.tsx`
- `imba-production/src/components/ui/input.tsx` → `packages/ui/src/input.tsx`
- `imba-production/src/components/ui/label.tsx` → `packages/ui/src/label.tsx`

In each copied file, change any `import { cn } from '@/lib/utils'` to `import { cn } from './cn'`.

- [ ] **Step 4: Create the barrel export**

`imba-cms/packages/ui/src/index.ts`:

```ts
export { cn } from './cn'
export { Button } from './button'
export { Card, CardHeader, CardTitle, CardContent } from './card'
export { Input } from './input'
export { Label } from './label'
```

(If the copied `card.tsx` exports different member names, match them here exactly.)

- [ ] **Step 5: Install + typecheck**

Run: `cd imba-cms && pnpm install && pnpm --filter @imba/ui typecheck`
Expected: no type errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(ui): shared primitives (button, card, input, label, cn)"
```

---

## Phase D — `@imba/plugin-blog`

### Task D1: Scaffold the plugin + extract blog SQL

**Files:**
- Create: `imba-cms/packages/plugin-blog/package.json`
- Create: `imba-cms/packages/plugin-blog/tsconfig.json`
- Create: `imba-cms/packages/plugin-blog/src/migrations/V001_blog.sql`
- Reference: `imba-production/migrations/V002__blog_cms_and_media.sql` (blog tables) and existing RLS

- [ ] **Step 1: Create the package manifest**

`imba-cms/packages/plugin-blog/package.json`:

```json
{
  "name": "@imba/plugin-blog",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": { "typecheck": "tsc --noEmit", "test": "vitest run", "lint": "eslint src --ext ts,tsx" },
  "dependencies": {
    "@imba/core": "workspace:*",
    "@imba/ui": "workspace:*",
    "@tiptap/react": "^3.21.0",
    "@tiptap/starter-kit": "^3.21.0",
    "marked": "^17.0.5"
  },
  "peerDependencies": { "react": "^18.2.0", "react-router-dom": "^6.21.0" },
  "devDependencies": {
    "@imba/tsconfig": "workspace:*",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.2.48",
    "jsdom": "^25.0.0",
    "typescript": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create tsconfig + vitest config**

`imba-cms/packages/plugin-blog/tsconfig.json`:

```json
{ "extends": "@imba/tsconfig/base.json", "include": ["src"] }
```

`imba-cms/packages/plugin-blog/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { environment: 'jsdom', globals: true } })
```

- [ ] **Step 3: Extract blog SQL with the `blog_` prefix invariant**

Create `imba-cms/packages/plugin-blog/src/migrations/V001_blog.sql` by copying the blog-related `CREATE TABLE`/policy statements from `imba-production/migrations/V002__blog_cms_and_media.sql`. Every table must start with `blog_` (e.g. `blog_posts`, `blog_categories`, `blog_tags`). Every write policy must reference the shared `is_admin()` function (created by core's base migration, not here). Public read policy stays `using (true)` for `select`.

Example shape (adapt columns to the real V002 schema):

```sql
create table if not exists blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);
alter table blog_categories enable row level security;
create policy blog_categories_read on blog_categories for select using (true);
create policy blog_categories_write on blog_categories for all using (is_admin()) with check (is_admin());
-- repeat for blog_posts, blog_tags…
```

- [ ] **Step 4: Verify SQL parses (syntactic smoke check)**

Run: `cd imba-cms && node -e "const s=require('fs').readFileSync('packages/plugin-blog/src/migrations/V001_blog.sql','utf8'); if(!/blog_/.test(s)||!/is_admin\(\)/.test(s)) throw new Error('blog migration missing prefix or is_admin'); console.log('ok')"`
Expected: prints `ok`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(plugin-blog): scaffold package + extract blog migrations (blog_ prefix, is_admin RLS)"
```

### Task D2: Extract blog types + public components

**Files:**
- Create: `imba-cms/packages/plugin-blog/src/types.ts` (from the `BlogPost`/`BlogCategory` interfaces in `imba-production/src/lib/supabase.ts`)
- Create: `imba-cms/packages/plugin-blog/src/public/Blog.tsx` (from `imba-production/src/pages/Blog.tsx`)
- Create: `imba-cms/packages/plugin-blog/src/public/BlogPost.tsx` (from `imba-production/src/pages/BlogPost.tsx`)

- [ ] **Step 1: Move the blog types**

Copy the `BlogPost`, `BlogCategory`, and `BlogTag` interfaces out of `imba-production/src/lib/supabase.ts` into `imba-cms/packages/plugin-blog/src/types.ts`. Export each.

- [ ] **Step 2: Add the plugin-local db accessor**

Core does **not** export a global `db` (the client is created inside `createCMS`). The plugin receives it through its `register(ctx)` hook and stashes it in a tiny module-level accessor. Create `src/public/blogClient.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
let _db: SupabaseClient | null = null
export function setBlogDb(db: SupabaseClient) { _db = db }
export function blogDb(): SupabaseClient {
  if (!_db) throw new Error('plugin-blog: db not initialized — did createCMS run the plugin register hook?')
  return _db
}
```

- In `Blog.tsx`/`BlogPost.tsx`, replace `supabase` usages with `blogDb()` and import `{ blogDb } from './blogClient'`.
- Replace any `import { BlogPost } from '@/lib/supabase'` type imports with `import type { BlogPost } from '../types'`.
- Replace shadcn imports `@/components/ui/*` with `@imba/ui`.

- [ ] **Step 3: Typecheck**

Run: `cd imba-cms && pnpm install && pnpm --filter @imba/plugin-blog typecheck`
Expected: no type errors (fix any remaining `@/` import paths the same way).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(plugin-blog): extract types + public Blog/BlogPost with db seam"
```

### Task D3: Extract blog admin pages

**Files:**
- Create: `imba-cms/packages/plugin-blog/src/admin/{BlogAdmin,BlogCategoriesAdmin,BlogPostEdit,TiptapEditor}.tsx` (from the matching files in `imba-production/src/admin/`)
- Create: `imba-cms/packages/plugin-blog/src/seed.ts` (from `imba-production/src/admin/blog-seed-data.ts`)

- [ ] **Step 1: Move the four admin files + seed data**

Copy `BlogAdmin.tsx`, `BlogCategoriesAdmin.tsx`, `BlogPostEdit.tsx`, `TiptapEditor.tsx` from `imba-production/src/admin/` into `src/admin/`. Apply the same import retargeting as D2:
- `@/lib/supabase` (client) → `blogDb()` from `../public/blogClient`
- `@/lib/supabase` (types) → `../types`
- `@/components/ui/*` → `@imba/ui`

- [ ] **Step 2: Convert seed data into a `seed(ctx)` function**

`imba-cms/packages/plugin-blog/src/seed.ts`:

```ts
import type { PluginContext } from '@imba/core'
import { SEED_POSTS } from './seed-data' // move the array from blog-seed-data.ts here

export async function seed(ctx: PluginContext): Promise<void> {
  for (const post of SEED_POSTS) {
    await ctx.db.from('blog_posts').upsert(post, { onConflict: 'slug' })
  }
}
```

Move the seed array from `imba-production/src/admin/blog-seed-data.ts` into `src/seed-data.ts` and adapt table/column names to the `blog_` schema.

- [ ] **Step 3: Typecheck**

Run: `cd imba-cms && pnpm --filter @imba/plugin-blog typecheck`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(plugin-blog): extract admin pages + seed function"
```

### Task D4: The blog plugin manifest

**Files:**
- Create: `imba-cms/packages/plugin-blog/src/index.ts`
- Test: `imba-cms/packages/plugin-blog/src/index.test.ts`

- [ ] **Step 1: Write the failing test (manifest shape + register wires db)**

`imba-cms/packages/plugin-blog/src/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import blog from './index'
import { blogDb } from './public/blogClient'

describe('@imba/plugin-blog manifest', () => {
  it('declares name, version, prefix, public + admin routes, and a migration', () => {
    expect(blog.name).toBe('blog')
    expect(blog.tablePrefix).toBe('blog_')
    expect(blog.routes?.some((r) => r.path === '/blog')).toBe(true)
    expect(blog.admin?.nav.path).toBe('/admin/blog')
    expect(blog.migrations?.[0].id).toBe('blog.V001')
  })

  it('register() initializes the blog db seam', () => {
    const fakeDb = { from: () => ({}) } as never
    blog.register?.({ db: fakeDb, auth: {} as never, config: {} as never })
    expect(blogDb()).toBe(fakeDb)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/plugin-blog test`
Expected: FAIL — `Cannot find module './index'`.

- [ ] **Step 3: Implement the manifest**

`imba-cms/packages/plugin-blog/src/index.ts`:

```ts
import { definePlugin } from '@imba/core'
import V001_blog from './migrations/V001_blog.sql?raw'
import { setBlogDb } from './public/blogClient'
import { Blog } from './public/Blog'
import { BlogPost } from './public/BlogPost'
import { BlogAdmin } from './admin/BlogAdmin'
import { BlogCategoriesAdmin } from './admin/BlogCategoriesAdmin'
import { BlogPostEdit } from './admin/BlogPostEdit'
import { seed } from './seed'

export default definePlugin({
  name: 'blog',
  version: '0.1.0',
  tablePrefix: 'blog_',
  routes: [
    { path: '/blog', element: Blog, seo: { title: 'Blog' } },
    { path: '/blog/:slug', element: BlogPost },
  ],
  admin: {
    nav: { group: 'Content', label: 'Blog', path: '/admin/blog', icon: 'FileText' },
    pages: [
      { path: '/admin/blog', element: BlogAdmin },
      { path: '/admin/blog/categories', element: BlogCategoriesAdmin },
      { path: '/admin/blog/:id', element: BlogPostEdit },
    ],
  },
  migrations: [{ id: 'blog.V001', sql: V001_blog }],
  i18n: { en: { title: 'Blog' } },
  seed,
  register(ctx) {
    setBlogDb(ctx.db)
  },
})
```

Note: `?raw` SQL imports require the Vite consumer (app) to support them — Vite does natively. For the Vitest run, add to `vitest.config.ts`: `assetsInclude: ['**/*.sql']` and an inline transform, OR import the SQL via `readFileSync` in test. Simplest: in the test, the migration assertion only checks `blog.V001` id, and the manifest's `sql` may be a string. If `?raw` fails under Vitest, change the import to a Vite-only glob and gate the test to skip the SQL body. Keep the test asserting `migrations?.[0].id === 'blog.V001'` only.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/plugin-blog test`
Expected: PASS (2 manifest tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(plugin-blog): plugin manifest (routes, admin, migration, seed, register)"
```

---

## Phase E — `@imba/template-cinema`

### Task E1: Template package with tokens, layout, and home page

**Files:**
- Create: `imba-cms/packages/template-cinema/package.json`
- Create: `imba-cms/packages/template-cinema/src/tokens.css` (from the design tokens in `imba-production/tailwind.config.ts` + global CSS)
- Create: `imba-cms/packages/template-cinema/src/PublicLayout.tsx` (from `imba-production/src/components/{Nav,Footer}.tsx`)
- Create: `imba-cms/packages/template-cinema/src/pages/Home.tsx` (minimal, from `imba-production/src/pages/Home.tsx`)
- Create: `imba-cms/packages/template-cinema/src/index.ts`
- Test: `imba-cms/packages/template-cinema/src/index.test.tsx`

- [ ] **Step 1: Create the package manifest**

`imba-cms/packages/template-cinema/package.json`:

```json
{
  "name": "@imba/template-cinema",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": { "typecheck": "tsc --noEmit", "test": "vitest run", "lint": "eslint src --ext ts,tsx" },
  "dependencies": { "@imba/core": "workspace:*", "@imba/ui": "workspace:*" },
  "peerDependencies": { "react": "^18.2.0", "react-router-dom": "^6.21.0" },
  "devDependencies": {
    "@imba/tsconfig": "workspace:*",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.2.48",
    "jsdom": "^25.0.0",
    "typescript": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Extract tokens + HUD classes**

Copy the CSS-variable tokens (`--ember`, `--cyber`, `--ink`, `--smoke`, `--gold`) and the custom utility classes (`.hud-card`, `.glow-cyber`, etc.) from the existing global stylesheet / `tailwind.config.ts` into `src/tokens.css`.

- [ ] **Step 3: Build PublicLayout from Nav + Footer**

`src/PublicLayout.tsx` — compose the existing `Nav` and `Footer` markup, retargeting `@/components/ui/*` → `@imba/ui` and removing hardcoded "Imba" strings in favor of a `site` prop where present:

```tsx
import type { ReactNode } from 'react'

export function PublicLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <Nav />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  )
}
// Nav and Footer: paste the existing component bodies here (or as sibling files), retargeted.
```

- [ ] **Step 4: Write the failing test**

`imba-cms/packages/template-cinema/src/index.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import cinema from './index'

describe('@imba/template-cinema', () => {
  it('is a valid Template with a Public layout and a home page', () => {
    expect(cinema.name).toBe('cinema')
    expect(typeof cinema.layouts.Public).toBe('function')
    expect(cinema.pages?.some((p) => p.path === '/')).toBe(true)
  })

  it('Public layout renders its children', () => {
    const Public = cinema.layouts.Public
    render(
      <MemoryRouter>
        <Public><div>CHILD</div></Public>
      </MemoryRouter>,
    )
    expect(screen.getByText('CHILD')).toBeDefined()
  })
})
```

- [ ] **Step 5: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/template-cinema test`
Expected: FAIL — `Cannot find module './index'`.

- [ ] **Step 6: Implement the template manifest**

`imba-cms/packages/template-cinema/src/index.ts`:

```ts
import { defineTemplate } from '@imba/core'
import './tokens.css'
import { PublicLayout } from './PublicLayout'
import { Home } from './pages/Home'

export default defineTemplate({
  name: 'cinema',
  layouts: { Public: PublicLayout },
  pages: [{ path: '/', element: Home, seo: { title: 'Home' } }],
  expects: ['blog'],
})
```

Create a minimal `src/pages/Home.tsx` that renders the hero headline (paste a trimmed version of the existing Home, keeping it dependency-light for now).

- [ ] **Step 7: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/template-cinema test`
Expected: PASS (2 tests).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(template-cinema): tokens, PublicLayout, home, template manifest"
```

---

## Phase F — `apps/imbaproduction`

### Task F1: Assemble the app from core + plugin-blog + template-cinema

**Files:**
- Create: `imba-cms/apps/imbaproduction/package.json`
- Create: `imba-cms/apps/imbaproduction/vite.config.ts`
- Create: `imba-cms/apps/imbaproduction/index.html`
- Create: `imba-cms/apps/imbaproduction/src/main.tsx`
- Create: `imba-cms/apps/imbaproduction/src/App.tsx`

- [ ] **Step 1: Create the app manifest**

`imba-cms/apps/imbaproduction/package.json`:

```json
{
  "name": "imbaproduction",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@imba/core": "workspace:*",
    "@imba/plugin-blog": "workspace:*",
    "@imba/template-cinema": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0"
  },
  "devDependencies": {
    "@imba/tsconfig": "workspace:*",
    "@vitejs/plugin-react": "^4.2.1",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.4.0",
    "vite": "^5.0.11"
  }
}
```

- [ ] **Step 2: Vite config**

`imba-cms/apps/imbaproduction/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true },
  build: { outDir: 'dist' },
})
```

- [ ] **Step 3: index.html + main.tsx**

`imba-cms/apps/imbaproduction/index.html`:

```html
<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Imba Production</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
```

`imba-cms/apps/imbaproduction/src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 4: App.tsx — the composition root**

`imba-cms/apps/imbaproduction/src/App.tsx`:

```tsx
import { BrowserRouter } from 'react-router-dom'
import { createCMS } from '@imba/core'
import blog from '@imba/plugin-blog'
import cinema from '@imba/template-cinema'

const cms = createCMS({
  template: cinema,
  plugins: [blog],
  site: {
    name: 'Imba Production',
    domain: 'imbaproduction.com',
    defaultLocale: 'en',
    locales: ['en', 'sr'],
    contactEmail: 'hello@imbaproduction.com',
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
})

export default function App() {
  return (
    <BrowserRouter>
      <cms.Router />
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Build the app**

Run: `cd imba-cms && pnpm install && pnpm --filter imbaproduction build`
Expected: `tsc --noEmit` passes and `vite build` produces `apps/imbaproduction/dist/`. If `?raw` SQL imports break the build, add `assetsInclude: ['**/*.sql']` is not enough for `?raw`; instead Vite supports `?raw` out of the box — confirm the import in `plugin-blog/src/index.ts` resolves. Fix any unresolved workspace types by running `pnpm install` again.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(app): compose imbaproduction from core + plugin-blog + template-cinema"
```

### Task F2: Smoke-run the app end-to-end

**Files:** none (verification task)

- [ ] **Step 1: Start the existing Supabase stack** (reuse the current repo's stack)

Run (in the original repo): `docker compose up -d`
Expected: `supabase-db`, `supabase-kong`, etc. healthy.

- [ ] **Step 2: Provide env to the app**

Create `imba-cms/apps/imbaproduction/.env`:

```
VITE_SUPABASE_URL=http://localhost:9100
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

- [ ] **Step 3: Run dev server and verify routes**

Run: `cd imba-cms && pnpm --filter imbaproduction dev`
Expected: Vite serves on `http://localhost:3000`. Manually verify:
- `/` renders the cinema home (template page)
- `/blog` renders the blog listing (plugin public route)
- `/admin/blog` shows the login form, then the Blog admin after sign-in

- [ ] **Step 4: Commit a short run log to the plan's notes (optional)**

```bash
git commit --allow-empty -m "chore: verified imbaproduction boots with blog end-to-end"
```

---

## Phase G — Migration runner CLI

### Task G1: `imba migrate` — apply composed migrations into supabase-db

**Files:**
- Create: `imba-cms/packages/core/src/cli/migrate.ts`
- Modify: `imba-cms/packages/core/package.json` (add `bin`)
- Test: `imba-cms/packages/core/src/cli/migrate.test.ts`

- [ ] **Step 1: Write the failing test (plan builder — pure logic, no docker)**

`imba-cms/packages/core/src/cli/migrate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { planMigrations } from './migrate'
import type { MigrationDef } from '../types'

const all: MigrationDef[] = [
  { id: 'core.V001', sql: '-- core' },
  { id: 'blog.V001', sql: '-- blog' },
]

describe('planMigrations', () => {
  it('returns only migrations not yet recorded as applied', () => {
    const pending = planMigrations(all, ['core.V001'])
    expect(pending.map((m) => m.id)).toEqual(['blog.V001'])
  })

  it('returns all when nothing is applied', () => {
    expect(planMigrations(all, []).map((m) => m.id)).toEqual(['core.V001', 'blog.V001'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — `Cannot find module './migrate'`.

- [ ] **Step 3: Implement the plan builder + a thin docker-exec apply**

`imba-cms/packages/core/src/cli/migrate.ts`:

```ts
import type { MigrationDef } from '../types'

export function planMigrations(all: MigrationDef[], applied: string[]): MigrationDef[] {
  const done = new Set(applied)
  return all.filter((m) => !done.has(m.id))
}

// applyMigrations is intentionally not unit-tested (it shells out to docker).
// It reads the composed list from the app, queries schema_migrations, and applies
// each pending migration via `docker exec <supabase-db> psql`. This mirrors the
// existing scripts/migrate.sh mechanism (container discovery via COOLIFY_APP_ID).
export interface ApplyOptions {
  container: string
  all: MigrationDef[]
  exec: (sql: string) => Promise<void>
  fetchApplied: () => Promise<string[]>
  record: (id: string) => Promise<void>
  dryRun?: boolean
}

export async function applyMigrations(opts: ApplyOptions): Promise<string[]> {
  const applied = await opts.fetchApplied()
  const pending = planMigrations(opts.all, applied)
  for (const m of pending) {
    if (opts.dryRun) continue
    await opts.exec(m.sql)
    await opts.record(m.id)
  }
  return pending.map((m) => m.id)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: PASS (2 migrate tests).

- [ ] **Step 5: Export + commit**

Add `export { planMigrations, applyMigrations } from './cli/migrate'` to `packages/core/src/index.ts`.

Run: `cd imba-cms && pnpm --filter @imba/core test && pnpm --filter @imba/core typecheck`
Expected: all PASS.

```bash
git add -A && git commit -m "feat(core): migration plan builder + docker-exec apply seam"
```

### Task G2: Core base migration (`core.V001`)

**Files:**
- Create: `imba-cms/packages/core/src/migrations/V001_core.sql`
- Test: `imba-cms/packages/core/src/migrations/core-migration.test.ts`

- [ ] **Step 1: Write the failing test (invariants present)**

`imba-cms/packages/core/src/migrations/core-migration.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const sql = readFileSync(fileURLToPath(new URL('./V001_core.sql', import.meta.url)), 'utf8')

describe('core base migration', () => {
  it('creates schema_migrations, is_admin(), site_settings, cms_settings', () => {
    expect(sql).toMatch(/create table[\s\S]*schema_migrations/i)
    expect(sql).toMatch(/create (or replace )?function is_admin/i)
    expect(sql).toMatch(/site_settings/i)
    expect(sql).toMatch(/cms_settings/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: FAIL — file not found.

- [ ] **Step 3: Write the base migration**

`imba-cms/packages/core/src/migrations/V001_core.sql`:

```sql
create table if not exists schema_migrations (
  id text primary key,
  applied_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable as $$
  select coalesce((auth.jwt() ->> 'role') = 'admin', false)
     or coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
$$;

create table if not exists site_settings (
  id int primary key default 1,
  name text not null default '',
  domain text not null default '',
  data jsonb not null default '{}'::jsonb
);
alter table site_settings enable row level security;
create policy site_settings_read on site_settings for select using (true);
create policy site_settings_write on site_settings for all using (is_admin()) with check (is_admin());

create table if not exists cms_settings (
  plugin text not null,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  primary key (plugin, key)
);
alter table cms_settings enable row level security;
create policy cms_settings_read on cms_settings for select using (true);
create policy cms_settings_write on cms_settings for all using (is_admin()) with check (is_admin());
```

(Adapt the `is_admin()` body to match the JWT claim shape used by the existing GoTrue setup — confirm against `imba-production/migrations/V001__initial_schema.sql`.)

- [ ] **Step 4: Run test to verify it passes**

Run: `cd imba-cms && pnpm --filter @imba/core test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(core): base migration (schema_migrations, is_admin, site/cms settings)"
```

---

## Final verification

- [ ] **Run the whole workspace test + typecheck + build**

Run: `cd imba-cms && pnpm test && pnpm typecheck && pnpm build`
Expected: all packages green; `apps/imbaproduction/dist/` exists.

- [ ] **Confirm the contract proof**

The app boots, `/` (template), `/blog` (plugin public), and `/admin/blog` (plugin admin behind the core auth gate) all work — proving `createCMS` composition, the data seam, and the migration pipeline end-to-end.

- [ ] **Commit a tag for the foundation**

```bash
git tag imba-cms-foundation-v0.1.0
git commit --allow-empty -m "chore: IMBA-CMS foundation (core + blog + cinema) complete"
```

---

## Follow-up plans (not in this plan)

After this foundation proves the contract, author one plan per remaining extraction, each repeating the blog pattern (scaffold → migrations with `<prefix>_` + `is_admin()` → types → public components → admin pages → manifest → wire into the app):

| Plan | Plugins |
|---|---|
| 2 | `plugin-portfolio`, `plugin-media` |
| 3 | `plugin-team`, `plugin-services` |
| 4 | `plugin-testimonials`, `plugin-hero` |
| 5 | `plugin-quotes` (+ `send-email` edge fn), `plugin-seo` |
| 6 | `plugin-translations`, `plugin-import` (`dependsOn: [blog, media]`) |
| 7 | Flesh out `template-cinema` bespoke pages (About, Contact, Pricing) + plugin public-component overrides |

`plugin-crm` (AI CRM) is a future greenfield plan per spec §15/§17.
```
