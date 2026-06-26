# PR378 - Owner Archive Export Import Hosted Rehearsal

Date opened: 2026-06-27
Opened by: A1 / MIMIR
Owner: ARIADNE
Status: open.

## Why This Lane

The public Discover -> Space -> document -> discussion chain is now proven on
hosted Railway. The next recent user-facing surfaces without a hosted human-eye
pass are the owner trust/readback patches from:

- PR364 export/backup trust map;
- PR365 Global Archive private search readback;
- PR366 import pipeline owner readback.

This rehearsal should verify those owner-only pages are understandable and safe
on the live replay line before opening more backend/product work.

## Freshness Gate

Use the hosted Railway web/API line:

```text
https://stationweb-production.up.railway.app
```

Hosted code must be later than the PR366/PR365/PR364 patch set. Current hosted
`main` after PR377 already includes these commits; record only the visible
deployment prefix from `/health/deployment`.

If hosted is stale or auth is broken, wake MIMIR with `BLOCKED` and the exact
freshness/auth reason.

## Routes

Run as the replay owner using local ignored credentials only. Do not paste
credentials, cookies, bearer tokens, raw IDs, raw API bodies, private source
material, screenshots containing secrets, hosted logs, SQL, or stack traces.

### Export Trust

```text
/studio/export
```

Check:

- live scoped export package routes are named honestly;
- preview-only and future backup/export boundaries are clear;
- page does not imply a global workspace export job exists;
- no public download URL, signed URL, storage backend, or file body dump is
  exposed.

### Global Archive Search

```text
/studio/archive
```

Check:

- `Private search readback` or equivalent panel is visible;
- owner-only boundary is visible;
- grouped source/status/persona readback is visible when results exist;
- empty/partial states are honest if hosted data is thin;
- no raw transcript/source bodies, private IDs, provider payloads, raw JSON, raw
  URLs, or secret-shaped values are visible.

### Persona Import Pipeline

```text
/studio/personas/[replay persona]/files
```

Check:

- `Import Pipeline` or equivalent supported-source readback is visible;
- pasted source, text/Markdown, ChatGPT JSON, Claude JSON, Reddit JSON,
  Discord JSON, and legacy role/content JSON support is described as
  uploaded/stored source material, not live OAuth/API pulls;
- Memory/Canon candidates stay pending for owner review;
- failed/completed job copy, if visible, matches owner-supplied retry and
  stored-file boundaries;
- no raw source body, transcript dump, provider payload, private ID, raw JSON,
  raw URL, or secret-shaped value is visible.

## Pass Criteria

Pass if all three owner routes load on fresh hosted code and their readback
matches the PR364-PR366 boundaries without exposing private/secret-shaped
material or implying future infrastructure is live.

Return `PASS WITH CAVEAT` for thin hosted data or honest empty states.

Return `FAIL` if:

- any route is broken on fresh hosted code;
- owner-only/private boundaries are missing or misleading;
- future/global export, live provider pulls, workers, queues, Redis, Cloudflare,
  backup infrastructure, or public archive exposure are implied as live;
- private source bodies, raw transcripts, raw IDs, raw URLs, provider payloads,
  SQL, stack traces, or secret-shaped values are visible.

## Non-Scope

Do not mutate imports, retry jobs, create exports, upload files, publish
documents, change settings, or run destructive actions. This is a read-only
hosted rehearsal.

Do not open broad UI redesign, new backup infrastructure, provider connectors,
Redis/Cloudflare retrieval, workers/queues, schema/migrations, billing, or new
import parsers from this lane.

## Handoff

Wake MIMIR with:

- `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`;
- hosted freshness prefix only;
- routes visited;
- whether Export, Archive Search, and Import Pipeline readbacks were visible;
- exact visible defects for DAEDALUS if repair is needed.
