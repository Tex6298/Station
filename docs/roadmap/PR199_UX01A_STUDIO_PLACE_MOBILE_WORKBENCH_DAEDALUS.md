# PR199 - UX-01A Studio Place and Mobile Workbench Clarity

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Review path: ARIADNE reviews visible desktop and 375px route changes after
implementation; ARGUS reviews only if auth, route protection, owner/private
fields, export/storage/provenance semantics, public surfaces, Developer Agent
actions, key handling, or billing behavior changes
Status: complete

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

## DAEDALUS Result - 2026-06-23

Verdict: implemented as the bounded UX-01A slice. Studio now names the current
place more clearly on desktop and mobile without changing route semantics,
auth/session behavior, API calls, private field exposure, public routes,
Archive trust, Developer Space manage, Billing, config, or backend behavior.

Files touched:

- `apps/web/lib/studio-navigation.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `apps/web/components/studio/studio-sidebar.tsx`
- `apps/web/components/studio/studio-frame.tsx`
- `apps/web/components/studio/studio-dashboard.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/globals.css`

Implementation summary:

- Added a typed `studioRouteContext` helper that maps Studio static routes and
  persona workbench routes to current-stop labels, owner/privacy copy, and
  stable hrefs.
- Extended persona workspace tab metadata with concise route-purpose details.
- Updated the Studio desktop sidebar with a small "Current stop" card.
- Updated the mobile Studio disclosure summary so users can see the active
  stop and owner/private state without opening the full menu.
- Added a reusable `StudioPlaceStrip` primitive and used it on the dashboard and
  persona workspace header.
- Tightened dashboard action labels while keeping the same links.
- Added scoped CSS for the current-place strip, sidebar card, and mobile
  summary, including 375px-safe truncation/wrapping.

Desktop and 375px browser notes:

- Temporary local Playwright route sweep passed against local web/API dev
  servers using ignored replay-owner env values in process memory.
- Desktop and 375px checks covered `/studio`, one persona workspace route,
  Memory, Continuity, persona Archive, Integrity, and `/studio/assistant`.
- Each route exposed the expected current-place label in either the desktop
  sidebar/place strip or the mobile summary.
- No document-level horizontal overflow was detected on those checked routes.
- Temporary test file and `test-results` output were removed and not committed.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
npm exec --yes --package @playwright/test@1.41.2 -- playwright test tmp-pr199-studio-workbench-check.spec.js --reporter=line --workers=1
git diff --check
git diff --cached --check
```

Results:

- `test:studio-ui`: pass, 105 tests.
- `test:auth`: pass, 16 tests.
- `typecheck`: pass.
- `lint`: pass with existing raw `<img>` warnings in
  `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`, both outside this
  slice.
- Local Playwright browser route sweep: pass.
- `git diff --check`: pass.
- `git diff --cached --check`: pass.
- Staged credential/raw-id pattern scan: pass.

Build note:

- `npm exec --yes pnpm@10.32.1 -- run build` compiled successfully, linted,
  type-checked, generated static pages, and then failed while copying Next
  standalone traced files because Windows refused symlink creation.
- Exact failure class: `EPERM: operation not permitted, symlink`.
- Representative failing target:
  `apps\web\.next\standalone\apps\web\node_modules\react`.
- Reason: local Windows symlink permission during Next `output: "standalone"`
  trace-copy, not a TypeScript, route, lint, or runtime compile failure from the
  PR199 changes.

Review recommendation:

- ARIADNE should review PR199 directly for visible desktop and 375px route
  experience.
- ARGUS does not need to review first because this slice did not change auth,
  route protection, owner/private fields, export/storage/provenance semantics,
  public surfaces, Developer Agent actions, key handling, or billing behavior.

Deferred follow-up:

- UX-02A Archive trust scan pass remains the next product-density candidate if
  MIMIR wants Archive work.
- UX-01B dense owner console grouping remains separate for Developer Space
  manage and tiny Billing entitlement/status clarity.
