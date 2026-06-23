# PR199 - UX-01A Studio Place and Mobile Workbench Clarity

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Review path: ARIADNE reviews visible desktop and 375px route changes after
implementation; ARGUS reviews only if auth, route protection, owner/private
fields, export/storage/provenance semantics, public surfaces, Developer Agent
actions, key handling, or billing behavior changes
Status: open

## Why This Lane

PR198 completed the Studio/Archive UX feasibility map and recommended UX-01A as
the first implementation slice. MIMIR accepts that recommendation.

This slice should improve the owner workbench without trying to redesign the
whole app. The goal is simple: on every core Studio route, the owner should
know where they are, what privacy state applies, and what the next safe action
is, including at 375px mobile width.

## Scope

Use existing route helpers, Studio frame primitives, and scoped CSS only unless
MIMIR reopens scope.

Primary files to inspect and touch only if needed:

- `apps/web/lib/studio-navigation.ts`
- `apps/web/components/studio/studio-sidebar.tsx`
- `apps/web/components/studio/studio-frame.tsx`
- `apps/web/components/studio/studio-dashboard.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/studio/layout.tsx`
- `apps/web/app/globals.css`

Routes to keep in the visible check:

- `/studio`
- `/studio/personas/:personaId`
- `/studio/personas/:personaId/memory`
- `/studio/personas/:personaId/continuity`
- `/studio/personas/:personaId/files`
- `/studio/personas/:personaId/calibration`
- `/studio/assistant`

## Implementation Goals

- Studio shell names the current place clearly on desktop and mobile.
- Private/owner workspace state is legible without adding warning clutter.
- Mobile Studio navigation shows the current stop and does not force users to
  open a long panel to understand where they are.
- Dashboard and persona workspace primary actions are easier to scan.
- Persona workbench routes retain the existing tabs and route semantics.
- Empty/loading/error states keep using existing `StudioFrame` primitives.
- The tone moves toward calm continuity workbench, not generic dashboard.

## Hard Boundaries

Do not:

- change API calls, route protection, auth/session behavior, data fetching,
  owner/private field exposure, public route behavior, billing, export, storage,
  Developer Agent actions, provider behavior, Redis, Cloudflare, workers,
  schema, migrations, Railway, or Supabase;
- touch Archive trust, Developer Space manage, Billing UX, or public Discover
  beyond what is incidentally visible in shared nav chrome;
- add broad site-wide reskin or generic decorative style work;
- commit screenshots, credentials, cookies, tokens, raw IDs, private excerpts,
  prompts, completions, provider payloads, Checkout URLs, Stripe IDs, or
  private route bodies.

If implementation pressure points toward any boundary above, stop and wake
MIMIR with the exact reason.

## Validation

Expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
npm exec --yes pnpm@10.32.1 -- run build
git diff --check
```

If build or lint hits known unrelated repo warnings, record the exact failure
and continue with focused tests rather than hiding it.

Add a local browser/mobile confidence check for `/studio`, one persona
workspace route, Memory, Continuity, and persona Archive at desktop and 375px.
Do not commit screenshots.

## Expected Response

Wake MIMIR with:

- implementation summary;
- exact files touched;
- validation results;
- desktop/375px visible route notes;
- whether ARIADNE should review directly or ARGUS must review first;
- any deferred UX-02A or UX-01B follow-up.

Do not go quiet without a wakeup.
