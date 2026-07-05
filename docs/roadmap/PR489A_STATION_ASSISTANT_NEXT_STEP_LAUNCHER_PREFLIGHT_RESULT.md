# PR489A - Station Assistant Next-Step Launcher Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for DAEDALUS implementation

## Verdict

```text
ACCEPT_PR489A_ASSISTANT_NEXT_STEP_LAUNCHER
```

ARGUS accepts PR489A as a narrow Station Assistant next-step launcher refresh
over existing owner-safe Studio routes.

## Decision

Do not open a current-operations aggregation API for PR489A. The current
Assistant routes already require auth, scope reads to the owner, sanitize import
source labels and errors, and route owners to existing Studio surfaces. A broad
brief would invite new fetches and contract work that are not required for the
next useful slice.

Do not open a background-job UI route for PR489A. The API has authenticated
owner background-job readback, but the web app does not currently have a
`/background-jobs` page. PR488 also remains blocked on queue-capable runtime
proof, so Assistant must not imply workers, durable queues, Redis Memory truth,
or autonomous job execution are live.

The smallest safe product-depth slice is the existing owner surface:

```text
/studio/assistant
```

PR489A should make its next-action cards and deterministic copy more useful
after the accepted Archive, Memory inbox, Global Archive, export, publishing,
and job-readback work, while staying an operational guide rather than an actor.

## Accepted Implementation Boundary

Allowed files:

- `apps/api/src/services/station-assistant.service.ts`
- `apps/api/src/services/station-assistant.service.test.ts`
- `apps/web/components/studio/station-assistant-panel.tsx`
- `apps/web/lib/station-assistant-ui.ts`
- `apps/web/lib/station-assistant-ui.test.ts`
- `apps/web/lib/studio-navigation.ts`, only for route-context copy if needed
- `apps/web/lib/studio-navigation.test.ts`, only for no-drift assertions
- `apps/web/lib/archive-trust.test.ts`, only for Archive no-drift assertions
- `apps/web/lib/import-review.test.ts`, only for Memory inbox/import-review
  no-drift assertions
- `apps/web/lib/export-trust.test.ts`, only for export readback no-drift
  assertions
- `apps/web/lib/publishing-ui.test.ts`, only for publishing queue no-drift
  assertions
- `apps/api/src/routes/background-jobs.test.ts` and
  `apps/api/src/services/background-jobs.service.test.ts`, only for no-drift
  proof if Assistant copy mentions job readback or inline fallback
- roadmap and validation docs

Do not touch backend route contracts, migrations, schemas, auth/session,
deployment/config, package files, provider/model packages, prompt/retrieval
systems, imports, export assembly behavior, publishing mutations, deletion,
billing, workers, queues, Redis, Cloudflare, connectors, OAuth, social dispatch,
public Assistant behavior, public search, Discover, or broad Studio shell
design.

## Allowed Product Work

DAEDALUS may refine the existing Assistant summary action map, deterministic
reply copy, and `/studio/assistant` panel presentation.

The launcher may show concrete owner next steps for existing routes only:

- setup: `/studio/new`;
- Archive source/review: `/studio/archive` or
  `/studio/personas/[personaId]/files`;
- Memory inbox/import candidates:
  `/studio/personas/[personaId]/memory-inbox`;
- Global Archive search: `/studio/archive`;
- export readback/backup: `/studio/export`;
- publishing queue/review: `/studio/publishing`;
- quota or storage settings: `/settings`.

The work may:

- prioritize Memory inbox over generic Archive/files when pending imported
  Memory/Canon candidates exist for a known persona;
- keep failed or processing import jobs explicit, owner-scoped, and sanitized;
- keep export readback as an owner-controlled preservation step without adding
  export execution or retry behavior;
- keep publishing guidance on the accepted approval, public readback, linked
  discussion readback, and retract-to-private path;
- add bounded Assistant copy explaining that protected-alpha import work uses
  inline fallback and owner status/readback while queue-capable workers remain
  blocked;
- improve visible action-card labels, status chips, empty copy, or starter
  prompts when those changes point only to existing owner routes and do not add
  placeholder controls.

Assistant may not perform the action. Every card must remain a link or prompt to
an owner-controlled existing surface.

## Forbidden Claims And Data Exposure

PR489A must not claim or introduce:

- autonomous Assistant execution;
- provider/model calls or AI prompt/retrieval changes;
- new imports, export assembly, publishing, retract, deletion, Space creation,
  billing change, queue enqueue/dequeue, worker execution, Redis Memory truth,
  Cloudflare runtime, connector/OAuth flow, social dispatch, public Assistant,
  public search, or Discover behavior;
- a new `/background-jobs` web route, unless MIMIR opens a separate tiny
  readback lane;
- job-worker readiness while PR488 remains blocked on queue-capable config;
- placeholder buttons, disabled controls, or controls that do not route to a
  real existing surface.

New Assistant copy must not render:

- private source bodies;
- full transcripts, prompts, completions, provider payloads, or raw archive
  payloads;
- raw owner, persona, source, file, import-job, candidate, document, thread,
  storage, or database ids in display labels/details/status copy;
- storage paths, signed URLs, database URLs, stack traces, SQL details, parser
  internals, cookies, tokens, API keys, webhook secrets, bearer/JWT-shaped
  values, or secret-shaped values.

Route hrefs may contain existing owner route parameters where the app already
requires them, but visible labels/details/status text must stay owner-readable
and sanitized.

## Required No-Drift Tests

DAEDALUS must add or preserve focused tests proving:

- Assistant routes still require auth and scope summary/context/message data to
  the current owner;
