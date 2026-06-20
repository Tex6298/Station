# PR118 - Final Hosted Rehearsal Sweep

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: ARIADNE rehearses first. DAEDALUS patches only concrete blockers.
ARGUS reviews any technical fixes.
Status: open for ARIADNE

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

## Validation

```bash
git diff --check
```

plus hosted rehearsal notes/artifacts. DAEDALUS, if patching, should add focused
tests for touched areas and run `typecheck` plus `git diff --check`.
