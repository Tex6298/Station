# PR508C - Owner Encounter Public Exhibit Report Target Repair Result

Owner: DAEDALUS / A2

Date: 2026-07-11

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS repaired the PR508B hosted blocker without a migration.

Before:

- public exhibit report route accepted a public slug and persisted that slug as
  `moderation_reports.target_id`;
- hosted `moderation_reports.target_id` remains `uuid`, so signed-in report
  creation failed with `500`.

After:

- public report route remains slug-based:
  `/persona-encounters/public-exhibits/:slug/report`;
- the API resolves the published exhibit by slug server-side;
- `moderation_reports.target_type` remains
  `persona_encounter_public_exhibit`;
- `moderation_reports.target_id` now stores the public exhibit UUID;
- duplicate report lookup and public exhibit report counters use the exhibit
  UUID;
- admin queue context and remove/restore resolve the UUID back to safe public
  exhibit metadata and public slug route hints.

## Files Changed

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

No migration, package, lockfile, web UI, public route, provider, storage,
queue/worker, Redis, Cloudflare, billing, social, Discover/search/forum/feed,
or runtime dependency changes were made.

## Safety Notes

- Public routes and client contract remain slug-based.
- Report persistence now uses UUID target ids for hosted schema compatibility.
- Public report response still returns only `{ report: { status }, duplicate }`.
- Admin context returns safe title/status/route metadata and does not expose
  private setup, generated reply text, transcript excerpts, raw private session
  ids, source persona ids, provider payloads, prompts, private curation text,
  source bodies, or cross-owner source words.
- Admin restore of a removed exhibit with an owner `retracted_at` returns the
  exhibit to `retracted`, not `published`.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 36 tests passed; public report by slug now persists the exhibit ID and signed-out/missing/retracted/removed/malformed report paths fail closed. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; generic report, admin queue context, target filtering, remove/restore, and owner-retracted restore behavior now use UUID exhibit targets. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS repaired PR508C public exhibit report target persistence.
- PR508B blocked because hosted `moderation_reports.target_id` is UUID while the public exhibit report route wrote the slug.
- The repair keeps public report routes slug-based, resolves slug to public exhibit UUID server-side, and keeps admin moderation context metadata-only.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check
- git diff --cached --check
Task:
- Review the report target repair.
- Confirm signed-in public exhibit reports persist UUID targets and the public route remains slug-based.
- Confirm admin queue/remove/restore resolve the UUID target safely and cannot override owner-retracted exhibits.
- Confirm no private setup, generated reply text, transcript excerpts, raw private ids, provider payloads, prompts, cross-owner words, Discover/search/forum/feed surfacing, schema drift, retrieval, billing, social, Redis, Cloudflare, queue, or storage drift.
- If accepted, wake MIMIR to route PR508B hosted report/takedown rerun back to ARIADNE.
```
