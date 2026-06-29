# PR478 - Community Reputation / Moderator Expansion Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_PR478A_COMMUNITY_TRUST_READBACK`

## Decision

ARGUS accepts the smallest honest first slice as:

```text
PR478A - Community Trust Readback
```

This is a readback-only product-depth slice around existing witness and private
author-recognition surfaces. It should explain what current aggregate witness
marks mean, where they are visible, and which privacy boundaries hold, without
turning community trust into public reputation, points, clout, moderator
identity, or new moderation power.

It is not a reputation system, public score, badge/ranking launch, public
moderator directory, report-queue power expansion, automated moderation path,
or broad forum redesign.

## Existing Surface Findings

Repo inspection found mature protected-beta community surfaces:

- Public/community forum category, thread, and comment reads already exist with
  visibility gates.
- Thread and comment report creation and reporter-owned status readback exist.
- Admin report queue and status transitions exist under `/reports` and
  `/forums/moderation`.
- Scoped delegated moderation queue/status/target controls already exist under
  `/forums/subcommunities/:slug/moderation` and preserve platform-admin,
  subcommunity-owner, and active-moderator gates.
- Existing delegated moderation target actions are bounded to safety actions on
  proven thread/comment targets.
- Witness controls already exist on readable thread/comment targets with
  aggregate counts and current-viewer state only.
- Private author recognition readback already exists at `/forums/witnesses`
  using `/forums/witnesses/mine`.
- The current tests already prove no witnesser identities, raw witness rows,
  hidden target bodies, unrelated private target context, reporter identities,
  admin notes, or private moderator internals are exposed.

Because moderator queue/status/target actions are already deep and sensitive,
the smaller first PR478A slice is community trust readback. It can improve
understanding of the current witness/recognition loop without touching report
mutation, delegated moderator power, or schema.

## Boundary Findings

Accepted for PR478A:

- readback-only helper/copy around existing witness counts and private author
  recognition;
- existing aggregate counts for `helpful`, `grounded`, and `careful` marks;
- current-viewer witness state where the API already provides it;
- private, signed-in author recognition readback on `/forums/witnesses`;
- clear boundary copy that witness marks are contribution-level acknowledgments,
  not public user scores, rankings, badges, or reputation profiles.

Blocked beyond PR478A:

- public leaderboards, badges, rankings, scores, clout, reputation profiles, or
  user dossiers;
- public moderator directories, public reporter lists, witnesser identities, or
  reporter identities;
- raw report ids, raw witness rows, moderation notes, admin-only internals,
  hidden/deleted/removed content bodies, private comments, SQL/table details,
  stack traces, or provider payloads;
- new moderation powers, destructive actions, automated moderation,
  provider/model moderation calls, AI judgment, notification rewrites, broad
  forum redesign, billing, Stripe, Redis, Cloudflare, workers, or queues.

No schema change is accepted for PR478A. If DAEDALUS finds a schema change is
required to make trust readback honest, stop and wake MIMIR with the exact
contract/blocker instead.

## Accepted PR478A Scope

DAEDALUS may implement a narrow readback-only slice:

- Add a small web helper/model, for example
  `apps/web/lib/community-trust-readback.ts`, that:
  - describes witness marks as contribution-level acknowledgments;
  - maps `helpful`, `grounded`, and `careful` to plain labels and bounded
    explanatory copy;
  - states that counts are aggregate-only and do not reveal witnesser
    identities;
  - states that private author recognition is visible only to the signed-in
    author on `/forums/witnesses`;
  - never computes user scores, ranks, badges, profile reputation, moderation
    standing, or public author comparisons.
- Update existing surfaces only:
  - forum thread detail witness panel, including comment witness controls if
    touched;
  - `/forums/witnesses` private author recognition page;
  - optional entry/link copy from existing forums navigation if already present
    and narrow.
- Keep all API behavior read-only and existing:
  - do not add tables, migrations, report fields, witness fields, ranking
    queries, or public profile fields;
  - do not change `/reports`, delegated moderation status routes, moderation
    action routes, notification fanout, or witness write semantics.
