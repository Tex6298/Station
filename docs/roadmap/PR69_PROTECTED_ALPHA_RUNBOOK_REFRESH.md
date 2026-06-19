# PR69 - Protected Alpha Runbook Refresh

Date: 2026-06-19
Status: opened by MIMIR; ready for ARIADNE runbook update
Owner: ARIADNE refreshes the human-facing runbook, MIMIR closes or resequences.

## Purpose

Refresh the protected-alpha replay/demo runbook now that the Memory UX,
observability, and public story continuity checks have passed on Railway.

PR39's runbook predates PR60 through PR68. The demo script should now speak the
core promise more clearly: Station helps an owner understand what it remembers,
what it holds out, how continuity/integrity/archive review feed runtime trust,
and how private work becomes public story deliberately.

This is a documentation refresh only.

## Inputs

Review:

- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md`
- `docs/roadmap/PR66_MEMORY_OBSERVABILITY_LANE_CLOSEOUT.md`
- `docs/roadmap/PR67_STAGING_REPLAY_SEQUENCE_AFTER_MEMORY.md`
- `docs/roadmap/PR67_MEMORY_OBSERVABILITY_STAGING_REPLAY_ARIADNE.md`
- `docs/roadmap/PR68_PUBLIC_STORY_CONTINUITY_REHEARSAL.md`
- `docs/roadmap/PR68_PUBLIC_STORY_CONTINUITY_REHEARSAL_ARIADNE.md`
- `docs/roadmap/ACTIVE_STATUS.md`

## Scope

Update the protected-alpha operator script so it reflects the current accepted
proof:

- Replace stale deployment/runtime notes with the PR67/PR68 Railway runtime
  evidence where useful.
- Add the memory/observability story beats:
  - Memory lifecycle: active versus held-out memory;
  - persona lifecycle/handoff readback;
  - Continuity as its own stop;
  - Integrity output review and destination labels;
  - Archive import review into Memory or Canon;
  - Settings AI Activity as sanitized owner observability;
  - Developer Space manage: live state versus metered usage.
- Update the public story chain with the PR68 proof:
  - `/` to `/discover`;
  - public Space;
  - public document;
  - linked forum discussion;
  - document/thread route controls.
- Update caveats:
  - protected-alpha, not production launch;
  - owner-private Memory may contain owner-visible seeded/replay text;
  - public Space story works through featured works/public library even if
    authored pages/personas are thin;
  - linked thread may be found through search/document route rather than latest
    feed;
  - any Developer Space methodology/evidence caveat should match the current
    PR65/PR67 evidence, not stale PR39 wording.
- Keep the "do not claim" section conservative about Redis, Cloudflare,
  provider migration, parser/OAuth, workers, hosted runtime, Project, billing,
  DexOS, and broad UI.

Preferred output:

- update `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md`; and
- add a short PR69 result section to this file.

## Non-Scope

- No product code.
- No live rehearsal unless ARIADNE needs a tiny spot-check to avoid stale copy.
- No schema, API, seed data, provider, Redis, Cloudflare, parser/OAuth, worker,
  hosted runtime, Project, billing, DexOS, or broad UI work.
- No secrets, credentials, cookies, private prompts, private archive text, raw
  provider payloads, or private owner IDs in docs.
- No asking Marty to manually validate the runbook.

## Acceptance

MIMIR can close PR69 if:

- The protected-alpha runbook now matches PR67 and PR68 truth.
- The runbook explains memory/observability as Station's core promise without
  overclaiming production readiness.
- Stale caveats are corrected instead of carried forward.
- Future infrastructure and broad UI lanes remain evidence-gated.

## Validation

Run:

```bash
git diff --check
```

If ARIADNE performs a spot-check, record only route, viewport, pass/fail, and
public sanitized facts.

## Handoff

Wake MIMIR with:

- files changed;
- what runbook sections were refreshed;
- stale caveats removed or replaced;
- validation result;
- whether any implementation blocker appeared.

If a real implementation blocker appears during an optional spot-check, wake
DAEDALUS with exact route, viewport, role, expected result, actual result, and
narrowest fix. Otherwise, do not wake DAEDALUS.
