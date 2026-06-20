# PR116 - Replay Optimization Baseline

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: ARIADNE rehearses first. DAEDALUS patches only concrete blockers or
bottlenecks from that rehearsal. ARGUS validates security, owner scope, and
regressions after implementation.
Status: closed by MIMIR on 2026-06-20

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

DAEDALUS patch / ARGUS review:

- DAEDALUS patched the hosted forum category/schema-cache blocker by tolerating
  only missing-relation/schema-cache errors for `community_subcommunities` and
  falling back only to legacy public category slugs `general` and
  `documents-and-codexes`.
- ARGUS accepted the patch on 2026-06-20. Unknown, private, unlisted, and
  subcommunity-backed categories stay closed; subcommunity routes, moderation,
  reporting, witness/recognition, delegated moderation, community-tier, auth,
  and visibility rules were not relaxed.
- After deployment, ARIADNE should rerun the hosted forum/browser PR116 checks
  before MIMIR closes PR116.
- ARIADNE reran after the first deployment and found a second hosted blocker:
  runtime commit `772b5fa14ed2` returned the two legacy public categories and
  kept unknown categories closed, but public category thread reads for `general`
  and `documents-and-codexes` still returned HTTP 500 because hosted `threads`
  was missing `authorship_kind`; `/forums/general` visibly exposed that schema
  error on desktop and mobile.
- DAEDALUS patched that second blocker with a legacy thread-select retry only
  for missing `threads.authorship_*` column/schema-cache errors.
- ARGUS accepted the authorship fallback on 2026-06-20. Non-authorship thread
  query failures still return 500; category, status, visibility, hidden filters,
  sort/search behavior, and the accepted `community_subcommunities` fallback are
  preserved. Legacy rows default to safe user-authored provenance.
- After the second deployment, ARIADNE reran hosted forum/browser checks and
  found the accepted fallback working on Railway runtime commit
  `edbc01bb25b6`.
- Public legacy category thread reads now return 200 for anonymous and
  replay-owner states: `general` had one public thread, and
  `documents-and-codexes` had four public threads.
- Unknown, private-named, unlisted-named, and subcommunity-backed-style category
  probes stayed closed with 404 for anonymous and replay-owner states.
- Hosted `/forums`, `/forums/general`, and `/forums/documents-and-codexes`
  loaded on desktop and 390px mobile without visible schema-cache,
  missing-column, or raw authorship-id errors. Owner-state spot checks for
  landing, Discover, Studio, replay public Space, replay public Developer Space,
  and Billing loaded without visible application error or document-level
  horizontal overflow.
- PR116 is ready for MIMIR closeout. Deferred note: the earlier selected public
  document discussion seed/content caveat remains non-blocking because the
  public document route itself loaded while
  `GET /documents/:id/discussion` returned `eligible:true` with
  `discussion:null`.

MIMIR closeout:

- MIMIR closes PR116 on 2026-06-20. The hosted replay baseline is accepted for
  the scoped Railway staging pass.
- The forum/browser blockers are cleared on runtime commit `edbc01bb25b6`.
- The next lane is the deferred public document discussion chain so the public
  route sequence can complete without relying on absent seed/content state.

DAEDALUS, if patching:

```bash
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

plus focused tests matching touched areas.
