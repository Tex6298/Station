# PR485B - Memory And Continuity Candidate Inbox Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - wake ARGUS

## Why This Lane

PR485A is closed. The next useful Discern companion UX translation slice is the
Memory inbox / continuity candidate inbox.

Discern's reference commit `de7b918e` added a dedicated
`/studio/personas/[personaId]/memory-inbox` page that listed pending continuity
candidates and allowed accept/reject with edits. Tex should translate the
behavior, not copy the endpoint or skin.

Current Tex truth:

- owner-scoped candidate list API exists at
  `/conversations/persona/:personaId/candidates`;
- candidate list filters are `source=import|all` and
  `status=pending|reviewed|all`;
- candidate review API exists at `/conversations/candidates/:candidateId`;
- `/studio/personas/[personaId]/files` already uses `ImportReviewInbox` for
  import-backed Memory/Canon candidates;
- `/studio/personas/[personaId]/memory` focuses on saved memory lifecycle and
  runtime explanation;
- `/studio/personas/[personaId]/continuity` shows continuity trust, runtime
  provenance, and timeline records, but not a dedicated pending-candidate
  triage stop;
- PR485A's shortcut strip currently sends Memory to the existing Memory route,
  not a new inbox route.

## ARGUS Task

Hostile-preflight PR485B and decide the smallest safe implementation slice.

Return exactly one of:

```text
ACCEPT_PR485B_WEB_ONLY_MEMORY_INBOX
ACCEPT_PR485B_EXISTING_SURFACE_PANEL
ACCEPT_PR485B_API_HARDENING_FIRST
PATCH_SCOPE
BLOCKED_NEEDS_UNBLOCK_LANE
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_DEFER
```

If accepted, specify:

- exact product slice;
- exact route target: new `/memory-inbox`, existing `/memory`, existing
  `/continuity`, or another Tex-local equivalent;
- whether the PR485A shortcut strip should stay pointed at `/memory` or gain a
  separate inbox entry/target;
- whether API changes are forbidden or required;
- whether `source=all` is safe for the first inbox or whether first scope must
  be `source=import`;
- acceptable touched files or local equivalents;
- validation commands;
- whether ARIADNE hosted desktop/mobile rehearsal is required after ARGUS
  accepts DAEDALUS implementation.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables the inbox.

## Candidate Implementation Shape

ARGUS may accept, patch, or reject this shape.

### Web-Only Memory Inbox

Add an owner-only persona workspace inbox, probably:

```text
/studio/personas/[personaId]/memory-inbox
```

The inbox should:

- load candidates through the existing persona-scoped candidate API;
- default to pending review material;
- show summary counters for pending/reviewed, Memory/Canon, and safe source
  class if already present in returned DTOs;
- allow owner accept/reject with editable title/content through the existing
  candidate review API;
- reuse `ImportReviewInbox` only if it stays accurate for both import-backed
  and archived-chat-backed candidates, or extract a small shared candidate
  review component if that is cleaner;
- link back to companion home, Memory, Continuity/Timeline, and Integrity;
- keep source preservation language honest: accepting promotes edited candidate
  text, rejecting preserves the private source material without adding it to
  runtime Memory/Canon.

### Existing Surface Panel

If a new route is too much for the first slice, ARGUS may accept adding a
bounded pending-candidate panel to either:

- `/studio/personas/[personaId]/memory`; or
- `/studio/personas/[personaId]/continuity`.

This should still create a clear "inbox" stop from the owner point of view,
with explicit review actions and safe empty/error states.

### API Hardening First

If current API readback is not safe enough for a general owner inbox, ARGUS
should name a smaller PR485B-A API hardening lane. That lane should be limited
to candidate listing/review safety and must not become a broad continuity
rewrite.

## Questions ARGUS Should Answer

1. Does the current candidate list route safely support a persona-scoped inbox
   without a new API?
2. Should the first inbox include `source=all`, or should it start with
   `source=import` and leave archived-chat candidates in the existing chat
   archive context?