- pending imported Memory/Canon candidates route to the existing Memory inbox
  when a known persona is available;
- Archive review, Global Archive search, export readback, publishing queue, and
  settings/quota actions link only to existing owner-safe routes;
- Assistant does not add `/background-jobs`, `/discover`, public search,
  public Assistant, connector, OAuth, billing, queue, worker, Redis, Cloudflare,
  provider/model, or social routes;
- background-job/inline-fallback copy is honest: owner status/readback exists,
  protected-alpha inline fallback is the current posture, and queue-capable
  workers remain blocked;
- action labels/details/statuses do not echo raw ids, storage paths, signed
  URLs, private source labels, source bodies, full transcripts, provider
  payloads, tokens, keys, bearer/JWT-shaped values, or secret-shaped values;
- publishing guidance preserves owner approval, public document readback,
  linked discussion readback, retract-to-private, and no-delete cleanup
  boundaries;
- import review, Memory inbox, Global Archive, export, and publishing route
  helpers do not drift while Assistant links to them.

## Required Validation

DAEDALUS must run:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/station-assistant.service.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/web/lib/station-assistant-ui.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts apps/web/lib/export-trust.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/import-review.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

ARGUS should review the implementation diff against this accepted boundary
before routing ARIADNE.

## Required ARIADNE Rehearsal

Because PR489A changes visible owner UI, ARGUS requires ARIADNE hosted rehearsal
after ARGUS accepts the implementation.

ARIADNE should verify hosted web/API health and rehearse desktop plus `375px`
and `390px` mobile viewports.

Required route and states:

- `/studio/assistant` signed-in loaded state with workspace signals and next
  actions;
- no urgent action/empty state;
- pending import-review or Memory-inbox state if replay data has candidates;
- failed or processing import state if safely available through existing data;
- export missing/completed package readback if safely available;
- publishing draft action if replay data has draft documents;
- Assistant question flow for archive, publish, export, and background-job or
  job-status wording;
- all visible actions route only to existing owner-safe surfaces;
- mobile layout has no overflow, clipped action labels, or overlapping controls;
- no private source bodies, raw ids in display copy, storage/signed URLs,
  provider payloads, stack traces, bearer/JWT-shaped values, secret-shaped
  values, public route drift, live connector/OAuth claims, worker/queue claims,
  autonomous execution claims, or placeholder controls appear.

## Preflight Validation Performed

ARGUS reviewed the PR489 handoff, PR488 blocker, PR399 Assistant action-map
result, active status, lane index, Assistant API service/routes/tests,
Assistant panel/helpers/tests, Studio navigation route helpers/tests,
background-job readback API/tests, Archive/import-review/export/publishing
helpers/tests, and package scripts.

Validation run on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Current Assistant is auth-required, owner-scoped, deterministic, sanitized, and not autonomous. No web `/background-jobs` route exists, so PR489A should not link to one. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/station-assistant.service.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/web/lib/station-assistant-ui.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts apps/web/lib/export-trust.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/import-review.test.ts` | Pass | 83 focused Assistant/job/navigation/Archive/export/publishing/import-review tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR489A as Station Assistant Next-Step Launcher on the existing owner-private /studio/assistant surface.
- The lane may refine existing Assistant action cards, deterministic reply copy, and visible panel copy so owners get concrete links to accepted Archive, Memory inbox, Global Archive, export, publishing, and settings/quota surfaces.
- PR488 remains blocked: do not claim worker/queue readiness. Background job wording may explain owner status/readback and protected-alpha inline fallback only.
Task:
- Refresh the existing Assistant next-action launcher so pending imported Memory/Canon candidates can route to the Memory inbox, Archive/Global Archive/export/publishing/settings actions use only existing owner-safe routes, and labels/details/statuses are concrete but sanitized.
- Add bounded copy for job-status/inline-fallback posture if useful, without adding a /background-jobs web page or any worker/queue behavior.
- Add focused no-drift tests for auth/owner scope, safe action routes, Memory inbox routing, no background-jobs/public/provider/worker route drift, sanitized labels/details, publishing/retract boundaries, and honest inline-fallback/queue-blocked copy.
Guardrails:
- Touch only apps/api/src/services/station-assistant.service.ts, apps/api/src/services/station-assistant.service.test.ts, apps/web/components/studio/station-assistant-panel.tsx, apps/web/lib/station-assistant-ui.ts, apps/web/lib/station-assistant-ui.test.ts, optional route/no-drift tests listed in the result doc, and docs.
- Do not change backend route contracts, migrations, schemas, auth/session, deployment/config, package files, provider/model packages, prompt/retrieval systems, imports, export assembly behavior, publishing mutations, deletion, billing, workers, queues, Redis, Cloudflare, connectors, OAuth, social dispatch, public Assistant behavior, public search, Discover, or broad Studio shell design.
- Do not render private source bodies, full transcripts, prompts, completions, provider payloads, raw archive payloads, raw ids in display text, storage paths, signed URLs, database URLs, stack traces, SQL details, parser internals, cookies, tokens, API keys, webhook secrets, bearer/JWT-shaped values, or secret-shaped values.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/station-assistant.service.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/web/lib/station-assistant-ui.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts apps/web/lib/export-trust.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/import-review.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
ARIADNE:
- After ARGUS accepts implementation, route hosted desktop/375px/390px rehearsal for /studio/assistant, covering signed-in loaded state, empty/no-urgent-action state, pending import or Memory-inbox state if available, failed/processing import state if available, export and publishing actions if available, archive/publish/export/job-status Assistant questions, owner-safe routes only, mobile fit, and no private/raw/secret/public/live-connector/worker/queue/autonomy/placeholder-control drift.
```
