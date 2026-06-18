# PR25 - Four Onboarding Paths Alpha

Date: 2026-06-18
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses if visible route
truth changes.

## Purpose

Move Station from "launch-core sufficient for protected-alpha replay" toward
the documented onboarding promise without pretending unfinished paths are live.

The user-facing promise is four entry paths into Station:

1. Fresh Start.
2. Awakening.
3. Document Migrator.
4. API Bridge.

This lane should make those paths visible, honest, and routeable for alpha
testing. A path may be narrow, but it must not be fake. If a path cannot be
made live in this slice, show it as clearly unavailable/deferred and do not
render live-looking controls.

## Scope

### Fresh Start

- Provide a clear path from signed-in entry or Studio empty state into creating
  a blank private persona.
- After creation, land the owner on a real persona workspace route.
- Preserve current auth/session and owner scoping.

### Awakening

- Provide a guided path for starting a persona with reflective/setup context.
- Reuse existing persona, memory, continuity, and integrity surfaces where
  possible.
- If the path starts an integrity session, prove it through existing integrity
  APIs and tests.
- If the first alpha version is a route map rather than a full wizard, make the
  UI copy clear and keep every action real.

### Document Migrator

- Provide a clear path for adding source material into an owned private archive.
- Prefer existing paste/upload/import review flows over new ingestion systems.
- Land the owner where they can see import status, failure messages, and
  candidate review outcomes.
- Do not imply live Reddit/Discord OAuth pulls, recurring sync, or external API
  import if this slice only supports uploaded/pasted material.

### API Bridge

- Determine whether the current Developer Space ingestion setup can honestly
  serve as the alpha API Bridge.
- If yes, route the user to Developer Space setup with ingestion-key guidance
  and a concrete sample event path.
- If no, mark API Bridge as deferred/preview-only with disabled controls and an
  exact reason.
- Do not introduce Cloudflare retrieval, Redis memory truth, provider
  marketplace work, or production worker infrastructure in this lane.

## Product Rules

- No fake live controls.
- No hidden placeholder buttons that appear tappable.
- No broad visual redesign.
- No provider/model configuration changes.
- No Redis/Valkey/Upstash or Cloudflare implementation work.
- No Stripe/billing expansion.
- Keep private archive, memory, canon, continuity, and import results
  owner-scoped.
- Keep public surfaces public-safe.

## Suggested Implementation Shape

DAEDALUS should inspect existing routes before deciding the least invasive
shape. Likely acceptable paths:

- an onboarding chooser reachable from Studio empty state and/or signed-in
  account entry;
- four route cards with exact status labels;
- real links or disabled/deferred controls only;
- reuse of existing create-persona, integrity, archive import, import review,
  and Developer Space setup pages;
- small helper tests that prove the route/status map.

Avoid a large new wizard unless the current codebase already has a natural
pattern for it.

## Required Validation

Run the narrow gates touched by the implementation:

```bash
pnpm typecheck
pnpm test:auth
pnpm test:studio-ui
pnpm test:storage
pnpm test:conversation-archive
pnpm test:integrity
pnpm test:developer-spaces
git diff --check
```

If a listed test script does not exist, record that fact in the handoff instead
of pretending it ran.

## ARGUS Review Ask

ARGUS should hostile-review:

- whether each of the four paths is either genuinely live or clearly deferred;
- route correctness for signed-in and signed-out users;
- owner scoping for private archive/import/memory/continuity surfaces;
- absence of fake buttons and placebo filters;
- mobile 375px layout coherence;
- whether API Bridge claims match actual Developer Space capability.

If visible route flow changed materially, ARGUS should wake ARIADNE for a
human-eye rehearsal before waking MIMIR.

## Wake Discipline

DAEDALUS should not go quiet after implementation.

When done, wake ARGUS with:

- exact routes changed;
- path-by-path status: live, alpha live, or deferred;
- validation commands and results;
- any missing script names or caveats.

If blocked, wake MIMIR with the smallest exact blocker and the recommended next
move.
