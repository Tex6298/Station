# PR357 - Developer Space Project Updates Feed Source Map Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for ARGUS

## Summary

PR357 mapped the current Developer Space project updates/changelog/feed lane and
implemented the smallest safe route/helper/test patch.

The dormant public `project_notes` widget now renders a bounded project update
trail from data the public Developer Space detail route already returns:

- published public `field_log` linked documents;
- public `developer_agent.status_note` events created by the owner-approved
  `update_observatory` receipt path.

No schema, migration, API field, ingestion, key, webhook, provider, runtime,
auth, billing, Redis, Cloudflare, queue, worker, Discover, or visibility
semantic changed.

## Source Map Answers

### Current Source Of Truth

There are two current sources for public project updates:

- Public field-log evidence documents from
  `DeveloperSpaceDetail.linkedDocuments`, already loaded by
  `loadLinkedDocumentsForSpace()` and filtered to public, published,
  public-visibility documents for non-owner access.
- Public status-note events from `DeveloperSpaceDetail.events`, specifically
  events where `eventType === "developer_agent.status_note"` and
  `visibility === "public"`.

The status-note source is created by the existing owner-confirmed
`update_observatory` action. API tests already prove the public detail response
includes the note while omitting confirmation ids, receipt ids, preview hashes,
and `dedupeKey`.

### Render Source Decision

The first public updates/changelog slice should render both current public
sources with clear labels:

- `Field log / update` for published field-log documents.
- `Status note` for owner-approved public observatory notes.

Methodology and findings remain in the main evidence reading path. Runtime
events remain in the chronological event stream. Project updates are the
curated side trail that points visitors to public field logs and deliberate
owner status notes.

### Widget Status

`project_notes` was a dormant intended surface, not a stale type:

- `packages/types/src/developer-space.ts` includes `project_notes` as a widget
  type.
- `apps/web/lib/developer-space-observatory.ts` made it visible by default.
- `apps/api/src/routes/developer-spaces.ts` made it visible by default in the
  Developer Agent layout vocabulary.
- `apps/web/app/developer-spaces/[slug]/page.tsx` was the only broken link:
  it returned `null` for that widget.

PR357 makes the existing widget the first public project updates rendering
target.

### Owner Manage Contract

The owner manage page already has the authoring paths this slice needs:

- `save_project_update_draft` saves a private owner-only field-log draft.
- `publish_to_page` publishes a selected reviewed private draft into the public
  Developer Space evidence path.
- `update_observatory` records one owner-approved public status note in the
  Developer Space event stream.
- The manage page exposes public status-note copy, draft/publish controls,
  receipt rows, and the evidence path panel.

No new owner controls were needed.

### Empty State

When no public field logs or status notes exist:

- public visitors see that no public project updates are visible yet, while the
  evidence path, live readback, and snapshots still carry the observatory;
- owners see that they can publish a field-log document or approved status note
  when the page needs changelog-style readback.

### Difference From Event Stream

The event stream remains chronological runtime readback and may contain runtime
signals that are not project updates. The `project_notes` widget now filters to
curated project update sources only:

- public field-log linked documents;
- public owner-approved `developer_agent.status_note` events.

It does not mirror arbitrary runtime events.

### Tests And Safety

Existing API tests already cover:

- private project-update drafts stay owner-only;
- selected drafts publish to public linked evidence only after approval;
- public status-note events are sanitized;
- public detail omits confirmation ids, receipt ids, preview hashes, and
  `dedupeKey`.

PR357 adds helper tests that prove the rendered project update list:

- includes public field logs and public status notes;
- orders the newest update first;
- excludes owner-only field logs, private status notes, methodology documents,
  arbitrary runtime events, and owner-only `dedupeKey` values;
- keeps owner and visitor empty states distinct.

### Schema/API/Discover Decision

No schema, migration, API field, or Discover/global-feed integration is needed
for this first slice. Discover integration remains a later lane because the
public Developer Space route can now render the current updates trail from its
existing detail payload.

## Changed Files

- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `docs/roadmap/PR357_DEVELOPER_SPACE_PROJECT_UPDATES_FEED_SOURCE_MAP_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Implementation

`developerSpaceProjectUpdates()` now builds a bounded update list from existing
public data:

- public, published `field_log` linked documents become `Field log / update`
  rows using the already-serialized document excerpt;
- public `developer_agent.status_note` events become `Status note` rows using
  only the public `eventData.statusNote` string;
- arbitrary runtime events, private status notes, owner-only/private/draft
  documents, and non-field-log evidence documents are excluded;
- rows are sorted newest first and capped.

`developerSpaceProjectUpdatesEmptyCopy()` provides owner and visitor empty
states.

The public Developer Space route now renders `project_notes` as a side card
instead of returning `null`.

## Preserved Boundaries

- No raw event JSON, snapshot JSON, prompts, provider payloads, hosted logs,
  credentials, private document bodies, private owner IDs, receipt IDs,
  confirmation IDs, preview hashes, or secret-shaped values are added to public
  rendering.
- No ingestion, webhook, key, provider, runtime, SSE/WebSocket, export, billing,
  auth/session, schema, migration, Redis, Cloudflare, queue, worker, Railway,
  or Supabase admin behavior changed.
- Discover/global feed integration remains out of scope.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 50 tests passed, including new project updates helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 115 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | No ESLint warnings or errors. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |

## Review Request

ARGUS should review:

- whether `project_notes` is now correctly scoped as the first public project
  updates/changelog surface;
- whether field-log documents and owner-approved status-note events are the
  right current sources;
- whether arbitrary runtime events, owner-only drafts, private status notes,
  methodology/finding documents, and owner-only event metadata remain excluded;
- whether the public/private boundary is clear enough for MIMIR to accept PR357.
