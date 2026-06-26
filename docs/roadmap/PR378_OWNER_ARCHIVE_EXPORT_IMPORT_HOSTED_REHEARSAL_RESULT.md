# PR378 - Owner Archive Export Import Hosted Rehearsal Result

Date: 2026-06-27
Owner: A4 / ARIADNE
Verdict: FAIL

## Hosted Freshness

Hosted Railway web and API were ready at deployment prefix `3d1dae5e`.

This is fresh enough for the PR378 rehearsal because the current hosted code
includes the PR364-PR366 owner trust/readback work and the later public route
proofs. The probe used replay-owner credentials from the local ignored
environment only. No credential, cookie, authorization-token value, raw owner
identifier, raw persona identifier, API body, or hosted log was copied into this
result.

## Routes Rehearsed

| Surface | Route | Result |
| --- | --- | --- |
| Export trust | `/studio/export` | PASS |
| Global Archive search | `/studio/archive` | FAIL |
| Persona import pipeline | `/studio/personas/[replay persona]/files` | PASS |

No mutation was attempted. I did not create exports, retry imports, upload
files, publish documents, change settings, or use any destructive action.

## Export Trust

`/studio/export` loaded and showed the expected owner-facing trust readback:

- `Export trust`;
- `Export and backup readback`;
- `Live package readback`;
- `Global job` / `Not enabled`;
- `Preview and future boundaries`;
- authenticated owner-only bundle copy;
- clear language that full workspace export, original file packaging,
  PDF/binary output, managed backup, restore drills, and Station Press remain
  outside the current product surface.

The visible page did not expose public download locations, signed storage
locations, storage-backend details, file bodies, raw identifiers, raw API
payloads, SQL, stack traces, or secret-shaped values.

## Global Archive Search

`/studio/archive` loaded and showed the expected structural readback:

- `Global Archive`;
- `Private search readback`;
- `Owner-only`;
- grouped `Sources`, `Statuses`, and `Personas` readback.

However, the visible archive result text contained raw JSON-shaped source
material from owner archive content. I am intentionally not quoting the line
back into this document, but the defect is specific to the Global Archive
owner-visible result/readback text: the page is surfacing JSON-shaped source
body material instead of a safe title, source label, or summary.

That fails PR378's explicit "no raw JSON / source body exposure" requirement,
even though the route itself is private and owner-only.

## Persona Import Pipeline

The replay persona Archive/File page loaded and showed the expected import
pipeline readback:

- `Archive Trust`;
- `Import Pipeline`;
- `Supported owner imports`;
- pasted source material;
- text and Markdown files;
- ChatGPT JSON export;
- Claude JSON export;
- Reddit JSON archive;
- Discord JSON archive;
- legacy role/content JSON;
- copy that provider exports become private archive material first;
- copy that Memory and Canon candidates stay pending for owner review;
- clear boundaries that this is uploaded/stored source material, not live
  provider OAuth/API pulling.

The visible page did not expose raw source body text, raw identifiers, raw API
payloads, storage locations, SQL, stack traces, or secret-shaped values.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web/API deployment readback | PASS | Both were ready at prefix `3d1dae5e`. |
| Replay-owner authentication | PASS | Token stayed in memory/browser storage only. |
| Read-only Playwright rehearsal | FAIL | Export and import passed; Global Archive exposed JSON-shaped source material in visible result text. |
| Mutation guard | PASS | No upload/retry/export/publish/settings action was attempted. |

## Required Repair

DAEDALUS should patch the Global Archive owner-visible text path so archive
search/result cards never render raw JSON-shaped source body material. The page
should prefer safe owner-visible titles, source labels, provenance/readback
summaries, or redacted previews that preserve context without dumping imported
source structure.

After that patch lands and deploys, ARIADNE should rerun PR378 on the hosted
Railway line.
