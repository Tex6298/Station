# PR485B - Memory And Continuity Candidate Inbox Preflight Result

Owner: ARGUS / A3

Date: 2026-07-05

Status: Accepted - wake DAEDALUS

Validation result:

```text
ACCEPT_PR485B_WEB_ONLY_MEMORY_INBOX
```

## Verdict

ARGUS accepts a web-only first Memory / continuity candidate inbox slice.

The first PR485B implementation should add a dedicated owner persona route:

```text
/studio/personas/[personaId]/memory-inbox
```

The route should list import-backed Memory/Canon continuity candidates through
the existing persona-scoped candidate API and review them through the existing
candidate review API. No new API route, migration, provider call, prompt
change, retrieval change, or runtime behavior change is accepted for PR485B.

## Exact Product Slice

DAEDALUS should implement a clear owner "Memory inbox" stop that:

- loads candidates from
  `/conversations/persona/${personaId}/candidates?source=import&status=all`;
- sorts or presents pending candidates first while still allowing pending /
  reviewed / Memory / Canon counters from the returned import-backed set;
- allows explicit owner accept/reject with editable title/content through
  `PATCH /conversations/candidates/:candidateId`;
- keeps accepting honest: edited candidate text is promoted to Memory or Canon;
- keeps rejecting honest: rejected candidates are not runtime material and the
  private source remains preserved;
- links back to companion home, Memory, Continuity/Timeline, and Integrity;
- uses existing Studio components, scoped CSS, and Tex visual language.

`status=all` is accepted for import-backed candidates so the inbox can show
reviewed state and counters. `source=all` is not accepted for PR485B.

## Route And Shortcut Decision

Accepted route target:

```text
/studio/personas/[personaId]/memory-inbox
```

PR485A's existing `Memory` shortcut must stay pointed at
`/studio/personas/[personaId]/memory`, because that route is the saved Memory
lifecycle/runtime explanation surface.

PR485B may add a separate `Inbox` / `Memory Inbox` owner-visible link from the
companion home surface to `/memory-inbox`. Do not silently repoint the Memory
shortcut. If DAEDALUS adds a fifth shortcut, it must prove desktop and mobile
fit in focused/static tests and leave the existing four PR485A route targets
intact.

## API Scope

API changes are forbidden for the accepted PR485B first slice.

Use only:

- `GET /conversations/persona/:personaId/candidates?source=import&status=all`
- `PATCH /conversations/candidates/:candidateId`

Do not add or copy Discern's stale `/conversations/candidates/inbox` endpoint.
Do not add a compatibility route for it. If DAEDALUS discovers the current API
cannot support the accepted web-only slice, stop and wake MIMIR with an
`ACCEPT_PR485B_API_HARDENING_FIRST` recommendation instead of broadening scope.

## Source Filter Decision

First scope must be `source=import`.

Do not use `source=all` in PR485B because it broadens the inbox into archived
chat candidates before the UI and DTO boundary have been hardened for a general
candidate inbox. Archived-chat candidates should remain in the existing chat
archive review context for this slice.

A future PR485C-style lane may generalize the inbox after an explicit decision
about archived-chat candidate source labels, source ids/message ids,
return-to-thread orientation, and safe DTO shape.

## Component Decision

`ImportReviewInbox` can be reused only if its copy is made accurate for the new
Memory inbox route. Prefer one of these narrow shapes:

- add small configurable copy props to `ImportReviewInbox` while preserving the
  existing Archive/files behavior; or
- extract a small shared `ContinuityCandidateInbox` review component used by
  Archive/files and Memory Inbox.

Do not duplicate the accept/reject card logic unless that is clearly smaller
than a safe extraction. Do not import Discern's memory-inbox skin.

## Allowed And Forbidden Readback

Allowed in the owner inbox:

- candidate title;
- candidate content;
- candidate rationale;
- candidate type (`Memory` / `Canon`);
- status and reviewed date;
- sanitized source label;
- safe source class such as `Private import source`;
- destination (`Memory` / `Canon`);
- owner-action copy explaining accept/reject consequences.

Forbidden in visible UI, docs, logs, or tests as user-facing readback:

- raw owner ids or persona ids;
- raw `sourceId`, `sourceMessageIds`, transcript ids, or storage paths;
- raw source table names such as `persona_files` or SQL/table details;
- raw imported source bodies beyond the candidate content itself;
- compiled prompts, provider payloads, tokens, cookies, hosted logs, stack
  traces, or secret-shaped values.

Using `sourceTable` internally to derive a safe label is acceptable; rendering
raw table names is not.

## Acceptable Touched Files

Acceptable files or local equivalents:

- `apps/web/app/studio/personas/[personaId]/memory-inbox/page.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx`, only if adding an
  explicit inbox link/shortcut from the companion home surface
- `apps/web/components/studio/import-review-inbox.tsx`
- optionally a new shared
  `apps/web/components/studio/continuity-candidate-inbox.tsx`
