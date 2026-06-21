# PR131 - 2C Observed Runtime Adapter Discovery

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS investigates and documents. ARGUS reviews dependency claims,
Cloudflare scope, and overclaim risk. ARIADNE is not required.
Status: accepted by ARGUS; ready for MIMIR closeout

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

## DAEDALUS Discovery Result

DAEDALUS completed the docs/evidence discovery on 2026-06-21.

Discovery map:

- `docs/architecture/observed-runtime-adapter-discovery.md`

Local Station sources reviewed:

- `docs/ops/open-repo-upgrade-review.md`
- `docs/integration/intelhub-to-station-developer-spaces.md`
- `docs/architecture/observed-runtime-fixture-preflight.md`
- `docs/ops/CLOUDFLARE_DEPENDENCY_CHECK.md`
- `docs/roadmap/PR129_2C_OBSERVED_RUNTIME_READINESS_CLOSEOUT.md`
- `packages/developer-space-client/README.md`

Public repo sources reviewed:

- `https://github.com/simple10/agents-observe`
- `https://github.com/simple10/agents-observe/blob/main/docs/DEVELOPMENT.md`
- `https://github.com/builderz-labs/mission-control/blob/main/docs/quickstart.md`
- `https://github.com/builderz-labs/mission-control/blob/main/package.json`
- `https://github.com/tobilg/ai-observer/blob/main/README.md`
- `https://github.com/cindiekinzz-coder/NESTstack`

Finding:

- `simple10/agents-observe`, `tobilg/ai-observer`, and
  `builderz-labs/mission-control` do not show a Cloudflare hard dependency for
  the adapter shape. Each can be treated as local/self-hosted source material
  that would need a small bridge into the PR128 signed webhook packet.
- `cindiekinzz-coder/NESTstack` is mixed: local Path A does not require
  Cloudflare, while its full continuity/daemon/mobile path is Cloudflare-native
  and uses Workers/D1/Vectorize/Durable Objects as core architecture.
- Station already overlaps on Supabase-backed Developer Space persistence,
  signed webhooks, classified readback, receipt-backed replay, and public/
  member/owner filtering. It should observe/import runtime state, not adopt
  external runtime execution or orchestration truth.

Recommendation:

- Next lane should be one concrete adapter spike for
  `simple10/agents-observe`: a docs/test-only transform from hook/session sample
  data to `DeveloperSpaceBatchImportPayload`, then PR128 signed webhook request
  construction.
- Do not open Cloudflare boundary design yet. Current evidence only makes
  Cloudflare mandatory for a full NESTstack-style Cloudflare runtime, not for
  the first Station observed-runtime adapter proof.

## Validation

Docs/evidence lane:

```bash
git diff --check
```

DAEDALUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `git diff --check` | Pass | CRLF normalization warnings only. |

If DAEDALUS adds scripts or package code, run the relevant focused tests and
explain why the lane stopped being docs-only.

## ARGUS Review - 2026-06-21

ARGUS accepts PR131 as a docs/evidence-only discovery lane.

Review result:

- The implementation matches MIMIR's requested lane: local Station docs were
  checked first, public GitHub sources were used only for named targets, and the
  result is a dependency/adaptation map rather than an adapter implementation.
- The external-source spot-check supports the Cloudflare classification:
  Agents Observe documents hook stdin JSON, `observe_cli.mjs` HTTP posting,
  Hono/SQLite/WebSocket storage/readback, and no Cloudflare requirement; AI
  Observer documents self-hosted local/DuckDB/file-watch/OTLP paths and no
  Cloudflare mention; Mission Control documents a `curl`-only first agent loop
  plus Next/SQLite/WebSocket/pty package dependencies and no Cloudflare package
  requirement; NESTstack documents both no-Cloudflare local Path A and a
  Cloudflare-native full Path B/full-stack path with Workers/D1/Vectorize/
  Durable Objects.
- Station's boundary remains intact: the recommendation is to observe/import
  public-safe summaries through the existing PR128 signed webhook packet, not
  to host runtimes, dispatch tasks, adopt external orchestration truth, or move
  canonical persistence out of Supabase.
- Privacy/auth risk is called out correctly for the next lane: raw prompts,
  command bodies, paths, tokens, tool payloads, and trace bodies should default
  to private/secret until a narrow transform proves otherwise.
- The next-lane recommendation is specific and safe enough for MIMIR:
  `simple10/agents-observe` docs/test-only fixture transform to
  `DeveloperSpaceBatchImportPayload`, plus PR128 signed webhook request
  construction.
- Non-claims are honest. No external repo code, adapter implementation,
  Cloudflare setup, hosted runtime, queue, Worker, Durable Object, Vectorize
  index, D1 database, partner onboarding UI, billing/Stripe, Redis memory
  truth, provider routing, broad UI, production partner claim, or committed
  secret value was added.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `git diff --check HEAD^ HEAD` | Pass | Committed PR131 patch has no whitespace errors. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Patch secret-pattern scan | Pass | No committed secret-shaped values found in the PR131 patch. |

Verdict: close PR131 as accepted. Wake MIMIR to decide whether to open the
recommended `simple10/agents-observe` docs/test-only adapter spike or choose a
different next move.

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
