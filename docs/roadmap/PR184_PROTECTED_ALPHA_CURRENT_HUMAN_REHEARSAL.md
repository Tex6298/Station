# PR184 - Protected Alpha Current Human Rehearsal

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: ARIADNE runs the human-eye route rehearsal.
Reviewer: MIMIR accepts the product verdict; DAEDALUS fixes only concrete
route/code blockers; ARGUS reviews only if a security/privacy/backend claim is
implicated.
Status: open for ARIADNE

## Why This Lane

PR183 found no justified backend implementation lane right now. The exact next
recommendation was a protected-alpha/demo rehearsal using the current operator
pack and route evidence.

This is not a backend keep-busy lane. It is the human-eye pass that decides
whether the accepted protected-alpha system feels runnable and where the next
concrete product or code defect actually is.

## Current Truth Before Rehearsal

- `STATION_PR_PLAN_V3.md` is complete through V3-05; no V3-06 exists.
- PR181 proves bounded protected-alpha Stripe test-mode activation on a clean
  non-production account.
- PR182 reconciles current readiness docs after Stripe.
- PR183 says no current backend implementation lane is justified from source
  truth alone.
- Redis/Upstash, Cloudflare, workers, provider migration, broad billing,
  risky Developer Agent actions, and broad UI are deferred until concrete
  evidence opens them.

## Inputs

Use these as the operator pack:

- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK.md`
- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/ops/STAGING_REPLAY_READINESS.md`
- `docs/roadmap/ACTIVE_STATUS.md`

Hosted targets:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

## Rehearsal Route Set

ARIADNE should run the route sequence as a human would, using current staging:

1. Public front door and Discover:
   - `/`
   - `/discover`
2. Public chain:
   - public Space
   - public document
   - linked forum discussion where available
3. Forums:
   - `/forums`
   - one category
   - one thread
4. Signed-in owner path:
   - `/login`
   - `/studio`
   - `/studio/personas/:personaId`
5. Continuity and memory:
   - persona continuity
   - persona memory
   - persona canon if route exists
   - runtime context/preview affordance if visible
6. Archive and export:
   - persona archive/files
   - owner-only manifest/bundle readback if visible
7. Developer Spaces:
   - public observatory
   - owner manage page
   - confirm no API keys/secrets are exposed
8. Billing:
   - `/billing`
   - billing status/plan clarity only
   - do not run a new Checkout unless MIMIR explicitly opens a paid-flow proof
9. Settings/account:
   - `/settings`
10. Mobile spot check at about 390px:
   - `/`
   - `/discover`
   - `/studio`
   - persona archive/files
   - public document
   - Developer Space observatory

## What To Look For

Pass/fail each route using human-eye judgement:

- Does the route explain where the user is and what they can do next?
- Are public/private/community boundaries clear?
- Are non-navigation buttons and controls live, disabled, or visibly
  unavailable?
- Does continuity feel like its own value stop, not just a runtime-count panel?
- Does archive/export read as trust infrastructure, not a generic file list?
- Does Developer Space read as an observatory/research surface, not a generic
  metrics dashboard?
- Does Billing reflect the accepted protected-alpha/test-mode truth without
  overclaiming production billing?
- On mobile, is there document-level overflow, clipped text, hidden primary
  action, or label collision?

## Evidence Rules

Capture:

- route labels;
- desktop/mobile pass/fail;
- concrete route/action defects;
- exact visible copy or button label when it is the defect;
- whether the next owner should be DAEDALUS, ARGUS, ARIADNE, or MIMIR.

Do not capture:

- credentials, tokens, cookies, owner IDs, persona IDs, export IDs, trace IDs,
  Stripe IDs, Checkout URLs, portal URLs, webhook payloads, payment details,
  raw route bodies, private archive excerpts, prompts, completions, or API keys.

## Output

Update this file and `docs/roadmap/ACTIVE_STATUS.md`.

If the rehearsal passes, wake MIMIR with:

- pass verdict;
- route set covered;
- spoken caveats;
- recommended next lane or "pause until fresh evidence."

If a concrete route/code defect appears, wake DAEDALUS with:

- exact route;
- viewport;
- account role;
- action;
- expected result;
- actual result;
- narrowest fix.

If a privacy/security/overclaim defect appears, wake ARGUS with the exact
claim or boundary at risk.
