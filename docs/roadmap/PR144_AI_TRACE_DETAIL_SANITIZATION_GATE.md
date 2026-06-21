# PR144 - AI Trace Detail Sanitization Gate

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE
rehearses only if visible owner-route behavior changes.
Status: Technically accepted by ARGUS on 2026-06-21; ready for MIMIR closeout.

## Why This Lane

MIMIR closes PR143 Memory Lifecycle Review Surface after ARGUS technical
acceptance and ARIADNE owner-route rehearsal.

Lane 6 can now move from Memory lifecycle readback to AI observability. The
existing roadmap allows richer AI trace detail only behind a sanitization spec
and ARGUS privacy gate. That gate is needed because the current
`/observability/traces/:traceId` route calls `getAiTraceDetail`, which selects
raw trace and event rows. Raw trace/event payloads may contain prompts,
provider payloads, private ids, URLs, or secret-shaped values if any writer
regresses.

This lane should make trace detail safe before any richer owner UI relies on
it.

## Goal

Harden AI trace detail readback so an owner can inspect useful operational
facts without receiving raw prompt, completion, provider payload, event payload,
private id, URL, or secret material.

## Scope

DAEDALUS should inspect and harden:

- `apps/api/src/services/ai-observability.service.ts`;
- `apps/api/src/routes/observability.ts`;
- `apps/web/lib/ai-observability-ui.ts`;
- `apps/web/components/settings/ai-observability-panel.tsx`;
- existing observability, studio UI, and route tests.

Implement the smallest safe slice:

- stop `/observability/traces/:traceId` from returning raw `select("*")` trace
  and event rows;
- introduce or reuse a serializer/sanitizer that returns only whitelisted trace
  and event detail fields;
- keep owner scoping on `owner_user_id`;
- preserve useful operational facts:
  - source;
  - status;
  - started/completed timestamps;
  - duration;
  - input/output/total token counts;
  - estimated cost;
  - provider, model, route/profile/policy/posture labels from whitelisted
    metadata;
  - event type, status, provider, model, duration, token counts, estimated cost,
    and sanitized event label/failure reason;
  - bounded sanitized metadata facts where already safe.

If the Settings AI panel can safely link or expand trace detail without a broad
UI pass, DAEDALUS may add a minimal owner-only readback. If visible UI changes,
ARGUS must wake ARIADNE after technical acceptance.

## Privacy Requirements

The route and helpers must not return or render:

- raw system prompts;
- user prompts;
- completions;
- trace bodies;
- raw event payload objects;
- provider request/response payloads;
- private archive excerpts;
- owner ids;
- persona ids;
- conversation ids;
- trace ids beyond the requested route id where unavoidable for routing;
- raw event ids;
- raw source ids;
- raw URLs;
- tokens, cookies, API keys, passwords, bearer values, webhook secrets, DB URLs,
  or other secret-shaped values.

Prefer allow-lists over deny-lists. If a payload key is not explicitly safe, do
not include it.

## Non-Scope

Do not add:

- raw trace viewer;
- public observability;
- new AI calls;
- provider/embedding changes;
- Redis/Upstash or Cloudflare work;
- background jobs;
- Memory mutation;
- billing/auth/session changes;
- broad Settings or Studio redesign;
- migration-ledger repair.

## Tests

Add focused tests for:

- `/observability/traces/:traceId` owner scoping;
- sanitized detail shape and field allow-list;
- prompt/completion/provider payload redaction;
- raw event payload omission;
- private ids and URLs not returned;
- secret-shaped values not returned;
- useful operational facts still present;
- existing Settings AI helper behavior if web helpers change.

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If DAEDALUS adds a dedicated observability route test that is not covered by an
existing script, run it explicitly and name it in the handoff.

## ARGUS Review Requirements

ARGUS should verify:

- the detail route remains authenticated and owner-scoped;
- returned trace/event shapes are allow-listed;
- raw payloads, prompts, completions, provider bodies, ids, URLs, and secrets do
  not return from the API or render in UI helpers;
