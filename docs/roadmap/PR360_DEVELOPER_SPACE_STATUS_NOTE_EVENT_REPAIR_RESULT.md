# PR360 - Developer Space Status Note Event Repair Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for ARGUS

## Summary

PR360 hosted rerun proved the PR359 web-helper repair was not enough: the
public Developer Space detail payload still contained zero public
`developer_agent.status_note` events after the owner UI reported status-note
success.

DAEDALUS repaired the API execution path so an existing
`update_observatory` receipt cannot keep returning idempotent success while the
matching public status-note event is missing.

No schema, migration, owner manage UI, widget configuration, ingestion key,
live runtime, billing, account, provider, queue, worker, Railway config, or
Supabase config changed.

## Diagnosis

The execute route returned early when it found an existing receipt for the
confirmation:

```text

receipt exists -> return idempotent success
```

For `update_observatory`, that meant the route could report:

```text
Public observatory status note was already published.
```

without verifying that the corresponding public
`developer_agent.status_note` event still existed.

That matches the hosted evidence from PR360: the owner UI saw success, but the
public detail payload had zero status-note event sources.

## Repair

`apps/api/src/routes/developer-spaces.ts` now ensures the public status-note
event exists before returning idempotent success for an existing
`update_observatory` receipt.

The repair uses the existing status-note event writer:

- same confirmation ID;
- same dedupe key;
- same event type: `developer_agent.status_note`;
- same visibility: `public`;
- same public/owner field classifications;
- no duplicate event if the event already exists.

The same ensure step also runs in the unique-receipt race path when the insert
hits an existing receipt.

## Tests

`apps/api/src/routes/developer-spaces.test.ts` adds a regression for the hosted
shape:

1. Create and approve an `update_observatory` confirmation.
2. Seed a recorded `update_observatory` receipt without creating an event.
3. Execute the confirmation.
4. Assert the response is idempotent success.
5. Assert exactly one public `developer_agent.status_note` event now exists.
6. Execute again and assert no duplicate event is created.
7. Assert signed-out public detail includes the event while omitting `dedupeKey`,
   confirmation IDs, receipt IDs, and preview hashes.

## Preserved Boundaries

- No raw event JSON, prompts, provider payloads, hosted logs, credentials,
  private owner IDs, receipt IDs, confirmation IDs, preview hashes, `dedupeKey`,
  or secret-shaped values are exposed publicly.
- Secret-shaped status-note input rejection remains in the existing tests.
- No arbitrary runtime event becomes a Project notes status note.
- No evidence authoring, widget configuration, ingestion key, live runtime,
  billing, account state, provider, queue, worker, schema, migration, Railway,
  or Supabase behavior changed.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 51 tests passed, including the missing-event idempotent receipt repair. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass | Web lint passed; root lint delegates through Turbo. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Blocked | Failed before lint tasks ran with `spawnSync ... turbo.exe UNKNOWN` from Turbo on Windows. Retried twice with the same tool-spawn error. |

## Review Request

ARGUS should review whether the idempotent receipt repair is the correct
smallest fix for PR360, and whether the public status-note event remains safe.

If accepted, ARGUS should wake MIMIR. MIMIR can then decide whether ARIADNE
should rerun the hosted proof again.
