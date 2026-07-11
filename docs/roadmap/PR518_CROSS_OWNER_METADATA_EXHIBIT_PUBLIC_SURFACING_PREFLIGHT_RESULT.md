# PR518 - Cross-Owner Metadata Exhibit Public Surfacing Preflight Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Verdict

```text
ACCEPT_PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_CONTRACT
```

ARGUS accepts public surfacing only as a dedicated cross-owner metadata exhibit
index contract.

The smallest safe next lane is PR518A: make hosted-proven, bilaterally approved
metadata-only cross-owner exhibits findable from an isolated cross-owner public
index. Do not merge them into the existing same-owner `/encounters` list, add
them to Discover search/feed, attach them to public persona or Space pages, or
place them in forum/community/Salon/Station Press surfaces yet.

Recommended next owner: DAEDALUS / A2.

## Evidence Reviewed

ARGUS reviewed:

- `docs/roadmap/PR518_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_PREFLIGHT_ARGUS.md`;
- `docs/roadmap/PR517C_PR517D_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_CLOSEOUT.md`;
- `docs/roadmap/PR517C_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_RERUN_RESULT.md`;
- `docs/roadmap/PR517D_SAME_OWNER_PUBLIC_EXHIBIT_REGRESSION_HOSTED_RERUN_RESULT.md`;
- `docs/roadmap/PR517B_HOSTED_MIGRATION_080_UNBLOCK_MIMIR.md`;
- current cross-owner public exhibit API code in `apps/api/src/routes/persona-encounters.ts`;
- current same-owner `/encounters` index and Discover search code.

Current accepted truth:

- hosted migration `080`, cross-owner public exhibit table/triggers/RLS/report
  target, exact bilateral metadata approval, public API detail readback, public
  report, moderation remove/restore, consent revocation hiding, participant
  retract, no-runtime/no-private-session, no-drift, privacy, and cleanup have
  hosted proof;
- PR517D proved the same-owner public exhibit publish/report/remove/restore/
  retract regression on current hosted;
- public readback is metadata-only and excludes generated words, transcripts,
  excerpts, summaries, prompts, provider payloads, private setup, private
  sessions, raw owner ids, raw persona ids, retrieval bodies, token facts, SQL
  detail, env values, cookies, bearer values, and secret-shaped strings;
- existing `/encounters` is explicitly same-owner today;
- existing Discover search has a same-owner public encounter exhibit group, but
  cross-owner rows are intentionally absent.

## Surface Classification

| Surface | Decision | Reason |
| --- | --- | --- |
| Dedicated cross-owner metadata exhibit index | Safe as PR518A | It is the narrowest findability step after hosted detail/report proof and can preserve a separate cross-owner provenance contract. |
| Existing `/encounters` inclusion | Not PR518A, except an optional link to the dedicated index | Mixing same-owner private-session-backed rows and cross-owner consent-backed rows needs a separate merge/tab contract after the dedicated index is hosted-proven. |
| Discover search result group | Later lane only | Follow the same sequence as PR509/PR510: index first, Discover search after hosted index proof. |
| Public persona linkbacks | Blocked | Display snapshots are not public persona attachment consent. Needs explicit persona/public-slug attachment rules. |
| Public Space linkbacks | Blocked | Space placement must be an explicit publishing action, not inferred from consent or participant ownership. |
| Public feed/homepage/featured | Blocked | Requires ranking/curation/moderation semantics and should not be first surfacing. |
| Forum/community/Salon/Station Press | Blocked | Would invite discussion/publication semantics and excerpt pressure outside the metadata-only contract. |
| No surfacing yet | Too conservative | Hosted detail, report/moderation, revocation, retract, no-drift, and same-owner regression proof are enough for an isolated index. |

## PR518A Lane

Name:

```text
PR518A - Cross-Owner Metadata Exhibit Dedicated Public Index
```

Owner: DAEDALUS / A2

Allowed implementation:

- add a bounded public list endpoint for cross-owner public exhibits, for
  example `GET /persona-encounters/cross-owner-public-exhibits`;
- list only rows that pass the same public-readability floor as the detail
  route: `published`, not removed, not retracted, valid public slug, contract
  version `1`, expected provenance schema, both metadata approvals present, and
  active approved consent with `publish_metadata_only_public_exhibit` at scope
  version `1`;
- serialize only public slug/href, title, summary/context note, tags, safe
  requester/counterparty display snapshots, contract version, status,
  published timestamp, provenance labels, and report path;
- use a bounded limit and deterministic latest-only order with a cursor derived
  from public fields such as `publishedAt` plus slug;
