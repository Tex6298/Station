# Station UX Implementation Guardrails

Source spec: `C:\Users\adam_\Downloads\Station_UX_Design_Specification.docx`

Purpose: allow large UX changes while preserving recent build, deployment, and local work.

## Protected Work

As of 2026-06-01, `git log --since="2026-05-01"` shows no committed repo changes. The most recent committed work is:

- `6341b47` on 2026-04-21: `chore: add Station archive`
- March 2026 build/deploy fixes around Vercel, Next config, package manifests, lockfile, and auth-aware pages

Current local working-tree changes are user-owned and should not be overwritten:

- `pnpm-lock.yaml`
- `apps/web/next-env.d.ts`

## Files To Avoid During UX Passes

Avoid editing these unless the specific task requires it and the reason is documented in the change:

- `pnpm-lock.yaml`
- `package.json`
- `apps/web/package.json`
- `apps/web/next.config.mjs`
- `apps/web/tsconfig.json`
- `vercel.json`
- `turbo.json`
- `apps/web/app/layout.tsx`
- `apps/web/app/login/page.tsx`
- `apps/web/app/settings/social/page.tsx`
- `apps/web/lib/mock-data.ts`
- `packages/ai/package.json`
- `packages/types/package.json`

## Safe Implementation Strategy

1. Build new UX surfaces additively before replacing existing flows.
2. Prefer new shared components under `apps/web/components` over large rewrites inside route files.
3. Keep public-side work separate from Studio work.
4. Preserve existing API calls and mock fallbacks until the backend contract is explicitly changed.
5. Do not change auth, package, deployment, or lockfile behavior as part of visual/page restructuring.
6. Run build/typecheck after each large slice and inspect any failures before proceeding.

## Phase 1 UX Scope From Spec

Initial large-scale UX work should focus on:

- Public Discover homepage with hero/search and rows for developer spaces, writing, public spaces, and forum.
- Studio Dashboard replacing the direct persona-list landing experience.
- Studio sidebar structure with publish, chat/persona actions, search, public presence, personas, archives, notes, export, settings, and pinned Station Assistant.
- Chat view with center chat, archive attach row, and persona panel.
- Persona Management page structure.
- Notes and Scratchpad.
- Global Archive and Persona Archive.
- Basic Integrity Session flow.
- Publish flow with Station blog and Reddit connector placeholder.
- Writing, Public Spaces, Forum, Settings, Export Workspace, About, and onboarding surfaces.

## Deferred Scope

Keep these out of the first implementation slice unless explicitly requested:

- Developer Space ingestion API and live observatory infrastructure.
- Full Developer Space page implementation.
- Persona Directory and Persona Roulette.
- Events beyond a placeholder/list page.
- Social connectors beyond Reddit placeholders.
- Notifications dashboard.
- Sub-community creation.
- Background job infrastructure.

## Compatibility Checks Before Each Commit

- Confirm `git diff --name-only` does not include protected files unexpectedly.
- Confirm current user-owned changes are still present.
- Confirm new routes do not break existing route paths.
- Confirm public nav and Studio nav agree with the spec.
- Confirm build/typecheck status is recorded.
