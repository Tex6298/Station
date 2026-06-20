# PR118 - Final Hosted Rehearsal Sweep

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: ARIADNE rehearses first. DAEDALUS patches only concrete blockers.
ARGUS reviews any technical fixes.
Status: accepted by ARIADNE; ready for MIMIR closeout

## Why This Lane

PR116 and PR117 cleared hosted replay blockers in public forum categories,
public category threads, public document discussion recovery, and linked thread
detail rendering. Before staging is treated as steady, Station needs one final
human-eye hosted sweep across the demo path.

This is a rehearsal lane, not a broad redesign or speculative optimization pass.

## Goal

Verify the hosted staging demo path remains coherent after the forum/document
discussion fixes and identify only concrete blockers or fix-now defects.

Target:

- `https://stationweb-production.up.railway.app`

## ARIADNE Scope

Rehearse desktop and 390px mobile where practical:

- landing -> Discover;
- public Space -> public document -> linked forum discussion;
- Forums landing and legacy public categories `general` and
  `documents-and-codexes`;
- Studio dashboard and replay persona;
- Memory/context preview;
- Continuity, Archive, Integrity, and Export surfaces;
- Developer Space public observatory and owner/manage view if available;
- Settings/Billing as bounded test-mode evidence only.

Classify each issue:

- `blocker`: breaks the staged demo path or risks privacy/security;
- `fix-now`: visible broken/confusing behavior worth patching before steady
  staging;
- `defer`: non-blocking product improvement;
- `pass`: good enough for current staging.

## Non-Scope

Do not open:

- broad UI redesign;
- speculative performance work;
- new provider switching;
- live Cloudflare runtime;
- Redis canonical memory;
- background worker execution;
- production Stripe changes;
- private data exposure;
- secret, prompt, provider payload, archive excerpt, Stripe object, or token
  logging.

## Handoff Requirements

If blockers or fix-now issues remain, ARIADNE should wake DAEDALUS with:

- exact route;
- account state used, without secrets;
- reproduction steps;
- observed result;
- expected result;
- classification;
- desktop/mobile scope;
- artifact reference if available.

If no implementation fixes are required, ARIADNE should wake MIMIR with:

- pass/fail summary;
- deferred notes;
- recommendation for next lane.

## ARIADNE Hosted Sweep

Run date: 2026-06-20

Verdict: `pass` for the current hosted staging demo path. No blocker or
fix-now implementation issue was found in the scoped rehearsal.

Deployment evidence:

- API `/health/deployment` returned 200, `ready:true`, and Railway runtime
  commit `3d2e07511fea`.

API rehearsal:

- Replay owner sign-in and `/auth/me` succeeded without logging secrets.
- Owner persona readback found 2 personas.
- Public Space `station-replay-alpha` returned 5 public documents.
- `documents-and-codexes` returned 4 public forum threads; `general` returned
  1 public forum thread; an invalid legacy category returned 404.
- Public document discussion and linked forum thread detail returned bounded
  responses without raw schema-cache or missing-column text.
- Owner Memory/context, Continuity, Archive files/imports, Integrity history,
  persona Export, Billing, observability summary/traces, Developer Space public
  detail/stream, Developer Space owner detail/usage, and Developer Space export
  reads returned bounded hosted responses.

Browser rehearsal:

- Desktop and 390px mobile checks covered landing, Discover, public Space,
  public document, linked forum thread, Forums, `general`,
  `documents-and-codexes`, public Developer Space, Studio dashboard, replay
  persona home, Memory, Continuity, per-persona Archive files, Integrity,
  global Archive, Export, Settings, Billing, and Developer Space owner manage.
- 40 page checks completed without visible application errors, raw
  schema-cache/missing-column text, auth token text, Stripe secret-shaped text,
  or document-level horizontal overflow.

Deferred notes:

- None for this sweep. Public and owner Developer Space data were available in
  the hosted replay dataset.

## Validation

```bash
curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment
npx --yes @playwright/test@1.41.2 test tmp-pr118-final-hosted-sweep.spec.js --reporter=line --workers=1
git diff --check
```

plus hosted rehearsal notes/artifacts. DAEDALUS, if patching, should add focused
tests for touched areas and run `typecheck` plus `git diff --check`.
