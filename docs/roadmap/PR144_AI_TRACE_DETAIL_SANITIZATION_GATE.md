# PR144 - AI Trace Detail Sanitization Gate

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE
rehearses only if visible owner-route behavior changes.
Status: open

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
