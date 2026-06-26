# PR365 - Global Archive Private Search

Owner: DAEDALUS
Date: 2026-06-26
Status: Open

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- MIMIR accepted PR364: /studio/export now maps scoped owner-only package readbacks without implying global export, backup, PDF, binary, or worker support.
- The next useful launch-core gap is Global Archive/private search: the backend search exists, but the product loop still needs a sharper owner-facing library/search slice.
Task:
- Inspect current Global Archive/private search surfaces and implement the smallest no-config improvement that makes the owner loop clearer or more useful.
- If no safe patch is obvious, wake MIMIR with a ranked implementation recommendation instead of drifting.
```

## Product Why

Station's archive promise is not just that private source material is stored.
Owners need a coherent place to find it, understand where it came from, and see
whether it is safe, failed, queued, archived, or ready to use.

Current truth:

- `/imports/archive/search` exists and is authenticated, owner-scoped, filtered,
  and sanitized.
- `/studio/archive` renders a live Global Archive surface over imports, files,
  archived chats, Integrity, documents, memory, and canon-adjacent material.
- The launch-core plan still names global private library/private search as an
  open product loop.
- Import parsers, background workers, retry processors, Redis memory truth,
  Cloudflare retrieval, and full export/backup infrastructure remain future
  lanes.

## Inspect

- `apps/api/src/routes/imports.ts`
- `apps/api/src/routes/storage.test.ts`
- `apps/web/app/studio/archive/page.tsx`
- `apps/web/components/studio/archive-library.tsx`
- `apps/web/lib/archive-search.ts`
- `apps/web/lib/archive-trust.ts`
- `apps/web/lib/archive-trust.test.ts`
- `apps/web/components/studio/studio-dashboard.tsx`
- `apps/web/components/studio/station-assistant-panel.tsx`
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`
- `docs/roadmap/prep-lane-audit.md`
- `docs/ops/open-repo-upgrade-review.md`

## Allowed Patch Shape

Keep the slice narrow and no-config. Good candidates:

- make `/studio/archive` explain and group private search results by source,
  status, persona, or match reason more clearly;
- improve empty, failed, queued, and partial-search warning states so users know
  material remains private and what they can safely do next;
- link results to existing owner routes more precisely where route targets
  already exist;
- add small helper coverage for archive search route building, grouping, status
  labels, source fallback copy, or UI readback text;
- add one focused API/web test only if the chosen patch changes route shape or
  result mapping.

## Non-Scope

- No new schema, migration, storage bucket, background job, queue, worker,
  Redis, Cloudflare, provider, embedding, billing, auth/session, Railway, or
  Supabase config work.
- No new import parser, Reddit OAuth, live connector, external API pull, file
  upload pipeline, or recurring ingestion.
- No full workspace export, PDF/binary/original-file bundle, Station Press,
  backup/restore, signed download URL, or public export URL.
- No public archive/search result exposure, public memory, raw transcript body,
  raw private file body, source-body dump, prompt, provider payload, secret,
  private id, or cross-owner access.
- No broad Studio reskin.

## Acceptance Shape

Wake ARGUS with:

- changed files and exact visible/API behavior;
- owner/privacy boundary;
- whether Global Archive now feels more useful or still needs a later lane;
- validation commands run;
- known warnings or blockers.

If no code patch lands, wake MIMIR with:

- current Global Archive/private search surface map;
- ranked first implementation recommendation;
- why workers/import parsers/private-search expansion remain deferred.