- add a dedicated web index route such as
  `apps/web/app/encounters/cross-owner/page.tsx`;
- optionally add one clear link from the existing same-owner `/encounters`
  index to the dedicated cross-owner index, without mixing rows;
- add helper/types/tests in `apps/web/lib/persona-encounter-runtime.ts` only as
  needed for the dedicated index;
- use scoped CSS only for the dedicated index if needed.

PR518A should not add a DB migration by default. If hosted index latency is poor,
route a separate public-list index repair instead of widening PR518A.

Allowed files:

- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/app/encounters/cross-owner/page.tsx`;
- `apps/web/app/encounters/page.tsx` only for a link to the dedicated
  cross-owner index;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- `apps/web/app/globals.css` only for scoped index styling;
- roadmap/testing docs.

Forbidden in PR518A:

- generated-word publication;
- generated summaries, excerpts, transcripts, or source-derived public text;
- private saved cross-owner artifacts;
- reusing PR516 disposable preview output as public source material;
- retroactively making generic consent rows executable without the exact
  cross-owner public exhibit approval row;
- mixing cross-owner rows into the same-owner `/encounters` list;
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

PR518A must prove:

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

Required local validation:

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

Also run changed-path, forbidden-path, and secret-shaped value scans. If
DAEDALUS touches migration/types, Discover runtime, feed, persona, Space, forum,
Station Press, package, lockfile, Cloudflare, queue, billing, provider,
retrieval, storage, or deployment paths, ARGUS should treat that as scope drift
unless MIMIR explicitly accepts a widened lane.

## Hosted Proof Required

After local ARGUS review accepts PR518A, MIMIR should route ARIADNE for hosted
proof because PR518A would add a new public findability surface.

Hosted proof should verify:

- hosted web/API include the accepted PR518A commit;
- a disposable or otherwise safe bilaterally approved cross-owner metadata
  exhibit appears in the dedicated cross-owner index;
- the index payload/page is metadata-only and routeable only through the
  accepted cross-owner public paths;
- revoked consent, participant retract, moderation remove, removed rows,
  retracted rows, malformed rows, and non-active consent rows stay absent;
- same-owner public exhibit publish/report/remove/restore/retract still works;
- Discover search/feed, public persona, public Space, forum/community/Salon,
  writing, public document, Station Press, homepage, and featured surfaces do
  not surface the proof row;
- desktop and `390px` mobile rendering fit without overlap;
- cleanup leaves no public proof row readable;
- proof output records no raw owner ids, raw persona ids, consent ids, private
  setup, generated reply text, transcript excerpts, summaries, provider
  payloads, prompts, source bodies, env values, tokens, cookies, SQL details,
  stack traces, screenshots, traces, videos, browser storage state, or
  secret-shaped values.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 73 tests passed, including cross-owner metadata approval/detail/report/revocation/retract and same-owner public exhibit regressions. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 8 tests passed, including same-owner and cross-owner public exhibit moderation actions. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 44 tests passed, including current Discover search/feed grouping and safe encounter exhibit routing. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; writing/feed/public persona/Space helpers remain bounded. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 215 tests passed, including cross-owner public metadata helper copy and source guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Current surfacing review | Pass | Cross-owner rows remain absent from same-owner `/encounters`, Discover search/feed, public persona, Space, forum/community/Salon, writing, and Station Press surfaces today. |
| Changed-path / forbidden-path scans | Pass | Staged changes are roadmap/testing docs only; no app/runtime, infra, package, lockfile, Cloudflare, queue, billing, provider, retrieval, storage, or deployment paths changed. |
| Secret-shaped diff scan | Pass | No secret-shaped added lines were found in the staged diff. |
| `git diff --check` | Pass | Whitespace check passed; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR518 as ACCEPT_PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_CONTRACT.
- The smallest safe next lane is PR518A, a dedicated cross-owner metadata exhibit public index contract owned by DAEDALUS.
- PR518A may add only a bounded public list endpoint and dedicated web index for hosted-proven, exactly bilaterally approved metadata-only cross-owner exhibits.
- Existing /encounters mixing, Discover search/feed, public persona, Space, forum/community/Salon, writing, Station Press, generated words, transcripts, excerpts, summaries, private saved artifacts, PR516 disposable output reuse, provider/retrieval/storage/billing/social/Redis/Cloudflare/queue/package/deployment work remain blocked.
- Local validation passed for persona encounters, reports, community/search, writing/feed helpers, Studio UI, and typecheck.
Task:
- Close PR518 preflight if accepted and route DAEDALUS for PR518A using docs/roadmap/PR518_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_PREFLIGHT_RESULT.md.
```
