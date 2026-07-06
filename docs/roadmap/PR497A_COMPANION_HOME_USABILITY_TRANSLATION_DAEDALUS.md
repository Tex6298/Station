# PR497A - Companion Home Usability Translation

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-07-06

Status: Open

## Source

ARIADNE completed PR497:

`docs/roadmap/PR497_DISCERN_UI_USABILITY_PARITY_AUDIT_RESULT.md`

Accepted recommendation:

```text
ACCEPT_PR497A_COMPANION_HOME_USABILITY_TRANSLATION
```

## Goal

Translate the useful Discern product-feel correction into Tex Station's current
persona home:

```text
private persona home should feel like a companion workspace before it feels like
an admin/readback console.
```

This is a narrow web-only usability translation. It should change first-viewport
hierarchy, copy, labels, and scoped layout around the existing persona home and
private chat. It should not add new backend behavior.

## Required Implementation Shape

Make the persona home first viewport companion-first:

- identity/header, private chat, immediate continuity actions, and compact
  context should be the first experience;
- shortcut strip should sit close to the chat and use companion-action language;
- return-to-thread actions should remain local and owner-triggered, but use
  warmer labels such as:
  - `Pick up where you left off`;
  - `Ask for recap`;
  - `Start fresh`;
- context rail copy should read like aggregate companion continuity context,
  not a technical diagnostic panel;
- public interaction readback, voice/avatar readiness, encounter contracts,
  Runtime Context Preview, archive export, and published continuity history
  should move lower or become secondary without hiding critical safety copy;
- empty/loading/error/provider-setup copy should stay truthful and private, but
  read as companion-workspace states rather than generic admin status.

## Target Files

Expected files:

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/lib/companion-home-context.ts`
- `apps/web/lib/studio-navigation.ts`
- `apps/web/app/globals.css`
- `apps/web/lib/companion-home-context.test.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `apps/web/components/studio/persona-chat.test.ts`

If the implementation needs more files, keep them web/UI-local and explain why
in the result.

## Non-Goals

Do not add or change:

- API routes;
- database schema, RLS, migrations, seeds, auth, quota, storage, billing,
  Stripe, provider/model, prompt/runtime, Redis, Cloudflare, workers, queues, or
  deployment config;
- global Discern CSS import;
- broad Studio shell, topbar, sidebar, or right-panel replacement;
- public persona chat behavior;
- public/private visibility rules;
- Memory/Canon/Archive/Continuity/Integrity semantics;
- new placeholder controls, attach/mic/tool buttons, automation claims, browse
  claims, edit claims, or durable presence claims.

Do not import:

- stale Discern endpoints;
- `source=all`;
- query-selected conversation behavior;
- Discern-only assumptions.

## Required Tests

Run:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Also run a diff-only scope scan proving no changed files in API, DB, migrations,
provider/runtime, billing/Stripe, Redis/Cloudflare, worker/queue, deployment
config, or package metadata unless you stop and wake MIMIR with a blocker.

## Result Required

Create:

```text
docs/roadmap/PR497A_COMPANION_HOME_USABILITY_TRANSLATION_RESULT.md
```

Include:

- summary of user-visible changes;
- exact files touched;
- how Discern product-feel corrections were translated into Tex design;
- explicit boundaries kept;
- validation results;
- whether ARGUS should review directly or whether you hit a blocker.

## Handoff

Wake ARGUS after implementation:

```text
WAKEUP A3:
Codename: ARGUS
```

ARGUS should review privacy/product boundaries, scope discipline, first-viewport
hierarchy claims, mobile risk, and no hidden backend/runtime drift.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- MIMIR accepted ARIADNE's PR497 Discern UI usability parity audit.
- The missing delta is not backend capability; it is persona-home hierarchy and
  product feel.
- PR497A opens a narrow web-only companion-home usability translation.
Task:
- Make the private persona home feel companion-first before admin/readback-first.
- Reorder/relabel the existing persona home/chat/shortcut/context surfaces
  within Tex Station's design system.
- Keep the lane web/UI-local and wake ARGUS with a result.
```
