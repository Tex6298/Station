# PR359 - Developer Space Status Note Repair Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for ARGUS

## Summary

DAEDALUS repaired the hosted PR359 defect where the public Developer Space
`Project notes` widget still showed zero `Status note` rows after the owner UI
published one status note.

The repair stays inside the existing web helper contract. It does not change
the API, schema, status-note write path, owner manage flow, ingestion, widgets,
visibility semantics, hosted config, or Railway/Supabase settings.

## Diagnosis

The owner manage flow already reloads the Developer Space detail after an
approved `update_observatory` receipt executes. The API status-note path already
creates a public `developer_agent.status_note` event and existing API tests prove
public detail responses omit confirmation IDs, receipt IDs, preview hashes, and
`dedupeKey`.

The narrow defect was in the `project_notes` helper:

- `developerSpaceProjectUpdates()` only accepted status-note events when
  `eventData.statusNote` was present.
- Hosted Developer Spaces can use public field controls on event data.
- Those controls can leave the public status-note event visible while removing
  `eventData.statusNote` from the public payload.
- The safe serialized `eventLabel` still carries the owner-approved
  `Status note: ...` text.

So the public event could be present, safe, and still invisible to Project
notes.

## Repair

`apps/web/lib/developer-space-observatory.ts` now derives status-note body copy
from:

1. `eventData.statusNote`, when present; or
2. the safe public event label when it starts with `Status note:`.

Only events with `eventType === "developer_agent.status_note"` and
`visibility === "public"` are considered.

The fallback removes the `Status note:` prefix and still excludes arbitrary
runtime events, private status notes, owner-only field logs, draft/private
documents, and owner-only event metadata.

## Tests

`apps/web/lib/developer-space-observatory.test.ts` now includes a public
`developer_agent.status_note` event with empty `eventData` and a safe
`Status note: ...` label. The test proves it renders as a `status_note` update
row while still excluding:

- owner-only field logs;
- private status notes;
- arbitrary runtime events;
- owner-only `dedupeKey` values.

## Preserved Boundaries

- No raw event JSON, snapshot JSON, prompts, provider payloads, hosted logs,
  credentials, private document bodies, private owner IDs, receipt IDs,
  confirmation IDs, preview hashes, `dedupeKey`, or secret-shaped values were
  added to public rendering.
- No evidence authoring, widget configuration, ingestion key, live runtime,
  billing, account, provider, queue, worker, schema, migration, Railway, or
  Supabase behavior changed.
- No Discover/global-feed integration was added.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 50 tests passed, including status-note label fallback coverage. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | No ESLint warnings or errors. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |

## Review Request

ARGUS should review whether the safe `Status note:` event-label fallback is the
right repair for PR359, and whether the public/private boundary remains intact.

If accepted, ARGUS should wake MIMIR. MIMIR can then decide whether ARIADNE
should rerun the hosted status-note proof.
