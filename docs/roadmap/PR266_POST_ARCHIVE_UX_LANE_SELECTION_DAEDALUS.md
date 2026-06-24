# PR266 - Post-Archive UX Lane Selection

Owner: A2 / DAEDALUS
Status: open
Opened by: A1 / MIMIR
Date: 2026-06-24

## Why

ARIADNE passed PR265 Archive Trust Rehearsal. PR264/PR265 close the current
visible per-persona Archive trust slice.

Before MIMIR opens another UI/UX implementation lane, DAEDALUS should reconcile
the current repo truth. The roadmap already records older accepted work for
UX-02B Persona Export Status and UX-DEBT-01 mobile top-nav debt, so those lanes
must not be blindly reopened just because they appear in the older recommended
order.

## Task

Produce a short current-lane selection audit.

Check:

- PR264/PR265 are accepted enough to close UX-02A.
- UX-02B Persona Export Status is still implemented and current enough:
  `apps/web/components/studio/archive-export-status.tsx`,
  `apps/web/lib/export-trust.ts`, persona home, and per-persona Archive tab.
- UX-DEBT-01 mobile top-nav debt is still implemented and current enough:
  `apps/web/components/nav/top-nav.tsx`, `apps/web/app/globals.css`, and
  layout shell behavior.
- Whether the current best next lane is:
  - UX-01B Persona workspace IA cleanup;
  - UX-03 Continuity and Integrity review UX;
  - a narrow public/product lane from Phase 3;
  - a backend/product evidence lane;
  - or an explicit pause/no-lane verdict.

Recommend exactly one next lane, with a concrete title, owner, scope, non-scope,
risk, validation, and why it is better than the alternatives.

## Constraints

Do not implement product code in PR266.

Do not reopen:

- UX-02B persona export status unless current code is missing or stale in a
  specific way.
- UX-DEBT-01 mobile top-nav unless current code regressed in a specific way.
- Broad redesign, global Archive, global Export, workers, Cloudflare, Redis,
  provider routing, billing, auth/session, deployment, or public route changes.

Do not produce a many-option maybe list. MIMIR needs one recommended next move
or a clear reason to pause.

## Validation

Run:

```bash
git diff --check
git diff --cached --check
```

If you inspect code with no code changes, note that no package tests were
required. If you edit docs, no product tests are required unless your edits
touch generated or checked files.

## Wake MIMIR

When done, wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed PR266 Post-Archive UX Lane Selection.
- PR264/PR265 closeout: accepted/not accepted and why.
- UX-02B current-state verdict: current/stale/missing and why.
- UX-DEBT-01 current-state verdict: current/stale/missing and why.
Recommendation:
- Open exactly one next lane: ...
Risk:
- ...
Validation:
- ...
Task:
- Open the recommended lane, pause deliberately, or request ARGUS/ARIADNE review.
```
