# PR469B - Public Seminar Populated Replay Seed

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - narrow hosted proof repair

## Why This Lane

ARIADNE passed the hosted PR469A public seminar readback rehearsal, but the
hosted API returned an empty `cards` list:

`docs/roadmap/PR469A_PUBLIC_SEMINAR_READBACK_BUNDLES_REHEARSAL_RESULT.md`

The empty-state proof is healthy, but it does not prove a visible hosted
seminar card, routeable card action, opaque public seminar id, or populated
desktop/mobile card layout.

PR469B is the smallest repair: make the existing staging replay seed curate the
already-created public replay Space/document/thread into `discover_feed` as
featured public material, then prove `/events/seminars` returns at least one
hosted card.

## Required Shape

Use the existing replay seed helper:

`scripts/staging-replay-seed.mjs`

It already creates the public-safe replay surface:

- public Space: `station-replay-alpha`;
- public document: `station-replay-alpha-note`;
- linked public discussion thread for that document.

Add an idempotent seed step that creates or updates featured `discover_feed`
rows for the public replay material needed by PR469A. Prefer at least the
public document row; include the linked public thread and public Space only if
that stays simple and idempotent.

## Boundaries

Do not add:

- schema, migration, admin curation UI, new product route, or broad Discover
  feed remodel;
- realtime rooms, media, attendance, RSVP, tickets, payments, Stripe, provider
  calls, memory writeback, Redis, Cloudflare, queue, worker, or hosted runtime
  scope;
- private Memory, Archive, Canon, Continuity, Integrity, owner setup, private
  document text, private archive source text, credential, raw SQL/table names,
  raw internal ids, storage paths, provider payloads, visitor identity, or
  secret-shaped material to public readback or logs.

## Implementation Notes

- Keep the seed idempotent by matching on stable replay-owned source material,
  not on printed raw ids.
- The public seminar API must continue to resolve every featured candidate
  through existing public routeability checks.
- The seed output must stay sanitized: counts, slugs, labels, and booleans only.
  Do not print service-role keys, owner ids, document ids, thread ids, Space
  ids, provider keys, or raw private corpus text.
- If the existing helper cannot safely create featured rows without a broader
  curation decision, wake MIMIR with the concrete blocker and the smallest
  unblock lane.

## Expected Validation

Run local validation:

```bash
node --check scripts/staging-replay-seed.mjs
npm exec --yes pnpm@10.32.1 -- run replay:seed:validate
node scripts/staging-replay-seed.mjs --dry-run
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If staging config is present locally, run the existing staging seed command and
probe the hosted seminar endpoint with sanitized output:

```bash
npm exec --yes pnpm@10.32.1 -- run replay:seed:staging
```

Required hosted proof after staging seed:

- hosted web/API are deployed at `8b05122e` or later;
- signed-out `GET /events/seminars` returns HTTP 200 with at least one card;
- every returned card id starts with `seminar_` and does not contain raw source
  ids;
- returned card hrefs are public routeable paths only.

## Handoff

If implemented, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR469B public seminar populated replay seed.
Task:
- Review the seed/script changes, hosted populated-card proof, and PR469A
  boundaries.
```

If blocked, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS could not safely populate PR469A hosted seminar cards.
Blocker:
- ...
Task:
- Choose the smallest unblock lane.
```
