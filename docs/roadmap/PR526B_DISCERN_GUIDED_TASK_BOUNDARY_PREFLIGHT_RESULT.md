# PR526B - Discern Guided-Task Boundary Preflight Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-14

Status:

```text
ACCEPT_PR526B_GUIDED_TASK_BOUNDARIES_AND_PARKED_PLACEMENT
```

## Verdict

ARGUS accepts ARIADNE's PR526A map as presentation direction and accepts
MIMIR's parked placement. PR526C-F remain parked behind the terminal UI
closeout pause. PR526B authorizes no engine, endpoint, provider call, draft
store, converted mutation flow, route alias, auth cleanup, or global CSS.

No PR526 production correction is required before PR525E/F/G/H can close.
PR525G may call fresh-head reconciliation complete only as an explicit
adoption/deviation decision, not as implemented feature parity with Discern
`ff93308b`.

## Rejected Source Mechanisms

The following are rejected, not merely deferred implementation details:

- `useFlowEngine`, `ConversationSurface`, automatic zero-input action
  resolution, generic action callbacks, and any runner that catches a mutation
  error while advancing or rendering success;
- generic `POST /flow/generate`, forwarding the full gathered context,
  route-local `DeepseekProvider` construction outside Station's router, ignored
  requested models, or any provider path that bypasses Station routing,
  provider/data policy, quota, token credits, billing, redacted observability,
  and user-visible failure state;
- browser localStorage for guided-task turns, private memory, prompts,
  boundaries, account/billing context, archive/export scope, resource IDs,
  visibility choices, mutation state, or resume packets;
- mechanical resume from unversioned browser state and timer-driven reset with
  no explicit cancel/restart contract;
- replacement of PersonaManagement, PublishFlow, forum creation, Developer
  Space creation/management or one-time key handling, Space owner editing,
  Integrity, memory lifecycle review, Billing, ExportWorkspace, Settings, or
  any other complete Station surface;
- duplicate `/settings/billing`, `/settings/export`, or `/settings/profile`
  aliases and source endpoints/payloads that do not match current Tex routes;
- the broad `access_token` to `accessToken` sweep or any auth/session cleanup
  hidden inside UX work;
- wholesale `.conv-*` global CSS, source shell dependencies, old clipped mobile
  rail behavior, and fixed-light styling that bypasses accepted PR525 tokens;
- provider-generated authorization, validation, pricing, visibility,
  moderation, publication, deletion, rotation, secret, billing, or archive
  decisions;
- ingestion keys, auth tokens, checkout/portal URLs, raw provider errors, or
  private source text in a transcript, generic preview card, provider context,
  browser draft, log, analytics event, or toast history.

Existing auth session storage and public Discover roulette session counters are
outside PR526B and remain unchanged. This result does not falsely claim that
Tex uses no browser storage; it prohibits adding private or durable guided-task
state to it and rejects an unrelated auth rewrite.

## Required Action Boundary

Any later guided-task proposal must be typed per domain and must model at least:

```text
idle -> editing -> validating -> pending -> succeeded -> complete
                                  |  |
                                  |  +-> unknown -> reconciling -> succeeded|failed
                                  v
                                failed -> retrying|cancelled
```

Rules:

- a server response or authoritative readback, never client dialogue state,
  creates success;
- a timeout or dropped response after dispatch is `unknown`, not proof that no
  write occurred;
- automatic or user-triggered retry is allowed only when the existing endpoint
  is intrinsically safe, accepts a stable idempotency key, or provides an
  authoritative reconciliation read;
- pending, unknown, failed, retrying, succeeded, and cancelled states are
  visible and focusable; entered values survive recoverable failure;
- no success turn, next mutation, redirect, notification promise, or completion
  appears before the current action is authoritatively successful;
- authorization, owner/persona/resource scope, visibility eligibility,
  moderation, provenance, quota, price, lifecycle, and secret policy are
  rechecked by the existing server mutation at execution time;
- redirects use only server-authoritative destinations already accepted by the
  owning surface; generated or client-composed payment/portal URLs are barred;
- complex tasks retain their complete form/management fallback, explicit back
  and cancel controls, one live region, named inputs/groups, associated errors,
  and deterministic focus movement.

## Draft And Provider Boundary

If resume is ever proposed, PR526B does not pre-approve a storage table or API.
A later dedicated contract must define:

- authenticated owner plus exact resource scope, with no client-certified
  owner ID;
- allowlisted/minimized typed fields, schema version, optimistic version or
  equivalent conflict control, creation/update/expiry timestamps, enforced TTL,
  explicit cancel/delete, completion purge, and stale-version handling;
