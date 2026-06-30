# PR484J-L - Archive Connector Owner UI Flow Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

PR484J-K closed the backend connector path through one owner-only Reddit
saved-items staged-run import execution route. The web app currently has only
the OAuth callback support for archive connectors; it does not yet expose a
complete owner flow that can drive readiness, credential connection, source
selection, intent confirmation, preview, staging, import preview, and final
import.

The next move should make the accepted backend capability visible and usable
for the owner, not expand providers or invent a broader import system.

## Decision Requested

Define the smallest safe owner UI flow for live archive connectors.

ARGUS should decide:

- where the route belongs first: likely the persona Archive surface, unless a
  safer existing owner surface fits better;
- whether the UI may call the existing backend endpoints directly, or needs a
  thin web client helper only;
- which steps are live now and which must be disabled with honest copy;
- how the OAuth callback returns the owner to the connector flow;
- which states must be rendered before DAEDALUS builds;
- what ARIADNE must rehearse from a human-eye route perspective.

## Required State Coverage

The preflight should cover owner-visible states for:

- connector readiness unavailable or misconfigured;
- missing credential;
- OAuth authorization start;
- OAuth callback success or failure;
- credential present but not source-ready;
- source inventory unavailable;
- no sources available;
- import intent pending;
- import intent activated;
- source preview unavailable or ready;
- staging run created, expired, revoked, superseded, failed, or imported;
- import preview ready;
- final import pending, completed, failed, or retryable.

## Security And Readback Rules

The UI must not expose:

- access tokens, refresh tokens, authorization codes, OAuth state secrets, or
  encryption material;
- raw provider ids;
- provider payloads;
- raw Reddit usernames, subreddit names, authors, URLs, or saved item bodies;
- encrypted batch contents;
- stack traces or storage error internals.

Owner copy should use safe generic labels such as `Reddit saved items` unless
ARGUS explicitly accepts a more specific label.

## Candidate Implementation Boundary

If accepted, the likely DAEDALUS slice is:

- one owner-only visible connector flow in the existing web app;
- route placement tied to persona Archive or another owner archive surface;
- frontend calls to existing accepted API endpoints only;
- no new backend behavior except typed client helpers or DTO shaping if needed;
- no new provider capability;
- disabled or bounded states for unsupported steps;
- focused UI/client tests;
- ARIADNE human rehearsal after implementation.

## Explicit Non-Scope

Keep out unless explicitly accepted in a later lane:

- new provider support;
- Discord content reads;
- broader Reddit history categories;
- queues or workers;
- pagination crawls;
- recurring imports;
- billing or entitlements;
- Redis, Cloudflare, marketplace, partner adapters, or social behavior;
- public documents, Canon, Continuity, or review-candidate writes;
- generic `/imports/chat` or parser reuse.

## ARGUS Output Requested

ARGUS should produce a preflight result that either:

- accepts the smallest owner UI flow and wakes DAEDALUS with exact build/test
  scope; or
- blocks with a concrete reason and wakes MIMIR with the smallest numbered
  unblock lane.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-K after ARGUS accepted connector import execution.
- Backend live archive connector flow now reaches owner-private import execution for one Reddit saved-items staged run.
- The next boundary is making the connector flow usable through a safe owner UI, not adding provider expansion or new backend import behavior.
Task:
- Hostile-preflight PR484J-L Archive Connector Owner UI Flow.
- Decide the smallest visible owner flow, route placement, backend calls, states, disabled/error copy, ARIADNE rehearsal requirements, and tests.
- Keep provider expansion, Discord content, queues/workers, pagination, recurring pulls, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, and new backend execution behavior out unless explicitly accepted.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest numbered unblock.
```

