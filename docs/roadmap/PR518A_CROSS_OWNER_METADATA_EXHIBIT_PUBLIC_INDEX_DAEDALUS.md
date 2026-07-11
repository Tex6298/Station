# PR518A - Cross-Owner Metadata Exhibit Dedicated Public Index

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date: 2026-07-11

## Context

ARGUS accepted PR518:

`docs/roadmap/PR518_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_PREFLIGHT_RESULT.md`

MIMIR closeout:

`docs/roadmap/PR518_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_PREFLIGHT_CLOSEOUT.md`

The hosted PR517 proof set established a safe metadata-only public detail
contract for bilaterally approved cross-owner exhibits. PR518A is the first
findability slice: a dedicated public index, separate from same-owner
`/encounters`.

## Task

Implement a dedicated cross-owner metadata exhibit public index.

API:

- add a bounded public list endpoint, for example
  `GET /persona-encounters/cross-owner-public-exhibits`;
- list only rows that pass the same public-readability floor as the detail
  route:
  - `status='published'`;
  - not removed;
  - not retracted;
  - valid public slug;
  - contract version `1`;
  - expected provenance schema;
  - requester and counterparty metadata approvals present;
  - active approved consent with `publish_metadata_only_public_exhibit` at
    requested scope version `1`;
- serialize only public slug/href, title, summary/context note, tags, safe
  requester/counterparty display snapshots, contract version, status, published
  timestamp, provenance labels, and report path;
- use a bounded limit and deterministic latest-only order with a cursor derived
  from public fields such as `publishedAt` plus slug.

Web:

- add a dedicated web index route such as
  `apps/web/app/encounters/cross-owner/page.tsx`;
- optionally add one clear link from the existing same-owner
  `apps/web/app/encounters/page.tsx` index to the dedicated cross-owner index;
- do not mix cross-owner rows into the same-owner `/encounters` list;
- render metadata-only cards with explicit cross-owner provenance labels and no
  transcript, discussion, generated-word, excerpt, summary, or source-body
  claims.

Do not add a DB migration by default. If hosted index latency is poor, document
that as a separate public-list index repair instead of widening this lane.

## Allowed Files

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/web/app/encounters/cross-owner/page.tsx`
- `apps/web/app/encounters/page.tsx` only for a link to the dedicated
  cross-owner index
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `apps/web/app/globals.css` only for scoped index styling
- roadmap/testing docs

## Forbidden Scope

Do not add:

- generated-word publication;
- generated summaries, excerpts, transcripts, or source-derived public text;
- private saved cross-owner artifacts;
- PR516 disposable preview output reuse as public source material;
- retroactive executability for older generic consent rows;
- cross-owner rows mixed into the same-owner `/encounters` list;
- Discover search/feed/rising/featured inclusion;
- `discover_feed` item-type changes;
- public persona, public Space, forum/community/Salon, Station Press, public
  document, writing, feed, homepage, or featured placement;
- provider calls, retrieval, storage, billing, social posting, Redis,
  Cloudflare, queues/workers, package/lockfile changes, deployment changes, or
  broad UI work;
- raw owner ids, raw persona ids, consent ids, table ids, private setup,
  provider payloads, token facts, SQL detail, env values, cookies, bearer
  values, report counts, admin state, or secret-shaped strings in public
  payloads.

## Required Tests

Prove:

- public list returns only published, non-removed, non-retracted cross-owner
  rows with exact bilateral metadata approval and active approved consent;
- pending, wrong-scope, wrong-version, one-sided approval, nonparticipant,
  mismatched metadata, inactive consent, revoked consent, removed, retracted,
  malformed slug, wrong-schema, and wrong-contract-version rows stay absent;
- list payload keys are exactly the allowed public metadata contract;
- list cursor/limit/order are bounded and deterministic without raw ids;
- public detail, report, moderation remove/restore, consent revocation hiding,
  and participant retract behavior remain unchanged;
- same-owner `/encounters` list/detail/report/remove/restore/retract behavior
  remains green;
- Discover search/feed, public persona, public Space, forum/community/Salon,
  writing, public document, and Station Press surfaces do not surface
  cross-owner exhibits;
- web index renders metadata-only cards with cross-owner provenance labels and
  no transcript/discussion/generated-word claims.

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run changed-path, forbidden-path, and secret-shaped value scans.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
```

Include:

- implementation summary;
- exact files changed;
- validation output;
- any blocker or intentionally deferred follow-up.
