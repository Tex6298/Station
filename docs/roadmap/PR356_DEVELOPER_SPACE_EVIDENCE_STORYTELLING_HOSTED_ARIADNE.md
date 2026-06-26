# PR356 - Developer Space Evidence Storytelling Hosted Rehearsal

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- DAEDALUS completed PR355 and found no product patch needed.
- Current code already claims Developer Space public observatory, owner manage evidence path, helper layer, and tests cover methodology/finding/field-log storytelling.
- MIMIR needs hosted Railway human-eye proof before closing that concern from product evidence.
Task:
- Rehearse the hosted Developer Space public and owner evidence-storytelling flow.
- Use a human-eye view on desktop and 375px mobile.
- Do not mutate ingestion keys, evidence, visibility, live data, Developer Agent actions, billing, or account state.
- Create docs/roadmap/PR356_DEVELOPER_SPACE_EVIDENCE_STORYTELLING_HOSTED_RESULT.md.
- Wake MIMIR with PASS, PASS WITH CAVEAT, FAIL, or BLOCKED.
```

## Target

Hosted web:

```text
https://stationweb-production.up.railway.app
```

Primary public route:

```text
/developer-spaces/station-replay-dev-alpha
```

Owner/manage route after replay-owner sign-in:

```text
/developer-spaces/station-replay-dev-alpha/manage
```

Use local ignored `.env` key names only if sign-in is needed:

```text
STATION_REPLAY_OWNER_EMAIL
STATION_REPLAY_OWNER_PASSWORD
```

Do not print, screenshot, commit, summarize, or persist credential values,
cookies, bearer tokens, raw owner IDs, private payloads, hosted logs, SQL,
provider payloads, prompts, completions, Stripe IDs, raw trace bodies,
ingestion keys, or secret-shaped values.

## Required Checks

Public observatory, signed out if possible:

- Open the public Developer Space route.
- Confirm it explains what the observatory is showing now.
- Confirm it separates Station-hosted public readback from the external
  self-hosted runtime.
- Confirm it explains live signals as public-safe summaries rather than raw
  runtime payloads.
- Confirm methodology, findings, field logs, notes, or the empty evidence state
  are understandable to a non-technical visitor.
- Confirm snapshots, live signals, current nodes, and evidence path do not read
  like hidden private data or a generic dashboard.
- Confirm no raw event JSON, snapshot JSON, prompts, provider payloads,
  ingestion keys, private document bodies, private owner IDs, or
  secret-shaped values are visible to a public visitor.

Public route while signed in as owner:

- Confirm owner-only affordances are clearly owner/operator affordances.
- Confirm any raw event/snapshot detail, if exposed, is owner-only and not
  mixed into public visitor copy.
- Confirm the public/private boundary remains visible.

Owner manage route:

- Open the manage route as replay owner.
- Confirm it reads as a private operating console, not a public page.
- Confirm the Evidence path panel explains methodology, findings, field logs,
  notes, and how they relate to the visitor evidence path.
- Confirm controls that would mutate evidence, publish, generate keys, save
  visual mode, run Developer Agent actions, export, or ingest data are not used.
- Confirm existing rows or empty states explain whether evidence is visible to
  visitors or hidden from visitors.

Mobile:

- Repeat the public route at `375px` or `390px`.
- Confirm key evidence/storytelling copy remains readable.
- Confirm controls remain tappable-sized.
- Confirm no document-level horizontal overflow, clipped primary content,
  overlapping text, or trapped controls.

## Non-Scope

Do not:

- generate or rotate ingestion keys;
- create, edit, publish, request-publish, or delete evidence documents;
- change Developer Space visibility, visual mode, widgets, live data, snapshots,
  nodes, events, exports, usage, billing, subscription, account, auth/session,
  provider, Redis, Cloudflare, queue, worker, schema, migration, Railway, or
  Supabase state;
- use Developer Agent action previews, confirmations, receipts, or run-job
  actions;
- inspect hosted logs, SQL, raw trace detail, provider payloads, prompts,
  private archive/source bodies, raw IDs, or secret-shaped values.

## Result Doc

Create:

```text
docs/roadmap/PR356_DEVELOPER_SPACE_EVIDENCE_STORYTELLING_HOSTED_RESULT.md
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
- ARIADNE completed PR356 Developer Space evidence storytelling hosted rehearsal.
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
- ARIADNE found a hosted Developer Space evidence/storytelling defect.
Risk:
- Include route, viewport, visible symptom, and smallest repair scope.
Task:
- Patch only the named defect, validate, and wake ARGUS.
```