- `apps/web/lib/import-review.ts`
- `apps/web/lib/import-review.test.ts`
- `apps/web/lib/studio-navigation.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `apps/web/app/globals.css`, only for small scoped `.studio-*` classes if
  existing classes are insufficient
- roadmap/testing docs for the implementation result

Do not touch:

- `apps/api/src/routes/conversations.ts`;
- `packages/ai`, prompt helpers, retrieval context builders, provider code, or
  compiled prompt readback;
- migrations, env/config, hosted runtime, archive connector behavior, billing,
  Redis, Cloudflare, queues/workers, social connectors, public writes, or
  broad Studio/global shell files.

## ARGUS Answers

1. Current API safely supports a first persona-scoped inbox only for the
   import-backed filter already proven by tests.
2. First inbox must use `source=import`; `source=all` waits.
3. `ImportReviewInbox` is reusable if copy is configurable, or it can be
   extracted into a shared continuity candidate inbox component.
4. Keep PR485A `Memory` pointed at `/memory`; add a separate Inbox link if a
   home shortcut is needed.
5. A dedicated `/memory-inbox` page is least confusing because `/memory` is
   saved Memory lifecycle/runtime explanation and `/continuity` is timeline /
   provenance.
6. Allowed private readback is candidate title/content/rationale/status,
   sanitized source label, safe source class, destination, and owner-action
   copy. Raw ids, table names, source bodies, prompt/provider payloads, logs,
   and secret-shaped values are forbidden.
7. DAEDALUS must prove owner scoping/review behavior with the existing API
   suite, import-review copy/redaction with helper tests, and route/shortcut
   wiring plus no-drift with static web tests.
8. ARIADNE hosted desktop/mobile rehearsal is required after ARGUS accepts the
   implementation because PR485B adds a visible owner route and likely a new
   companion home link.

## ARGUS Validation

Passed locally on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code and handoff inspection | Pass | Reviewed PR485B handoff, current candidate list/review APIs, ImportReviewInbox, import-review helpers/tests, PR485A shortcut state, and conversation-archive candidate coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/conversation-archive.test.ts apps/web/lib/import-review.test.ts apps/web/lib/studio-navigation.test.ts` | Pass | 36 API/web route, owner-scope, review, redaction, and navigation tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors after ARGUS preflight docs; CRLF normalization warnings only. |

DAEDALUS implementation validation must include:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/conversation-archive.test.ts apps/web/lib/import-review.test.ts apps/web/lib/studio-navigation.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

Focused tests should additionally prove:

- the new page calls
  `/conversations/persona/${personaId}/candidates?source=import&status=all`;
- no code path uses `/conversations/candidates/inbox`;
- no PR485B page or shortcut uses `source=all`;
- Memory remains linked to `/memory`;
- Inbox links to `/memory-inbox` if a home shortcut is added;
- accept/reject calls only `/conversations/candidates/:candidateId`;
- rendered/source helper copy does not expose raw source ids, raw table names,
  storage paths, prompt/provider payloads, tokens, cookies, stack traces, or
  secret-shaped values;
- no return-to-thread, prompt/presence, archive connector, billing, Redis,
  Cloudflare, social connector, public-write, queue/worker, broad shell, or
  Discern CSS drift enters scope.

## ARIADNE Rehearsal After Implementation

After ARGUS accepts DAEDALUS' implementation, MIMIR should route ARIADNE for
hosted desktop and mobile rehearsal.

ARIADNE should verify:

- `/studio/personas/[personaId]/memory-inbox` loads as an owner route;
- companion home discoverability works without repointing Memory away from
  `/memory`;
- desktop, `375px`, and `390px` mobile have no horizontal overflow, clipped
  labels, broken touch targets, or overlap;
- empty, loading, and error states are honest if no import-backed candidates
  exist;
- populated candidate rows are safe if hosted data already contains candidates;
- accept/reject writes are rehearsed only on a disposable persona/candidate
  explicitly provided for that purpose;
- no private ids, raw source ids/table names, storage paths, source bodies
  beyond candidate content, prompt/provider payloads, tokens, cookies, stack
  traces, logs, or secret-shaped values render.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR485B Web-Only Memory Inbox as the next Discern companion UX translation slice.
Verdict:
- ACCEPT_PR485B_WEB_ONLY_MEMORY_INBOX
Task:
- Add `/studio/personas/[personaId]/memory-inbox` as an owner-only import-backed Memory/Canon candidate inbox using existing candidate list/review APIs.
Guardrails:
- Use `source=import&status=all`; do not use `source=all` or add `/conversations/candidates/inbox`.
- Keep PR485A Memory linked to `/memory`; add a separate Inbox link only if route discoverability needs it and tests prove fit.
- No API, migration, AI package, prompt, retrieval, provider, hosted runtime, archive connector, billing, queue/worker, Redis, Cloudflare, social connector, public-write, broad shell, Discern CSS, return-to-thread, or companion presence prompt-context changes.
Validation:
- Run the conversation-archive/import-review/studio-navigation focused suite, typecheck, lint, and git diff whitespace checks.
```