- the owner still receives useful operational facts;
- no non-scope provider, Memory, Redis, Cloudflare, background job, billing,
  public observability, or ledger work was introduced;
- validation passed.

If visible owner-route behavior changes, ARGUS should wake ARIADNE with exact
routes and human-eye checks. Otherwise ARGUS can wake MIMIR directly.

## DAEDALUS Result

DAEDALUS implemented PR144 on 2026-06-21 and woke ARGUS for technical review.

Implementation:

- Hardened `getAiTraceDetail` in
  `apps/api/src/services/ai-observability.service.ts`.
- Replaced raw trace `select("*")` with an allow-listed trace select:
  `id`, source, status, timestamps, duration, token totals, estimated cost,
  failure message, and metadata.
- Replaced raw event `select("*")` with an allow-listed event select:
  event type, label, status, provider, model, token counts, estimated cost,
  duration, created timestamp, and payload only as sanitizer input.
- The returned trace detail shape now serializes operational fields and sanitized
  metadata only.
- The returned event detail shape omits raw event ids, trace ids, owner ids, and
  raw payload objects. It keeps event type, sanitized label/failure reason,
  provider/model, timestamps, duration, token counts, estimated cost, and
  allow-listed metadata facts.
- Sanitized metadata keeps only safe route/profile/provider/model/model-tier/
  policy/posture/domain facts, including selected nested runtime-budget and
  embedding metadata.
- No Settings AI panel visible behavior changed in this slice.

Privacy proof:

- Added route-level coverage proving cross-owner trace detail returns `404`.
- Added route-level coverage proving trace/event detail does not return raw
  prompts, completions, provider request/response payloads, private archive
  excerpts, owner/persona/conversation/event/source ids, raw URLs, bearer
  values, token/key/password-shaped fields, webhook secrets, or common
  secret-shaped values.
- The requested route trace id remains in the sanitized trace object as the
  owner-requested detail identifier.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed, including the new trace detail sanitizer route test. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 89 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed. |
| `git diff --check` | Pass | CRLF warnings only for touched files and local DAEDALUS state. |

Non-scope preserved: no raw trace viewer, public observability, new AI calls,
provider/embedding changes, Redis/Upstash, Cloudflare, background jobs, Memory
mutation, billing/auth/session changes, broad Settings or Studio redesign, UI
trace detail expansion, or migration-ledger repair was added.

## ARGUS Technical Verdict

ARGUS technically accepts PR144 on 2026-06-21 and wakes MIMIR for closeout.

Review findings:

- `/observability/traces/:traceId` remains authenticated and owner-scoped; cross-
  owner trace detail returns `404`.
- Returned trace and event shapes are allow-listed and omit raw event payload
  objects, owner/persona/conversation/event/source ids, provider request/response
  bodies, prompts, completions, private archive excerpts, URLs, and
  secret-shaped values.
- The owner still receives useful operational facts: source/status/timestamps,
  duration, token counts, cost, provider/model, sanitized labels/failure reasons,
  and allow-listed route/profile/policy/posture metadata.
- ARGUS found and patched a narrow redaction edge where prompt-shaped text with
  multi-word values could leave trailing words, and where allow-listed metadata
  did not reject prompt-shaped values. The sanitizer now redacts prompt-shaped
  labels through the end of the text and rejects prompt-shaped metadata.
- ARGUS also tightened sensitive password/secret/key redaction while preserving
  non-secret operational context for tokenized error messages.
- No Settings AI panel, visible owner route, public observability, raw trace
  viewer, new AI call, provider/embedding, Redis/Upstash, Cloudflare, background
  job, Memory mutation, billing/auth/session, broad Settings/Studio redesign, UI
  trace expansion, API route, database migration, or migration-ledger scope was
  added.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed, including owner-scoped sanitized trace detail route coverage and the ARGUS multi-word prompt/password regression. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 89 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed; API typecheck was a cache miss and executed. |
| `git diff --check` | Pass | CRLF normalization warnings only for local triad/docs state. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

No ARIADNE wake is required because PR144 changed API/service/test/docs only and
did not change visible owner-route behavior.