- server authorization and row isolation on create/read/update/delete;
- encryption and redacted logs/telemetry appropriate to the accepted data
  class;
- no provider keys, ingestion keys, auth/refresh tokens, one-time secrets,
  checkout URLs, raw private memory/source bodies, or unrelated gathered
  context;
- reconciliation against current server state before resume can mutate.

Most accepted presentation directions require no model. If generated copy is
ever proposed, the owning lane must define a minimized source allowlist,
Station provider route and policy, budget/credit behavior, redacted
observability, explicit non-authority, and a deterministic fallback. There is
no generic provider turn.

## Surface Preservation

| Surface | Boundary that remains authoritative |
| --- | --- |
| Companion setup | Current persona schema, validation, privacy/import authority, and owner mutation. One-question guidance and typed preview remain a parked candidate only. |
| Persona edit | Complete PersonaManagement and fields the API can round-trip; no transcript-backed invented schema. |
| Publishing / Forums | Existing draft, visibility, Space, version, category, linked-object, authorship, provenance, moderation, and validation contracts. PR525F changes composition only. |
| Developer Spaces / keys | Existing payload, provider policy, four-state visibility, quota/commercial truth, owner checks, and dedicated one-time secret surface. |
| Public Space | Existing microsite schema, prefilled owner edit state, layout/theme bounds, comments, and structural visibility. Typed create preview remains parked. |
| Integrity / Memory | Existing server-driven Integrity turns and memory lifecycle/trust/provenance/runtime contracts. A memory queue remains parked and may never silently advance after failure. |
| Billing | Server-returned tier, entitlement, price, limits, checkout URL, portal URL, and canonical `/billing` route. |
| Export / Archive | Canonical `/studio/export`, server manifest/package/status/scope/quota truth, and visible failure/readback. |
| Profile / account | Current truthful unavailable state until a dedicated backend/product lane exists; no fake public profile or generic deletion flow. |

## Placement And PR525 Closeout

```text
PR526C - deterministic guided-task primitives                 PARKED
PR526D - companion setup pilot                                PARKED
PR526E - Space create pilot                                   PARKED
PR526F - server-driven memory lifecycle review queue          PARKED
```

Publishing, forum creation, Developer key management, Integrity, billing,
export, persona management, and profile/account replacement remain rejected or
deferred to their owning contracts. No source-derived PR526 lane may open
without a later explicit product decision after the terminal pause.

PR525G can truthfully close current-head reconciliation when it:

- cites PR526A and this result;
- names presentation direction as adopted but unimplemented/parked;
- names the rejected mechanisms as deliberate deviations;
- does not claim fresh-head flow parity, merge parity, or implementation;
- confirms no source engine, endpoint, local flow storage, alias route, auth
  sweep, or `.conv-*` CSS entered the accepted PR525 implementation;
- keeps the accepted full-width mobile Studio/companion collapse in hosted
  proof.

PR525E, PR525F, and PR525H require no PR526 correction. They remain limited to
chat visuals/honest states, Forums composition, and shared theme treatment
respectively.

## Verification

| Check | Result | Notes |
| --- | --- | --- |
| PR526A changed-path review | Pass | Commit `afe10b67` changes roadmap/testing Markdown only. |
| Rejected mechanism source scan | Pass | No `flow/generate`, `useFlowEngine`, `ConversationSurface`, `.conv-*`, kindling key, or guided-flow storage key exists in current Tex production source. |
| Proposed alias/flow path scan | Pass | No settings billing/export/profile alias or flow-generation route exists. |
| Browser-storage inspection | Pass with scoped existing use | Current production use is auth session storage plus bounded public Discover roulette session counters; no private guided-task state exists. |
| Canonical contract spot-check | Pass | Current source retains `/forums/threads`, Developer Space `/api-key`, memory `/lifecycle`, `/integrity/start`, `/billing/checkout`, `/billing/portal`, and `/exports/workspace` ownership. |
| PR525D full regression set | Pass | Focused 36, Studio UI 251, conversation archive 43, auth 21, Developer Space 61, typecheck, and lint pass. |
| Production changes for PR526B | None | This preflight changes roadmap/testing documentation only. |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR526B's backend/security/action-state boundaries.
- Every source engine/provider/storage/replacement/alias/auth/CSS mechanism is
  explicitly rejected; PR526C-F remain parked.
- No PR526 code correction is required for PR525E/F/G/H. PR525G may record
  current-head reconciliation only as the accepted adoption/deviation map.
Task:
- Record the paired PR525D/PR526B acceptance and decide the next locked move.
```
