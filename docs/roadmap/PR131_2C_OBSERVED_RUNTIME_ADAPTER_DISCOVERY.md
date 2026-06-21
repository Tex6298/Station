# PR131 - 2C Observed Runtime Adapter Discovery

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS investigates and documents. ARGUS reviews dependency claims,
Cloudflare scope, and overclaim risk. ARIADNE is not required.
Status: open for DAEDALUS

## Why This Lane

PR130 is blocked until deliberate smoke config exists:

- `STATION_API_URL`
- `STATION_DEVELOPER_KEY`
- `STATION_OBSERVED_RUNTIME_WEBHOOK_ID`

MIMIR will not rotate a real Developer Space ingestion key just to satisfy a
smoke proof. While that config is pending, the useful config-free next move is
adapter discovery: identify what the GitHub-derived/runtime repos actually need
and where Cloudflare is a real dependency versus a deferrable deployment
choice.

## Scope

- Review existing Station docs for GitHub-derived/runtime clues before opening
  new assumptions, especially:
  - `docs/ops/open-repo-upgrade-review.md`;
  - observed-runtime docs from PR120-PR130;
  - Developer Space partner/readiness docs;
  - any integration docs that mention IntelHub, mission-control,
    agents-observe, Cloudflare, Worker, Vectorize, D1, Queues, or runtime
    observability.
- If local docs identify external GitHub repositories clearly enough, inspect
  public repo docs/code as needed and cite exact dependency evidence. Do not
  claim dependency facts from memory.
- Produce an adapter discovery map:
  - candidate repo/runtime;
  - what data it emits or expects;
  - whether it can call the PR128 signed webhook packet directly;
  - whether it requires Cloudflare Worker, Vectorize, D1, Queue, Durable
    Objects, KV, R2, or another Cloudflare primitive;
  - what Station already supports;
  - the smallest adapter/bridge needed;
  - what should remain deferred.
- Distinguish:
  - hard dependency: the repo cannot run or integrate without that service;
  - convenient deployment default: the repo docs prefer it but an adapter could
    call Station without it;
  - overlapping capability: Station already has a Supabase/Railway/Developer
    Space path for the same role;
  - hybrid possibility: Cloudflare handles edge/runtime collection while
    Station remains the Supabase-backed persistence/readback system.
- Recommend the next lane:
  - PR130 smoke config retry;
  - one concrete adapter spike;
  - Cloudflare boundary design;
  - visible UX/readback;
  - or pause.

## Non-Scope

- No implementation adapter yet.
- No Cloudflare account/config request, Worker deployment, Vectorize/D1/Queue
  setup, or migration of canonical Station truth out of Supabase.
- No hosted runtime, worker/queue runtime, partner onboarding wizard, visible
  secret-management UI, user-pasted secret flow, billing/Stripe, Redis memory
  truth, provider routing, chat-native developer agent, broad UI, production
  partner claim, or committed secret values.
- No printing `.env` values, tokens, API keys, repository credentials, private
  payloads, cookies, bearer tokens, or secrets.

## Acceptance

- The discovery map names exact local docs and, if used, public repo sources
  behind each dependency claim.
- Cloudflare is separated into hard dependency, deployment default, overlap, or
  hybrid option.
- Station's current PR120-PR128 foundation is mapped to the candidate adapter
  needs without overclaiming runtime execution/hosting.
- The next-lane recommendation is specific enough for MIMIR to wake DAEDALUS or
  ARGUS without re-litigating the whole backend plan.

## Validation

Docs/evidence lane:

```bash
git diff --check
```

If DAEDALUS adds scripts or package code, run the relevant focused tests and
explain why the lane stopped being docs-only.

## Handoff

Wake ARGUS with:

- files reviewed;
- external repos/sources reviewed, with links or exact local refs;
- adapter discovery map;
- Cloudflare dependency classification;
- overlap/hybrid recommendations;
- exact next-lane recommendation;
- validation;
- non-claims and no-secret proof.

Wake MIMIR only if the repo/source list is too ambiguous to proceed without a
user-provided target.
