# PR358 - Developer Space Project Updates Hosted Rehearsal

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR357 Developer Space project updates/feed source map and widget patch.
- The public `project_notes` widget now renders bounded project updates from existing public field-log documents and public owner-approved status-note events.
- MIMIR needs hosted Railway desktop/mobile proof before closing the visible widget change.
Task:
- Rehearse the hosted public Developer Space project updates widget.
- Use a human-eye view on desktop and 375px mobile.
- Do not mutate evidence, status notes, live data, widgets, Developer Agent actions, keys, billing, or account state.
- Create docs/roadmap/PR358_DEVELOPER_SPACE_PROJECT_UPDATES_HOSTED_RESULT.md.
- Wake MIMIR with PASS, PASS WITH CAVEAT, FAIL, or BLOCKED.
```

## Target

Hosted web:

```text
https://stationweb-production.up.railway.app
```

Primary route:

```text
/developer-spaces/station-replay-dev-alpha
```

Use local ignored `.env` key names only if sign-in is needed:

```text
STATION_REPLAY_OWNER_EMAIL
STATION_REPLAY_OWNER_PASSWORD
```

Do not print, screenshot, commit, summarize, or persist credential values,
cookies, bearer tokens, raw owner IDs, private payloads, hosted logs, SQL,
provider payloads, prompts, completions, Stripe IDs, raw trace bodies,
ingestion keys, receipt IDs, confirmation IDs, preview hashes, or
secret-shaped values.

## Required Checks

Public signed-out route:

- Open `/developer-spaces/station-replay-dev-alpha`.
- Confirm the `Project notes` / project updates widget renders as a visible
  side card or honest empty state instead of disappearing.
- If public field-log evidence is present, confirm it appears as a
  `Field log / update` project update row.
- If public owner-approved status-note events are present, confirm they appear
  as `Status note` project update rows.
- Confirm methodology and finding documents remain in the evidence path rather
  than being mislabelled as project updates.
- Confirm arbitrary runtime events remain in the event stream rather than being
  mirrored as project updates.
- Confirm no raw event JSON, snapshot JSON, private document body, prompt,
  provider payload, hosted log, key, receipt ID, confirmation ID, preview hash,
  private owner ID, or secret-shaped value appears.

Public route as owner, if sign-in is already needed:

- Confirm the owner view keeps the same public project update semantics.
- Confirm owner affordances do not blur into public visitor copy.
- Do not open raw detail, create evidence, approve status notes, run Developer
  Agent actions, change widgets, or save visual mode.

Mobile:

- Repeat the public route at `375px` or `390px`.
- Confirm the project updates widget or empty state remains readable.
- Confirm no document-level horizontal overflow, clipped primary content,
  overlapping text, or trapped controls.

## Non-Scope

Do not:

- create, edit, publish, request-publish, approve, reject, or delete evidence
  documents or status notes;
- run Developer Agent previews, confirmations, receipts, or run-job actions;
- generate or rotate ingestion keys or webhook signing secrets;
- change Developer Space visibility, visual mode, widgets, live data, nodes,
  events, snapshots, exports, usage, billing, subscription, account,
  auth/session, provider, Redis, Cloudflare, queue, worker, schema, migration,
  Railway, or Supabase state;
- inspect hosted logs, SQL, raw trace detail, provider payloads, prompts,
  private archive/source bodies, raw IDs, or secret-shaped values.

## Result Doc

Create:

```text
docs/roadmap/PR358_DEVELOPER_SPACE_PROJECT_UPDATES_HOSTED_RESULT.md
```

Use one verdict:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

If hosted proof passes or passes with caveat, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR358 Developer Space project updates hosted rehearsal.
Verdict:
- PASS or PASS WITH CAVEAT
Task:
- Close the proof or open the next roadmap lane.
```

If product repair is needed, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE found a hosted Developer Space project updates widget defect.
Risk:
- Include route, viewport, visible symptom, and smallest repair scope.
Task:
- Patch only the named defect, validate, and wake ARGUS.
```
