# PR116 - Replay Optimization Baseline

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: ARIADNE rehearses first. DAEDALUS patches only concrete blockers or
bottlenecks from that rehearsal. ARGUS validates security, owner scope, and
regressions after implementation.
Status: ARIADNE found a blocker; ready for DAEDALUS patch.

## Why This Lane

PR111 through PR115 established provider policy, retrieval metadata, operational
cache, background job foundations, and Cloudflare retrieval boundaries. The next
backend roadmap item is BE-08 Replay-driven optimization.

This lane must optimize actual online behavior, not local guesses. ARIADNE
should run a human-eye staging rehearsal and produce concrete pass/fail evidence
that DAEDALUS can patch without sending broad checking back to Marty.

## Goal

Create a replay optimization baseline for the live Railway staging target and
turn only proven issues into bounded implementation tasks.

Target:

- `https://stationweb-production.up.railway.app`

## ARIADNE Scope

ARIADNE should rehearse as a human user and record:

- route chain health for landing, Discover, public Space/public document/forum
  discussion, Studio, persona Memory, Continuity, Archive, Integrity, Export,
  Developer Space, Settings/Billing;
- Memory and retrieval quality: seeded anchors are retrieved, source labels make
  sense, held-out/context reasons are understandable, and private material does
  not leak;
- Archive/import confidence: paste/import flow, failed-state honesty, source
  counts, archive trust copy, storage/quota readback;
- chat latency and response quality, including whether retrieved Memory/archive
  material is visibly useful;
- job failure recovery/readback, where current surfaces expose import/export/job
  status;
- export trust: manifest/bundle readback, owner-only framing, counts, and no
  private/public confusion;
- billing/webhook path reliability using test-only Stripe paths where available;
- provider/cache/job observability signals only when surfaced safely;
- mobile and desktop usability for the same flow.

For every issue, ARIADNE should classify:

- `blocker`: breaks the staging replay or creates privacy/security risk;
- `fix-now`: demo-visible broken or confusing behavior;
- `defer`: useful improvement but not replay-blocking;
- `pass`: verified good enough.

## DAEDALUS Scope

DAEDALUS should not begin broad optimization until ARIADNE hands off concrete
evidence. After that handoff, DAEDALUS should patch only bounded `blocker` and
`fix-now` items unless MIMIR opens a follow-up lane.

Likely patch categories:

- broken buttons/actions;
- missing or confusing status readback;
- unsafe or unclear source labels;
- retrieval/memory quality regressions;
- archive/import/export confidence gaps;
- Stripe test-path/webhook handling defects;
- obvious latency or failure handling problems with narrow cause.

## Non-Scope

Do not add:

- broad redesign;
- speculative performance work;
- new provider switch;
- live Cloudflare runtime;
- Redis canonical memory;
- background worker execution beyond accepted foundations;
- production Stripe changes outside test-safe paths;
- private data exposure;
- secret, prompt, provider payload, archive excerpt, or token logging.

## Handoff Requirements

ARIADNE must wake DAEDALUS if implementation fixes are needed, with:

- exact route;
- account state used, without secrets;
- steps to reproduce;
- observed result;
- expected result;
- classification;
- screenshot/test artifact reference if available;
- whether mobile, desktop, or both are affected.

If there are no implementation fixes, ARIADNE should wake MIMIR with a closeout
verdict and recommended next lane.

DAEDALUS must wake ARGUS after fixes. ARGUS must wake MIMIR after review.

## Validation

ARIADNE:

```bash
git diff --check
```

plus human rehearsal notes/artifacts.

ARIADNE result:

- `docs/roadmap/PR116_REPLAY_OPTIMIZATION_BASELINE_ARIADNE.md`
- Blocker: staged public forum category reads return HTTP 500 because
  `public.community_subcommunities` is missing from the schema cache, and hosted
  `/forums` visibly renders the schema-cache error on desktop and mobile.
  DAEDALUS should patch this before MIMIR closes PR116.

DAEDALUS, if patching:

```bash
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

plus focused tests matching touched areas.
