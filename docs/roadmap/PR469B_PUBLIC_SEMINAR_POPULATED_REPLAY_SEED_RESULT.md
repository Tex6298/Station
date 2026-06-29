# PR469B - Public Seminar Populated Replay Seed Result

Owner: DAEDALUS / A2

Date: 2026-06-29

Verdict: `ARGUS_ACCEPTED`

## Summary

DAEDALUS added the smallest populated-card repair for PR469A: the existing
staging replay seed now idempotently features the already-public replay
document, linked public discussion thread, and public Space in `discover_feed`.

This lets hosted `/events/seminars` prove populated public seminar cards without
adding schema, admin curation UI, or new product scope.

## Implementation

Changed:

- `scripts/staging-replay-seed.mjs`

The seed now creates or updates featured `discover_feed` rows for:

- public replay document;
- linked public replay discussion thread;
- public replay Space.

Idempotency is by existing featured row lookup for the source item type, source
item id, and `event_type=featured`; existing rows are patched, missing rows are
inserted.

Seed output remains sanitized. It reports counts, slugs, labels, booleans, and
feature type labels only. It does not print service-role keys, owner ids,
document ids, thread ids, Space ids, provider keys, private corpus text, or raw
private source bodies.

## Hosted Proof

After running the staging replay seed locally, DAEDALUS probed hosted signed-out
readback with sanitized output.

- Hosted web health: HTTP 200, ready, commit `8b05122e5d4e6aee167e810dab332ec8e37fb665`.
- Hosted API health: HTTP 200, ready, commit `8b05122e5d4e6aee167e810dab332ec8e37fb665`.
- Signed-out `GET /events/seminars`: HTTP 200.
- Returned cards: 3.
- Returned source types: `document`, `space`, `thread`.
- Card ids: all match `seminar_<16-hex-digest>`.
- Card hrefs and discussion hrefs: all public routeable `/space/` or `/forums/`
  paths.
- Raw source ids in card ids: none detected.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `node --check scripts/staging-replay-seed.mjs` | Pass | Seed helper syntax checked. |
| `npm exec --yes pnpm@10.32.1 -- run replay:seed:validate` | Pass | Example corpus validates and reports planned `seminarFeatures: 3`. |
| `node scripts/staging-replay-seed.mjs --dry-run` | Pass | Dry-run reports `seminarFeatureTypes: document, thread, space` with sanitized labels only. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `npm exec --yes pnpm@10.32.1 -- run replay:seed:staging` | Pass | Staging seed completed and reported `seminarFeatures: 3` with sanitized output. |
| Hosted signed-out `GET /events/seminars` | Pass | HTTP 200 with 3 opaque-id public cards. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Boundaries Kept

PR469B does not add schema, migrations, admin curation UI, realtime rooms,
media, attendance, RSVP, tickets, payments, Stripe, provider calls, memory
writeback, Redis, Cloudflare, queue, worker, or broad Discover/UI scope.

## ARGUS Review

ARGUS accepts PR469B.

Review result:

`docs/roadmap/PR469B_PUBLIC_SEMINAR_POPULATED_REPLAY_SEED_REVIEW_RESULT.md`

ARGUS reran local seed validation, focused API/web tests, typecheck,
idempotent staging seed, and hosted signed-out `/events/seminars` proof. The
patch remains a seed/proof repair only and does not broaden PR469A product
scope.
