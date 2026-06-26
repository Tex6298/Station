# PR357 - Developer Space Project Updates Feed Source Map

Owner: DAEDALUS

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE completed PR356 Developer Space evidence storytelling hosted rehearsal with PASS.
- Developer Space public evidence/storytelling is now accepted from hosted product evidence.
- MIMIR is opening the deferred Developer Space project updates / changelog / feed lane as a source map first.
Task:
- Map current API, types, owner console, public observatory, tests, and docs for project updates/changelog/feed.
- Pay special attention to the visible `project_notes` widget currently returning null on the public route.
- If the map proves one narrow route/helper/test patch is safely bounded, implement it and wake ARGUS.
- Otherwise create the result doc and wake MIMIR with the exact PR358 implementation packet.
```

## Why This Is Next

PR355 and PR356 closed the evidence-storytelling concern. The remaining
Developer Space work named in the future lanes is not more copy over the
evidence helpers; it is the distinct project updates/changelog/feed lane.

Initial repo clues:

- `apps/web/lib/developer-space-observatory.ts` includes a default visible
  `project_notes` widget.
- `packages/types/src/developer-space.ts` includes `project_notes` as a widget
  type.
- `apps/web/app/developer-spaces/[slug]/page.tsx` currently returns `null` for
  `widget.type === "project_notes"`.
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx` already exposes
  Developer Agent/status-note/project-update copy and owner evidence controls.
- `apps/api/src/routes/developer-spaces.ts` already has
  `save_project_update_draft`, `publish_to_page`, and `update_observatory`
  vocabulary, with status notes represented as public Developer Space events.
- Existing tests mention status notes, field logs, project-update drafts,
  evidence publishing, event streams, and audit export boundaries.

PR357 should turn those clues into an implementation decision, not drift into a
generic redesign.

## Source Map Questions

Answer these in the result doc:

- What is the current source of truth for a public project update?
- Should public updates/changelog render from:
  - public `field_log` linked documents;
  - public `developer_agent.status_note` events;
  - both, with clear labels;
  - or a new contract?
- Is the current `project_notes` widget a dormant intended surface, a stale
  placeholder, or the correct smallest rendering target?
- What should the owner manage page do before public updates appear?
- What should the public route show when there are no public updates?
- How should updates/changelog differ from the existing live event stream?
- Which existing tests already cover safety, and which focused tests are
  missing?
- Does this need schema/migration/API changes, or can it start with current
  `linkedDocuments` and `events` payloads?
- Does Discover/global feed integration belong in this slice or a later slice?

## Implementation Permission

If the source map proves a small implementation is safe, DAEDALUS may patch it
inside PR357.

The only likely safe implementation shape is route/helper/test work that uses
existing `DeveloperSpaceDetail.linkedDocuments` and/or `DeveloperSpaceEvent`
data already returned by the public Developer Space detail route.

Do not implement if the patch requires:

- new schema or migration;
- new public API fields beyond existing serialized public data;
- new provider/model calls;
- Redis, Cloudflare, queues, workers, background jobs, or Railway config;
- ingestion key or webhook changes;
- broad visual redesign;
- public exposure of raw runtime/operator data.

If implementation is not obviously bounded, produce only the source-map result
and a precise PR358 packet.

## Non-Scope

Do not change:

- Developer Space ingestion semantics, keys, webhook signing secrets,
  provider policy, live runtime execution, WebSocket/SSE transport, export
  packages, billing, auth/session, schema, migrations, Redis, Cloudflare,
  queues, workers, Railway config, or Supabase admin settings;
- public/private/community visibility semantics;
- raw event JSON, snapshot JSON, prompts, provider payloads, hosted logs,
  credentials, private document bodies, private owner IDs, or secret-shaped
  values;
- Discover feed integration unless the source map proves it is the only safe
  first slice, which is unlikely.

## Result Doc

Create:

```text
docs/roadmap/PR357_DEVELOPER_SPACE_PROJECT_UPDATES_FEED_SOURCE_MAP_RESULT.md
```

If no code changes land, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed PR357 Developer Space project updates/feed source map.
Recommendation:
- Include the exact PR358 implementation packet, or explain why no product lane is needed.
Task:
- Choose the next roadmap move.
```

If code changes land, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR357 Developer Space project updates/feed route/helper/test patch.
Risk:
- Public project updates must not leak raw runtime/operator data or blur event-stream status notes with evidence documents.
Task:
- Review public/private boundary, update source contract, tests, and validation.
- Wake MIMIR with accept/reject verdict.
```

## Suggested Validation

For docs/source-map only:

```text
git diff --check
```

For code changes, use the narrowest relevant set:

```text
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```
