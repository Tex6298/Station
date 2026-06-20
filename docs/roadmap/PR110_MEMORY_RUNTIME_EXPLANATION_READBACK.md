# PR110 - Memory Runtime Explanation Readback

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior before MIMIR closeout.
Status: open for DAEDALUS

## Why This Lane

PR109 accepted the Memory UX/observability audit and recommended this as the
next narrow slice. Current owner surfaces show Memory lifecycle state,
briefing counts, runtime context buckets, and sanitized AI activity, but they do
not yet connect those facts into a simple explanation of why Memory did or did
not enter runtime context.

This lane should improve user trust in Station's memory behavior without
opening a retrieval rewrite, public Memory, raw traces, or provider work.

## Goal

Add owner-only runtime Memory explanation readback.

The owner should be able to understand, in one compact place, which Memory
items were selected for runtime context and which relevant Memory items were
held out because of lifecycle state, source readiness, query mismatch, or safe
fallback behavior.

## Scope

DAEDALUS should implement the smallest safe slice using existing owner-only
APIs where possible:

- `/memory/persona/:personaId`;
- `/memory/persona/:personaId/briefing`;
- `/conversations/persona/:personaId/context-preview`.

Acceptable implementation shapes:

- add a small explanation section to the owner Memory page;
- and/or enrich the runtime context preview with sanitized Memory explanation
  labels;
- and/or add a narrow helper that joins existing API readback client-side.

The slice should distinguish:

- active and selected for runtime;
- active but not selected for this query/context;
- quarantined, rejected, expired, superseded, or missing lifecycle and held out;
- archive/import source held out by source readiness or lifecycle gate;
- keyword/vector/fallback retrieval mode only where already safely exposed;
- unknown/no-data states with honest fallback copy.

## Privacy Requirements

Render only sanitized counts, lifecycle labels, source labels, target labels,
and short reasons.

Do not expose:

- raw system prompts;
- user prompts;
- completions;
- trace bodies;
- provider payloads;
- private archive excerpts;
- owner ids;
- persona ids;
- trace ids;
- tokens/cookies/API keys/passwords/secrets;
- raw URLs;
- raw source ids that are not already safe in the owner UI.

## Non-Scope

Do not add:

- new retrieval engine;
- retrieval ranking rewrite;
- embedding/provider changes;
- autonomous memory mutation;
- public Memory surface;
- Redis/Upstash;
- Cloudflare;
- background jobs;
- Developer Space realtime;
- billing/auth/session changes;
- broad Studio redesign;
- new AI provider calls.

## Tests

Add focused tests for:

- explanation label mapping;
- active-selected versus active-not-selected copy;
- lifecycle holdout copy for quarantined/rejected/expired/superseded/missing;
- skip-count or fallback copy if present;
- no raw prompt/private content exposure in helper output;
- visible route/helper behavior if a UI section changes.

## ARGUS Review Requirements

ARGUS should verify:

- owner scoping remains intact;
- explanation output is sanitized and contains no raw trace/private payloads;
- lifecycle holdout states do not imply active runtime use;
- selected Memory rows align with runtime context preview output;
- active-not-selected copy is honest and not presented as an error;
- no non-scope infrastructure or provider work was introduced;
- validation passed.

Because this lane changes visible owner route behavior if DAEDALUS adds the
explanation to Memory/context UI, ARGUS should wake ARIADNE after technical
acceptance.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If visible routes change, include web build validation. If the web build reaches
compile/lint/page generation and then hits the known Windows output cleanup
`EPERM`, report that precisely rather than treating it as an app failure.
