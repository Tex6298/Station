# PR486A - Document Migrator Archive Handoff Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for DAEDALUS implementation

## Verdict

```text
ACCEPT_PR486A_PERSONA_ARCHIVE_HANDOFF_POLISH
```

ARGUS accepts PR486A as a web/helper/test-only persona Archive handoff polish
slice for Document Migrator.

## Decision

Do not rebuild `/studio/onboarding` for PR486A. Current onboarding already has a
state-aware Document Migrator card, routes owners to the persona Archive/files
page after persona creation, distinguishes empty archive and import-review
states, and explicitly avoids live Reddit, Discord, OAuth, recurring sync, and
external API pull claims.

The smallest useful product-depth slice is therefore the handoff destination:

```text
/studio/personas/[personaId]/files
```

That page already owns the real no-write preview, pasted source import, file
upload, import job readback, import review, storage, export, and connector
readiness surfaces. PR486A should make it easier for an owner arriving from
Document Migrator to understand what can happen now, what state already exists,
and what remains intentionally deferred.

## Accepted Implementation Boundary

Allowed files:

- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- `apps/web/lib/archive-trust.ts`
- `apps/web/lib/archive-trust.test.ts`
- `apps/web/lib/onboarding-paths.test.ts`, only to preserve existing Document
  Migrator route/no-drift assertions if needed
- `apps/web/lib/import-review.test.ts`, only to preserve existing import-review
  no-drift assertions if needed
- `apps/web/app/globals.css`, only if scoped `.document-migrator-handoff-*` or
  similarly narrow selectors are truly needed instead of existing Studio/archive
  classes
- roadmap and validation docs

Do not touch backend/API routes, migrations, schema, parser code, storage
upload/register behavior, import preview/import handlers, Archive connector
behavior, provider/model packages, prompt/retrieval code, auth/session code,
deployment/config, package files, queues/workers, Redis, Cloudflare, billing,
public routes, or broad Studio/onboarding/archive shell styles.

## Allowed Product Work

DAEDALUS may add a compact owner-visible Document Migrator handoff/readiness
panel on the persona Archive/files page.

The panel may use only already-loaded owner state:

- `files`;
- `jobs`;
- `importCandidates`;
- `persona.continuity` counts already loaded for archive trust readback;
- existing route constants/links and existing safe helper copy.

The panel may summarize:

- whether pasted/file archive sources are present;
- completed, failed, queued, or processing import state;
- pending import-review candidate count;
- that Memory/Canon promotion remains explicit owner review;
- that Global Archive and persona Archive have different roles;
- that live Reddit/Discord/OAuth/recurring sync remains deferred.

The panel may include real links or anchors only when the destination already
exists and is rendered:

- paste-source preview/import form on the same page;
- file preview/upload form on the same page;
- Import Review section on the same page;
- `/studio/personas/[personaId]/memory-inbox`;
- `/studio/archive`;
- `/settings` for storage usage.

If DAEDALUS adds in-page anchors, each anchor target must exist and be covered by
focused tests or static source assertions. Do not add disabled buttons or
placeholder controls.

## Forbidden Claims And Data Exposure

PR486A must not claim or introduce:

- live connectors, OAuth, Reddit/Discord/API pulls, recurring sync, external
  provider reads, or partner adapters;
- new parser behavior, document conversion, PDF/binary extraction, AI
  summarization, provider/model calls, prompt or retrieval changes;
- automatic imports, automatic Memory/Canon promotion, automatic candidate
  generation, automatic continuity linking, or background jobs;
- new durable onboarding progress, job state, storage state, schema fields, or
  migrations;
- public writes, public chat behavior, broad onboarding redesign, broad Archive
  redesign, billing, auth/session, deployment, Redis, Cloudflare, queues, or
  workers.

New handoff/readiness copy must not render:

- private source bodies;
- raw owner, persona, source, file, import-job, candidate, thread, document, or
  storage ids;
- storage paths, signed upload URLs, parser internals, SQL/table details, stack
  traces, provider payloads, tokens, cookies, keys, or secret-shaped values;
- private filenames or source names beyond what is already intentionally shown
  in the existing source cards.

## Required No-Drift Tests

DAEDALUS must add or preserve focused tests proving:

- Document Migrator still routes to the existing persona Archive/files surface
  and does not add live connector, OAuth, recurring sync, API-pull, provider,
  prompt, retrieval, Redis, Cloudflare, queue/worker, billing, public-write, or
  placeholder-control claims;
- any new handoff/readiness helper uses counts/statuses only and does not echo
  raw ids, storage paths, source bodies, private filenames, parser internals, or
  secret-shaped values;
- empty, ready, failed, processing, and pending-review states have honest next
  actions;
