# PR109 - Memory UX Observability Audit

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS audits or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: open for DAEDALUS

## Why This Lane

Community Beta is now accepted as protected-beta complete. The next product
priority returns to Station's core promise: Memory, continuity, and
observability that help a user understand what the system remembers, why it was
used, and what happened during AI activity.

`docs/roadmap/STATION_FUTURE_LANES.md` already identifies Lane 6 as Memory UX
and observability. PR60-PR67 also landed prior Memory/observability work. Before
adding another surface, Station needs a precise audit of what is already real,
what is stale, and what the next smallest user-value slice should be.

## Goal

Produce a Memory UX/observability closure-and-next-slice packet.

This PR should be documentation/test-evidence first. If DAEDALUS finds a narrow
broken blocker in existing Memory/observability surfaces, fix only that blocker
and document it.

## Scope

DAEDALUS should:

- audit accepted Memory/observability work from PR60-PR67 and related current
  docs;
- inspect the current Studio Memory, lifecycle/handoff, runtime context preview,
  Settings AI activity/observability, and API trace readback surfaces;
- classify remaining work as:
  - required blocker for the next Memory UX/observability slice;
  - next recommended narrow implementation lane;
  - future expansion;
  - stale/already satisfied;
- update roadmap docs so the next Memory UX/observability lane is clear;
- run the narrow validation set;
- wake ARGUS with a concrete recommendation for the next implementation PR.

## Audit Questions

Answer these directly:

- Can an owner see active/rejected/quarantined/superseded/expired Memory state
  clearly enough to understand runtime context?
- Can an owner tell why a memory did or did not enter runtime context without
  exposing private raw trace payloads?
- Are AI activity/observability surfaces useful, owner-scoped, and sanitized?
- Are lifecycle and handoff records visible enough to support continuity, or is
  there a missing next slice?
- Are Memory graph edges present, absent, or too thin for UI work?
- Which next implementation has the most product value with the least privacy
  risk?

## Non-Scope

Do not add:

- broad Studio redesign;
- public Memory, private archive, or raw trace exposure;
- embedding/provider changes;
- Redis/Upstash or Cloudflare work;
- background jobs;
- Developer Space realtime changes;
- billing/auth/session work;
- autonomous memory mutation;
- new AI provider calls.

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

If DAEDALUS touches visible routes, include web build validation and ARGUS
should wake ARIADNE after technical review.
