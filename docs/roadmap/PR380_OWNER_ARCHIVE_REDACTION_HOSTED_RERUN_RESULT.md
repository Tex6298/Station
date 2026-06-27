# PR380 - Owner Archive Redaction Hosted Rerun Result

Date: 2026-06-27
Owner: A4 / ARIADNE
Verdict: PASS

## Hosted Freshness

Hosted Railway web and API were both ready at deployment prefix `ad1704d9`,
which satisfies the PR379 freshness gate.

The rerun used replay-owner credentials from the local ignored environment only.
No credential, cookie, authorization-token value, raw owner identifier, raw
persona identifier, raw API body, private source body, screenshot, hosted log,
SQL, or stack trace was copied into this result.

## Routes Rehearsed

| Surface | Route | Result |
| --- | --- | --- |
| Global Archive search | `/studio/archive` | PASS |
| Export trust | `/studio/export` | PASS |
| Persona import pipeline | `/studio/personas/[replay persona]/files` | PASS |

No mutation was attempted. I did not create exports, retry imports, upload
files, publish documents, change settings, or use any destructive action.

## Archive Redaction Proof

`/studio/archive` loaded for the replay owner and showed:

- `Global Archive`;
- `Private search readback`;
- `Owner-only`;
- grouped `Sources`, `Statuses`, and `Personas` readback;
- safe archive overview and source-visibility context;
- the structured-source redaction message from PR379.

The PR378 defect is gone. Visible archive result text no longer rendered raw
JSON-shaped source material. The repaired page still preserved useful
owner-facing context: archive count, source/status/persona grouping, owner-only
boundary, and source-visibility narrative remained visible.

The visible page did not expose raw source bodies, transcript dumps, provider
payloads, raw network locations, raw JSON, private identifiers, SQL, stack
traces, or secret-shaped values.

## Export Spot Check

`/studio/export` still showed the expected trust/readback boundaries:

- `Export trust`;
- `Export and backup readback`;
- `Live package readback`;
- `Preview and future boundaries`;
- `Global job` / `Not enabled`;
- authenticated owner-only bundle copy.

The visible page remained safe and did not imply a live global workspace export
job or expose storage/backend details.

## Import Spot Check

The replay persona Archive/File page still showed:

- `Archive Trust`;
- `Import Pipeline`;
- `Supported owner imports`;
- supported pasted, text/Markdown, ChatGPT JSON, Claude JSON, Reddit JSON,
  Discord JSON, and legacy role/content JSON source types;
- Memory and Canon candidates pending for owner review.

The page remained read-only during the rehearsal and did not expose raw source
body text, raw identifiers, raw API payloads, storage locations, SQL, stack
traces, or secret-shaped values.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web/API deployment readback | PASS | Both ready at prefix `ad1704d9`. |
| Replay-owner authentication | PASS | Token stayed in memory/browser storage only. |
| Read-only Playwright rerun | PASS | Archive redaction, export trust, and import pipeline checks all passed. |
| PR378 defect check | PASS | Raw JSON-shaped archive preview text was not visible. |
| Mutation guard | PASS | No upload/retry/export/publish/settings action was attempted. |
| `git diff --check` | PASS | CRLF normalization warning on the local A4 state receipt only. |

## Handoff

MIMIR can close PR380 as accepted. The PR379 repair is visible on hosted
Railway and the PR378 archive exposure defect is no longer present in the owner
Global Archive route.
