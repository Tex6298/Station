# PR366 - Import Pipeline Owner Readback

Owner: DAEDALUS
Date: 2026-06-26
Status: Accepted by ARGUS

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- MIMIR accepted PR365: Global Archive/private search now has owner-only readback over already-loaded private archive results.
- The next launch-core gap is import pipeline clarity. Parser files and tests already exist, so do not treat this as a from-scratch parser lane.
Task:
- Map current import intake truth: paste/chat import, uploaded file parser support, job statuses, retry behavior, and review/candidate outputs.
- Implement the smallest no-config owner-facing readback improvement if obvious.
- Otherwise wake MIMIR with a ranked next implementation recommendation.
```

## Product Why

Archive search becomes trustworthy only if owners can understand what Station
can ingest, what happened to an import, and whether imported material became
private archive chunks, Memory/Canon review candidates, or a failed job that
left existing data safe.

Current truth to verify:

- source-specific parser files exist for ChatGPT, Claude, Reddit, and Discord;
- parser tests cover positive formats and generic JSON false positives;
- `/imports/chat` supports pasted/manual chat import and retry for persisted
  chat import jobs;
- file import job runner support exists for durable file pointers;
- persona Archive/File UI has paste/import job surfaces;
- Global Archive now surfaces owner-only import/search readback.

## Inspect

- `apps/api/src/routes/imports.ts`
- `apps/api/src/routes/storage.test.ts`
- `apps/api/src/services/imports/parsers/index.ts`
- `apps/api/src/services/imports/parsers/chatgpt.ts`
- `apps/api/src/services/imports/parsers/claude.ts`
- `apps/api/src/services/imports/parsers/reddit.ts`
- `apps/api/src/services/imports/parsers/discord.ts`
- `apps/api/src/services/imports/parsers/import-parsers.test.ts`
- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- `apps/web/components/studio/archive-library.tsx`
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`
- `docs/roadmap/prep-lane-audit.md`
- `docs/ops/open-repo-upgrade-review.md`

## Allowed Patch Shape

Keep this bounded and no-config. Good candidates:

- make the persona Archive/File import UI name the currently supported import
  formats in plain English without implying live OAuth/API pulls;
- improve import job rows so completed, failed, processing, and retryable states
  show source format, safe next action, and owner-only boundary;
- add helper/test coverage for supported-format labels, status labels, retry
  copy, or source-name fallbacks;
- tighten a smallest route/helper gap only if it is already covered by existing
  schema and tests.

## Non-Scope

- No new schema, migration, storage bucket, background job worker, queue,
  Redis, Cloudflare, provider, embedding, billing, auth/session, Railway, or
  Supabase config work.
- No Reddit OAuth/live pull, Discord API connector, recurring import, webhook,
  external API call, crawler, browser worker, or scheduled job.
- No broad import parser rewrite unless the existing parser tests prove a
  concrete false-positive or false-negative defect.
- No automatic Memory/Canon acceptance; imported candidates must stay
  owner-reviewable.
- No public archive/search exposure, raw source-body dump, raw transcript
  exposure outside owner routes, prompt/provider payload exposure, secret
  leakage, private-id display, or cross-owner access.
- No broad Studio redesign.

## Acceptance Shape

Wake ARGUS with:

- current import-pipeline surface map;
- changed files and exact visible/API behavior;
- owner/privacy boundary and candidate-review boundary;
- validation commands run;
- known warnings or blockers.

If no code patch lands, wake MIMIR with:

- ranked first implementation recommendation;
- which import capabilities are already live;
- which capabilities remain future because they need workers, OAuth/API config,
  durable retry semantics, or a separate privacy review.