- supported source copy distinguishes pasted source, text/Markdown/JSON export
  file import, archived chats/import jobs/import-review candidates, and deferred
  live connectors;
- existing preview-before-confirm behavior remains unchanged for pasted source
  and file import;
- existing Import Review and Memory inbox separation remain unchanged;
- Archive connector panel behavior is not changed or rebranded as configured
  live connector proof.

## Required Validation

DAEDALUS must run:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts apps/web/lib/onboarding-paths.test.ts apps/web/lib/import-review.test.ts apps/web/lib/studio-navigation.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

ARGUS should review the implementation diff against this accepted boundary
before routing ARIADNE.

## Required ARIADNE Rehearsal

Because PR486A is visible UI, ARGUS requires ARIADNE hosted rehearsal after
ARGUS accepts the implementation.

ARIADNE should verify hosted web/API health and rehearse desktop plus `375px`
and `390px` mobile viewports.

Required routes and states:

- `/studio/onboarding` still presents Document Migrator honestly and routes to
  persona Archive/files for an existing persona;
- `/studio/personas/[personaId]/files` shows the Document Migrator handoff panel
  with no overflow, clipped controls, or overlapping text;
- empty/no-source state;
- existing-source state if replay data has imported files/jobs;
- pending import-review state if replay data has candidates;
- failed or processing import state if safely available through existing data or
  test-only interception;
- paste/file preview controls still require explicit owner preview before
  confirm;
- Memory inbox, Global Archive, settings/storage, and Import Review links route
  to existing owner surfaces;
- Archive connector panel remains existing readiness/config behavior and is not
  presented as newly live;
- no private source bodies, raw ids, storage paths, signed upload URLs, secret
  values, parser internals, provider payloads, stack traces, public writes,
  automatic imports, placeholder controls, or live connector/OAuth claims appear.

## Preflight Validation Performed

ARGUS reviewed the PR486 handoff, onboarding path helpers/tests, onboarding UI,
persona Archive/files page, Archive trust helpers/tests, import preview helper,
import review helper/component, Global Archive helper, active status, lane index,
and the PR485E closeout.

Validation run on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Current Document Migrator route already lands on persona Archive/files; the accepted slice can stay web/helper/test-only. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts apps/web/lib/onboarding-paths.test.ts apps/web/lib/import-review.test.ts apps/web/lib/studio-navigation.test.ts` | Pass | 42 focused Archive/onboarding/import-review/navigation tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR486A as Persona Archive Handoff Polish for Document Migrator.
- The lane is web/helper/test-only on the existing /studio/personas/[personaId]/files destination, not a new importer, parser, connector, onboarding rewrite, or backend lane.
Task:
- Add a compact owner-visible Document Migrator handoff/readiness panel on the persona Archive/files page using only already-loaded files, jobs, importCandidates, and existing archive trust state.
- Explain current safe source paths, existing source/job/review state, explicit owner next actions, and deferred live connectors without adding placeholder controls.
- Add focused no-drift tests for handoff helper/copy, Document Migrator route preservation, no raw/private/secret readback, no live connector claims, preview-before-confirm preservation, Import Review separation, and Archive connector no-drift.
Guardrails:
- Touch only apps/web/app/studio/personas/[personaId]/files/page.tsx, apps/web/lib/archive-trust.ts, apps/web/lib/archive-trust.test.ts, optional existing onboarding/import-review no-drift tests, optional narrowly scoped CSS if unavoidable, and docs.
- Do not change APIs, migrations, schema, parsers, import preview/import handlers, storage upload/register behavior, Archive connector behavior, provider/model packages, prompts, retrieval, auth/session, deployment/config, package files, queues/workers, Redis, Cloudflare, billing, public routes, broad onboarding/archive redesign, or global shell styling.
- Do not expose private source bodies, raw ids, storage paths, signed upload URLs, parser internals, SQL/table details, stack traces, provider payloads, tokens, cookies, keys, secret-shaped values, or new private filename/source-name readback.
- Do not add disabled or unwired buttons, live connector/OAuth/API pull claims, recurring sync claims, automatic import claims, automatic Memory/Canon promotion, or automatic continuity linking.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts apps/web/lib/onboarding-paths.test.ts apps/web/lib/import-review.test.ts apps/web/lib/studio-navigation.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
ARIADNE:
- After ARGUS accepts implementation, route hosted desktop/375px/390px rehearsal for /studio/onboarding and /studio/personas/[personaId]/files, covering empty/no-source, existing-source, pending-review, safe failed/processing if available, preview-before-confirm controls, links to existing owner surfaces, Archive connector no-new-live-claim behavior, mobile fit, and no private/secret-shaped visible readback.
```