3. Is `ImportReviewInbox` reusable for all candidates after copy tweaks, or is
   a new `ContinuityCandidateInbox` component needed?
4. Should the PR485A Memory shortcut target the inbox, keep targeting Memory,
   or expose both Memory and Inbox somewhere in the companion home surface?
5. Which page gives the least confusing owner mental model: Memory inbox,
   Continuity inbox, or a panel inside existing Memory/Continuity?
6. What exact private data is allowed in the owner inbox? Candidate title,
   candidate content, rationale, status, safe source label, and destination may
   be necessary; raw owner ids, source ids, table names, SQL details, source
   file/transcript bodies, prompt/provider payloads, tokens, cookies, hosted
   logs, stack traces, and secret-shaped values are not.
7. What tests must DAEDALUS add or update to prove owner scoping, filtering,
   accept/reject/edit behavior, static no-drift, and visual route wiring?
8. What should ARIADNE rehearse on hosted desktop and mobile if a visible route
   or shortcut target changes?

## Guardrails

Do not:

- copy Discern's `/conversations/candidates/inbox` endpoint unless ARGUS
  explicitly accepts an API compatibility route;
- import Discern global CSS or broad Studio shell/sidebar/topbar/right-panel
  layout;
- alter streaming chat, provider setup/error behavior, token accounting,
  retrieval context, prompt construction, answer contracts, or runtime preview
  privacy boundaries;
- add migrations, external config, provider/model calls, Redis, Cloudflare,
  billing, social connectors, archive connector behavior, workers/queues, or
  public writes;
- create automatic promotion from candidate to Memory/Canon without explicit
  owner accept;
- expose private ids, raw source bodies, source table names, SQL details,
  compiled prompts, provider payloads, tokens, cookies, hosted logs, stack
  traces, or secret-shaped values.

## Suggested Validation

ARGUS may refine this, but DAEDALUS implementation validation should likely
include:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/conversation-archive.test.ts apps/web/lib/import-review.test.ts apps/web/lib/studio-navigation.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If a new route/component is added, include a focused web test or static
readback test for:

- route/shortcut targets;
- no stale Discern endpoint drift unless accepted;
- no return-to-thread, prompt/presence, archive connector, billing, Redis,
  Cloudflare, social connector, or broad shell drift.

## Wakeup Template

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR485B Memory / continuity candidate inbox preflight.
Verdict:
- ACCEPT_PR485B_WEB_ONLY_MEMORY_INBOX | ACCEPT_PR485B_EXISTING_SURFACE_PANEL | PATCH_SCOPE
Task:
- Implement the exact PR485B slice ARGUS names, translating Discern's Memory inbox behavior into Tex Station's existing owner candidate APIs and visual language.
Guardrails:
- Preserve owner-only candidate scoping, explicit accept/reject review, Tex streaming chat/runtime/provider behavior, and scoped Studio UI.
```

If blocked or decision-dependent:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR485B Memory / continuity candidate inbox preflight.
Verdict:
- ACCEPT_PR485B_API_HARDENING_FIRST | BLOCKED_NEEDS_UNBLOCK_LANE | BLOCKED_NEEDS_MIMIR_DECISION | REJECT_DEFER
Task:
- Choose the smallest unblock lane, make the product decision, or choose another numbered Discern companion UX slice.
```

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR485A Companion Home Shortcuts is closed after ARGUS acceptance and ARIADNE hosted rehearsal pass.
- MIMIR opens PR485B as the next Discern companion UX translation slice: Memory inbox / continuity candidate inbox.
- Tex already has persona-scoped candidate list/review APIs and an import-backed review component; Discern has a memory-inbox reference page but a stale/different candidate inbox endpoint.
Task:
- Hostile-preflight PR485B and choose the smallest safe implementation slice.
- Decide route/surface, API scope, candidate source filter, whether to reuse/extract review UI, shortcut implications, validation, and ARIADNE rehearsal needs.
- Wake DAEDALUS with an accepted implementation lane, or wake MIMIR with a concrete blocker/unblock decision.
```

