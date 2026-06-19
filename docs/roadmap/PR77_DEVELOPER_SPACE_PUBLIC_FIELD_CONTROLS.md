# PR77 - Developer Space Public Field Controls

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses only if visible
Developer Space UI changes.
Status: implemented by DAEDALUS; ready for ARGUS review

## Why This Lane

The Developer Space launch-core path has moved from "demoable" toward
partner-ready:

- PR75 made ingestion failures machine-readable and partner docs usable.
- PR76 added a cache-backed request-window limiter for ingestion bursts.
- Earlier Developer Space work already has event visibility, owner/public
  access levels, secret-shaped key scrubbing, linked documents, usage counters,
  exports, visual config, and live updates.

One launch-core gap remains in the public/private data story: public
serialization strips secret-shaped keys, and event visibility controls whether
an entire event/snapshot can be seen, but non-sensitive fields inside public
metrics, event data, and snapshot data are still broadly visible by default.

Owners need a bounded way to make a public observatory readable while choosing
which ingested fields visitors can see.

## Goal

Add or prove a narrow public-field control layer for Developer Space visitor
data.

The desired behavior:

- owner reads keep raw operational data through existing owner-only routes;
- public/member reads still remove secret-shaped keys regardless of config;
- if a public field allowlist is configured, visitor data includes only those
  allowed non-sensitive fields;
- if no allowlist is configured, existing public-safe scrubbing behavior remains
  compatible unless DAEDALUS has a safer migration plan.

## Scope

Inspect before editing:

- `apps/api/src/services/developer-space.service.ts`;
- `apps/api/src/routes/developer-spaces.ts`;
- `apps/api/src/routes/developer-spaces.test.ts`;
- `packages/types/src/developer-space.ts`;
- `apps/web/lib/developer-space-visual-config.ts`;
- `apps/web/lib/developer-space-observatory.ts`;
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`;
- `apps/web/app/developer-spaces/[slug]/page.tsx`;
- `docs/roadmap/PR65_DEVELOPER_SPACE_OBSERVABILITY_READBACK.md`;
- `docs/roadmap/PR75_DEVELOPER_SPACE_PARTNER_READINESS.md`;
- `docs/roadmap/PR76_DEVELOPER_SPACE_INGEST_RATE_LIMIT.md`.

Preferred implementation path:

1. Reuse `developer_spaces.visualisation_config` for a small public-field
   control shape rather than adding a migration.
2. Keep the first shape simple and explicit, for example:

```json
{
  "publicFieldControls": {
    "nodeMetricKeys": ["uptime", "confidence"],
    "eventDataKeys": ["status", "summary", "phase"],
    "snapshotDataKeys": ["summary", "nodeCount"]
  }
}
```

3. Apply the allowlist only to non-owner detail/SSE/public reads.
4. Always apply the existing secret-key scrubber after or in addition to the
   allowlist, so allowlisting `token`, `password`, `secretKey`, etc. still does
   not publish those fields.
5. Owner reads and ingestion responses should continue to show raw owner data
   through the existing owner-only path.
6. Add focused tests for:
   - owner raw data retained;
   - public/member data allowlisted;
   - secret-shaped keys stripped even if allowlisted;
   - default compatibility when no controls are configured;
   - SSE/detail payload parity if touched.
7. Document the control shape where partners already read Developer Space
   ingestion/public-safety docs.

If the current visualisation config shape is too ambiguous for safe
implementation, wake MIMIR with the exact blocker and recommended shape. Do not
invent a broad field-permission system.

## Guardrails

- No new table or migration unless DAEDALUS wakes MIMIR first with the blocker.
- No ingestion payload contract change.
- No raw public payload expansion.
- No public exposure of private/community events, owner-only linked documents,
  unpublished documents, ingestion keys, credentials, prompts, archive text, or
  secret-shaped values.
- No Redis, Cloudflare, provider/model, billing, Project/DexOS, hosted runtime,
  worker, parser/OAuth, public persona, or broad UI lane.
- No heavy visual editor. If UI changes are necessary, keep them to small owner
  copy/readback or config validation.

## Acceptance

- Public/member Developer Space detail responses obey configured public field
  controls.
- Owner detail responses still show raw operational metrics/event/snapshot data.
- Secret-shaped keys stay stripped from public/member responses even if listed
  in the allowlist.
- Existing public behavior is backward compatible when no controls are set, or
  any compatibility change is explicitly documented and reviewed by ARGUS.
- Public observatory and SSE payloads remain consistent.
- Partner docs explain field controls as a visitor-safety/readability layer, not
  as canonical storage, billing, provider, or memory behavior.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If web helper/UI behavior changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

Known local Windows standalone symlink `EPERM` remains acceptable only after the
web build compiles, lints/typechecks, collects page data, and generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- exact field-control shape;
- whether implementation or blocker;
- owner/public/SSE behavior;
- secret-key scrub proof;
- docs/UI changes, if any;
- validation output;
- explicit non-scope confirmation.

If blocked, wake MIMIR instead with the blocker. Do not go idle without a
wakeup handoff.

## DAEDALUS implementation - 2026-06-19

Implemented the small `visualisation_config.publicFieldControls` path without a
schema migration or ingestion-contract change.

Field-control shape:

```json
{
  "publicFieldControls": {
    "nodeMetricKeys": ["uptime", "confidence"],
    "eventDataKeys": ["status", "summary", "phase"],
    "snapshotDataKeys": ["summary", "nodeCount"]
  }
}
```

Behavior:

- owner reads and ingestion responses keep the existing raw owner data path;
- public/member detail reads and SSE updates apply the configured top-level
  allowlists for node metrics, event data, and snapshot data;
- if no allowlist is configured for a family, the existing public-safe secret
  scrubber behavior remains compatible;
- secret-shaped keys are stripped from public/member responses even when they
  appear in an allowlist;
- web visual config normalization preserves the bounded public-field controls
  when an owner saves other visual config, but no visual editor or visible UI
  was added.

Files changed:

- `apps/api/src/services/developer-space.service.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `apps/web/lib/developer-space-visual-config.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `packages/types/src/developer-space.ts`
- `docs/integration/intelhub-to-station-developer-spaces.md`
- `docs/roadmap/PR77_DEVELOPER_SPACE_PUBLIC_FIELD_CONTROLS.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 16 tests passed, including owner raw data, public/member allowlisting, default compatibility, secret scrub despite allowlist, and public detail/SSE parity. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 4 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 42 tests passed because a web helper changed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` | Pass | Shared type build completed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/developer-space-client build` | Pass | Client package build completed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, generated 31 static pages, then hit the known local Windows standalone symlink `EPERM`. Only the pre-existing raw `<img>` warnings appeared. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files and local triad state. |

Non-scope:

- No new table, migration, ingestion payload contract, raw public payload
  expansion, public exposure of private/community events, owner-only linked
  documents, unpublished documents, ingestion keys, credentials, prompts,
  archive text, secret-shaped values, Redis, Cloudflare, provider/model,
  billing, Project/DexOS, hosted runtime, worker, parser/OAuth, public persona,
  broad UI, or heavy visual editor.