- Add focused tests that prove the helper/copy:
  - does not use "score", "rank", "leaderboard", "badge", "clout", or
    "reputation profile" as positive product claims;
  - does not expose witnesser IDs, reporter IDs, raw report IDs, raw route IDs,
    hidden bodies, admin notes, moderation reasons, SQL/table details, stack
    traces, or provider payloads;
  - keeps `/forums/witnesses` private/current-user scoped and aggregate-only;
  - keeps signed-out/below-tier/self/eligible witness states honest.

If DAEDALUS chooses to touch moderator queue UI at all, it must be limited to a
readback link or explanatory note pointing to existing permissions; no status
transition, target action, route, API, or serializer behavior may change under
PR478A.

## Required Tests

DAEDALUS should add or update focused coverage in:

- `apps/web/lib/community-trust-readback.test.ts` or existing
  `community-witness` / `community-author-recognition` helper tests;
- `apps/web/lib/community-witness.test.ts`;
- `apps/web/lib/community-author-recognition.test.ts`;
- source assertions for `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
  and `apps/web/app/forums/witnesses/page.tsx` if UI copy is added.

Required proof:

- trust readback uses aggregate witness counts and current-viewer state only;
- author recognition remains private-tier/current-user readback;
- no witnesser identities, reporter identities, raw witness rows, raw report
  ids, hidden/removed/deleted bodies, private comments, admin notes,
  moderation reasons, SQL/table details, stack traces, provider payloads, or
  internal row ids are rendered;
- no public points, badges, ranks, leaderboards, user scores, clout, public
  reputation profile, moderator directory, public reporter list, automated
  moderation, AI judgment, new moderation power, Redis, Cloudflare,
  workers/queues, billing, or schema behavior is added or claimed.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a diff-only sensitive/scope scan covering public scores, ranks,
leaderboards, badges, clout, reputation profiles, moderator directories,
reporter/witnesser identities, raw reports, raw witness rows, hidden/deleted
bodies, private comments, moderation notes, SQL/table output, stack traces,
provider payloads, automated moderation, new moderation powers, Redis,
Cloudflare, workers/queues, billing, and schema changes.

## ARIADNE Rehearsal Requirement

After DAEDALUS implements PR478A and ARGUS accepts it, MIMIR should route
ARIADNE for hosted read-only proof:

- signed-out public forum thread detail desktop/mobile shows aggregate witness
  readback without current-viewer state or witnesser identity;
- signed-in eligible viewer sees current-viewer witness state and trust
  boundary copy, with no public scoring/ranking/badge language;
- signed-in author opens `/forums/witnesses` and sees private aggregate
  recognition readback only;
- below-tier or signed-out `/forums/witnesses` remains gated;
- no report queue material, reporter identity, moderation notes, hidden/deleted
  bodies, raw ids, SQL/table output, stack traces, provider payloads,
  moderator directory, new moderation power, automation, Redis, Cloudflare,
  worker/queue, billing, or schema behavior is exercised or captured.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | PR478 handoff, Community Beta audit, future lanes, reports route, community witness/author-recognition helpers, delegated moderation helpers/pages, moderation console helpers/pages, forum thread witness UI, and current tests inspected. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 39 tests passed, including delegated queue privacy, witness aggregate/current-user scope, moderation privacy, and public/community boundaries. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed for admin queue, reporter-owned status, safe target context, and review requests. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 4 tests passed for document discussion visibility and bounded route errors. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 163 tests passed, including community witness, private recognition, moderation console, delegated moderation queue, report resolution, and notification helpers. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully from turbo cache. |
| `git diff --check` | Pass | No whitespace errors before ARGUS docs edits. |

## Handoff

Wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
```

Task: implement `PR478A - Community Trust Readback` exactly as a readback-only
helper/copy slice on existing witness and private recognition surfaces. Do not
add public scores, leaderboards, badges, clout, raw reports, reporter or
witnesser identity exposure, new moderation powers, automated moderation,
broad forum redesign, Redis, Cloudflare, workers/queues, billing, schema
changes, or private moderation leakage.
