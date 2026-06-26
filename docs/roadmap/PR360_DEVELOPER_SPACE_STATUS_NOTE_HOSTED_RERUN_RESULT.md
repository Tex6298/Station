# PR360 - Developer Space Status Note Hosted Rerun Result

Owner: ARIADNE

Date: 2026-06-26

Verdict: FAIL

## Scope

ARIADNE reran the hosted Railway proof for the replay Developer Space
`Project notes` status-note source.

Target:

```text
https://stationweb-production.up.railway.app
```

Routes:

```text
/developer-spaces/station-replay-dev-alpha
/developer-spaces/station-replay-dev-alpha/manage
```

Credential values, cookies, auth values, authorization header values, raw owner
IDs, private payloads, hosted logs, SQL, provider payloads, prompts,
completions, Stripe IDs, raw trace bodies, ingestion keys, receipt IDs,
confirmation IDs, preview hashes, deployment IDs, and secret-shaped values were
not committed or summarized.

## Deploy Readiness

The hosted web deployment reported ready on `main` at commit prefix `823bf48e`,
which is the accepted PR359 repair commit.

This was not treated as a stale-deploy result.

## Public Rerun Before Mutation

The public Developer Space route loaded on desktop and 375px mobile.

- `Project notes` was visible.
- `Status note` rows: 0.
- `Field log / update` rows: 2.
- No raw JSON, raw UUID-like values, receipt IDs, confirmation IDs, preview
  hashes, or secret-shaped values were visible.
- No document-level horizontal overflow was detected.

Because no public `Status note` row was visible, PR360 allowed one additional
safe replay-owner status-note attempt.

## Single Owner UI Attempt

ARIADNE signed in as the replay owner and used the existing owner manage UI
only.

- The manage route loaded.
- The `Update observatory` status-note path was selected.
- One safe public status-note intent was recorded and approved.
- One `Publish status note` owner UI action was clicked.
- The owner UI displayed safe status-note success copy.
- No ingestion key, evidence document, widget, visual mode, export, billing,
  account, live data, Developer Agent run-job, provider, worker, queue, schema,
  Railway, Supabase, or unrelated action was used.

The temporary browser harness hit a strict locator failure after the safe
success copy appeared because more than one safe success/status-note message was
visible. No second publish action was attempted.

## Verification-Only Rerun

ARIADNE then reran public desktop and mobile checks with mutation disabled.

Desktop public route:

- `Project notes` remained visible.
- `Status note` rows: 0.
- `Field log / update` rows: 2.
- No raw JSON, raw UUID-like values, receipt IDs, confirmation IDs, preview
  hashes, or secret-shaped values were visible.
- No document-level horizontal overflow was detected.

Mobile public route at 375px:

- `Project notes` remained visible.
- `Status note` rows: 0.
- `Field log / update` rows: 2.
- No document-level horizontal overflow, clipped primary content, overlapping
  text, or trapped controls were detected.

## Public API Shape

A sanitized public API count check for the same Developer Space returned:

- total public event rows in the detail payload: 1;
- public `developer_agent.status_note` events: 0;
- public status-note events with a safe `Status note:` label fallback: 0;
- public status-note events with `eventData.statusNote`: 0;
- public field-log linked documents: 2.

So the hosted public route is not merely failing to render a present
status-note event. The public detail payload still has no public status-note
source for the widget to render.

## Defect

PR360 remains failed after the accepted PR359 web-helper repair.

The deployed public helper can render a safe `Status note:` label fallback, but
hosted public detail still exposes zero public `developer_agent.status_note`
events after the existing owner UI status-note publish path is used once.

Smallest repair scope:

- Inspect the owner manage `Update observatory` / `Publish status note` path for
  `/developer-spaces/station-replay-dev-alpha/manage`.
- Confirm the execution path creates or reuses exactly one public
  `developer_agent.status_note` event.
- Confirm that event is included in signed-out public Developer Space detail
  responses without exposing receipt IDs, confirmation IDs, preview hashes,
  private owner IDs, raw JSON, `dedupeKey`, or secret-shaped values.
- Confirm `/developer-spaces/station-replay-dev-alpha` renders the event as a
  `Status note` row in `Project notes` on desktop and 375px mobile.

Do not broaden into evidence authoring, widget configuration, ingestion keys,
live runtime, billing, account state, providers, queues, workers, schema
migrations, Railway config, or Supabase config unless one is proved to be the
smallest necessary fix.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr360-status-note-hosted.spec.cjs --reporter=line --workers=1` - failed before mutation on the first attempt because the live observatory route kept `networkidle` open.
- The harness was corrected to wait for DOM readiness and the actual `Project notes` heading.
- The corrected run used the one allowed owner UI status-note path, displayed safe success copy, then failed on a strict locator ambiguity after mutation.
- A final verification-only run with mutation disabled produced the public desktop/mobile `FAIL` evidence above.
- Sanitized public API count check confirmed the public detail payload still contains zero public status-note events.
