# PR56 - Project Activity Readback

Date: 2026-06-19
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rechecks only if UI changes,
MIMIR decides next lane.

## Purpose

Give owners a small observational readback for Projects after PR55 made
attachments usable.

PR56 should summarize activity from attached Developer Spaces without changing
quota math, billing, public visibility, exports, member authorization, or
runtime hosting.

## Scope

Implement only:

- Owner-only Project activity/readback data derived from existing attached
  Developer Spaces.
- Aggregate over `developer_space_usage` rows filtered by:
  - `project_id = project.id`;
  - `owner_user_id = req.user.id`.
- Include bounded counters only, for example:
  - attached Developer Space count;
  - ingested nodes;
  - ingested events;
  - ingested snapshots;
  - storage bytes;
  - public detail reads;
  - exports.
- Prefer extending owner-only `GET /projects/:idOrSlug` with an `activity`
  object unless the implementation finds a cleaner existing local pattern.
- Add focused `test:projects` coverage for activity aggregation, zero-state,
  and cross-owner exclusion.
- Update docs/status/validation.

## Response Shape

Recommended shape:

```json
{
  "project": {},
  "developerSpaces": [],
  "activity": {
    "developerSpaces": 2,
    "nodes": 4,
    "events": 28,
    "snapshots": 3,
    "storageBytes": 12000,
    "publicReads": 8,
    "exports": 1
  }
}
```

Names can follow local API conventions if a better pattern already exists.

## Non-Scope

- No quota math changes.
- No billing, Stripe, or entitlement changes.
- No public Project pages or Discover integration.
- No Project UI unless the implementation needs a tiny owner readback display
  and can keep it strictly bounded.
- No Project activity timeline.
- No event payloads, private ingestion data, evidence documents, or raw logs.
- No project exports and no `export_packages.project_id`.
- No contributor UI or member-role authorization.
- No invitations or membership management.
- No seed-data backfill.
- No Cloudflare.
- No Tier 2 hosting, containers, database provisioning, Redis queues,
  deployment pipeline, developer agent, chat-native tools, or DexOS widgets.

## Acceptance

ARGUS can accept PR56 if:

- Project read remains authenticated and owner-scoped.
- Activity aggregation filters by both `project_id` and `owner_user_id`.
- Cross-owner usage rows are excluded even if test data shares a Project id.
- Empty/zero-state Projects return zeros, not errors.
- No billing/quota behavior changes.
- No public Project route/page is added.
- Existing `test:projects`, `test:developer-spaces`, and typecheck stay green.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## Handoff

Wake ARGUS with:

- route/service/test files changed;
- exact response-shape change;
- aggregation filters;
- proof of zero-state and cross-owner exclusion;
- validation results;
- confirmation that public Project pages, quota/billing, exports,
  contributor/member auth, Cloudflare, Tier 2, developer-agent, DexOS, and
  `export_packages.project_id` stayed untouched;
- any PR57 recommendation.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.
