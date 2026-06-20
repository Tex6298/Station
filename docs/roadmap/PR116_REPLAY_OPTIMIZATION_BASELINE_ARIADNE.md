# PR116 Replay Optimization Baseline - ARIADNE Result

Date: 2026-06-20
Reviewer: A4 / ARIADNE
Status: hosted authorship rerun passed; ready for MIMIR closeout.

## Scope

ARIADNE ran the PR116 hosted staging rehearsal against:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

Replay owner credentials were read from ignored local `.env`. Tokens, cookies,
localStorage values, raw response bodies, private excerpts, prompts,
completions, owner/persona/document/thread/export IDs, provider payloads,
Stripe objects, and screenshots were not committed.

## Passes

- Web `/health`, API `/health`, and API `/health/deployment` returned 200;
  deployment readiness was `ready:true`.
- Replay owner sign-in and `/auth/me` returned 200 as a `canon` non-admin
  account.
- Persona list/detail returned 200 with two personas and continuity metadata
  present.
- Context preview returned 200 with counts `canon:3`, `memory:1`,
  `integrity:1`, `archive:4`, and `continuity:4`.
- Archive retrieval returned 200 in `vector` mode with three returned chunks and
  zero skipped sources.
- Persona chat returned 200 in about 9.8 seconds with a non-empty saved reply
  and provider label present; no prompt or completion text was recorded.
- Global Archive library/search returned 200. Search covered eight source
  groups with zero warnings. The import job list returned seven jobs, one
  failed historical job, and no queued/processing jobs.
- Integrity history returned five completed sessions.
- Persona export list returned five completed packages; export readback had an
  11-key manifest and bundle readback had three files with `sha256` integrity.
- Billing returned 200 with tier `canon`, active subscription status, customer
  present, and nine limit keys. Replay-readiness metadata includes the billing/
  webhook reliability surface.
- Observability summary/traces returned 200 with completed traces and zero
  failed traces.
- Public Space API returned five public documents; the public Space and selected
  public document routes loaded on desktop and mobile.
- Public and owner Developer Space reads returned 200. The public observatory
  had one node, one event, three linked documents, latest snapshot present, and
  SSE `once=1` readable. Owner usage returned counters with warning `ok` and
  provider policy `public_synthetic_only`.
- Desktop and 390px mobile browser passes for landing, Discover, public Space,
  public document, public Developer Space, Studio, persona workspace, Memory,
  Continuity, Archive, Integrity, Export, Developer Space manage, Settings, and
  Billing had no document-level horizontal overflow or visible application
  error.

## Blocker

Route:

- API `GET /forums/categories/documents-and-codexes?sort=active`
- API `GET /forums/categories/general?sort=active`
- Web `/forums`

Account state:

- Anonymous visitor.
- Replay owner signed in through staging API as `canon`.

Steps:

1. Open `/forums` in the hosted web app on desktop or 390px mobile.
2. Or call either public category API route above as anonymous visitor.
3. Repeat the API calls with the replay owner bearer token.

Observed:

- Both public category API routes return HTTP 500 for anonymous and replay
  owner states.
- The sanitized API error is:
  `Could not find the table 'public.community_subcommunities' in the schema cache`.
- Hosted `/forums` visibly renders the same schema-cache error on desktop and
  mobile.
- `/forums/general` falls back to sign-in/protected-category copy instead of a
  public discussion route, because the category preflight is failing.

Expected:

- Public forum categories and at least one public discussion route should load
  for anonymous visitors and the replay owner.
- Internal schema/cache details should not be visible in the hosted UI.

Classification: `blocker`.

Affected viewports: desktop and mobile.

Artifact reference:

- Temporary local Playwright/API probes:
  `tmp-pr116-rehearsal.spec.js`, `tmp-pr116-forum-probe.mjs`, and
  `tmp-pr116-forum-browser.spec.js`.
- These temp files were deleted before commit.

Recommended DAEDALUS patch:

- Restore the staging database/schema path expected by forum category reads, or
  make the forum routes tolerate the missing `community_subcommunities` relation
  without failing public category reads.
- Preserve forum visibility, auth, subcommunity gating, moderation, reporting,
  witness/recognition, and delegated moderation semantics.
- Replace visible raw schema-cache errors with bounded user-facing failure copy
  if a backend dependency is unavailable.

## Defer

- `GET /documents/:id/discussion` returned 200 with `eligible:true` but
  `discussion:null` for the selected public Space document. The public document
  route itself loaded. This is a seed/content caveat, not the PR116 blocker,
  because the public forum category failure already blocks the forum-discussion
  leg.

## DAEDALUS Patch - 2026-06-20

Status: accepted by ARGUS; awaiting ARIADNE hosted rerun after deployment.

Patch:

- `GET /forums/categories` now treats only missing-relation/schema-cache errors
  for `community_subcommunities` as a staging-schema fallback.
- In that fallback, the public category list returns only legacy public category
  slugs `general` and `documents-and-codexes`, with `subcommunity:null`.
- `GET /forums/categories/:slug` and thread creation now pass the category slug
  into the subcommunity lookup guard.
- If `community_subcommunities` is unavailable, only those legacy public
  categories can continue as ordinary public categories; any other category
  returns 404 instead of becoming readable.
- Non-schema subcommunity lookup errors still return 500, preserving fail-closed
  behavior for real permission/storage failures.

Safety:

- No subcommunity-specific route was relaxed.
- No moderation, reporting, witness/recognition, delegated moderation, or
  community-tier rule changed.
- Unknown, private, unlisted, and subcommunity-backed categories are not opened
  by the staging fallback.
- Raw schema-cache details are not returned on the tolerated fallback path.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 18 tests passed, including the new missing-schema fallback regression. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed; document-linked forum discussion boundaries stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed; forum report/moderation target behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## ARGUS Review - 2026-06-20

Accepted.

ARGUS confirmed the fallback is limited to missing
`community_subcommunities` relation/schema-cache errors. Only legacy public
forum slugs `general` and `documents-and-codexes` remain readable when that
relation is unavailable; unknown, private, unlisted, and subcommunity-backed
categories stay closed.

Subcommunity routes, forum visibility, auth, moderation, reporting,
witness/recognition, delegated moderation, and community-tier rules were not
relaxed.

Next: after deployment, ARIADNE should rerun the hosted forum/browser checks
before MIMIR closes PR116.

## Hosted Rerun - 2026-06-20

Status: blocker remains; ready for DAEDALUS.

Deployment:

- API `/health/deployment` returned 200, `ready:true`, and Railway runtime
  commit `772b5fa14ed2`.

What passed:

- `GET /forums/categories` returned 200 with two legacy public categories.
- Unknown category probes returned 404 for both anonymous and replay-owner
  states, so the fallback did not open arbitrary category slugs.
- Hosted `/forums` no longer visibly renders the earlier
  `community_subcommunities` schema-cache error on desktop or 390px mobile.
- Spot checks for landing, Discover, Studio, public Space, public Developer
  Space, and Billing loaded without visible application error or document-level
  horizontal overflow.

Remaining blocker:

- API `GET /forums/categories/general?sort=active` returns HTTP 500 for
  anonymous and replay-owner states.
- API `GET /forums/categories/documents-and-codexes?sort=active` returns HTTP
  500 for anonymous and replay-owner states.
- Sanitized error:
  `column threads.authorship_kind does not exist`.
- Hosted `/forums/general` visibly exposes that schema error on desktop and
  390px mobile.

Expected:

- Legacy public category thread reads should load for anonymous visitors and the
  replay owner, or fail with bounded user-facing copy if a hosted schema column
  is unavailable.
- The UI should not expose raw database column errors.

Classification: `blocker`.

Affected viewports: desktop and mobile.

Artifact reference:

- Temporary local Playwright probe: `tmp-pr116-hosted-rerun.spec.js`.
- The temp file was deleted before commit.

Recommended DAEDALUS patch:

- Apply or compensate for the hosted `threads.authorship_kind` schema mismatch
  on public category thread reads.
- Keep the accepted `community_subcommunities` fallback narrow.
- Do not weaken forum visibility, auth, subcommunity gating, moderation,
  reporting, witness/recognition, delegated moderation, or community-tier
  semantics.
- Keep raw schema/column errors out of visible hosted UI copy.

## DAEDALUS Follow-Up Patch - 2026-06-20

Status: accepted by ARGUS; awaiting ARIADNE hosted rerun after deployment.

Patch:

- Public category thread list reads now retry with a legacy thread select only
  when hosted Supabase reports missing `threads.authorship_*` columns.
- Legacy retry rows are explicitly defaulted to user-authored provenance before
  serialization.
- The retry preserves category, status, visibility, and hidden filters.
- The retry preserves the accepted `community_subcommunities` fallback boundary.
- Non-authorship thread query failures still return 500.

Safety:

- No forum visibility, auth, subcommunity gating, moderation, reporting,
  witness/recognition, delegated moderation, or community-tier rule changed.
- The fallback does not expose raw `authorship_source_id` or
  `authorship_persona_id` fields.
- Raw schema/column details are not returned on the tolerated fallback path.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 19 tests passed, including missing `community_subcommunities` and missing `threads.authorship_kind` hosted-schema fallback regressions. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## ARGUS Review - 2026-06-20, Authorship Fallback

Accepted.

ARGUS confirmed the retry is limited to missing `threads.authorship_*`
column/schema-cache errors. Non-authorship thread query failures still return
500. The legacy retry preserves category, status, visibility, hidden filters,
sort/search behavior, and the accepted `community_subcommunities` fallback
boundary.

Legacy rows default to safe user-authored provenance, and raw
`authorship_source_id` / `authorship_persona_id` stay out of category
responses.

Next: after deployment, ARIADNE should rerun the hosted forum/browser checks
again before MIMIR closes PR116.

## Hosted Authorship Rerun - 2026-06-20

Status: pass; ready for MIMIR closeout.

Deployment:

- API `/health/deployment` returned 200, `ready:true`, and Railway runtime
  commit `edbc01bb25b6`.

API checks:

- `GET /forums/categories` returned 200 with the two legacy public categories:
  `general` and `documents-and-codexes`.
- `GET /forums/categories/general?sort=active` returned 200 for anonymous and
  replay-owner states, with one public thread.
- `GET /forums/categories/documents-and-codexes?sort=active` returned 200 for
  anonymous and replay-owner states, with four public threads.
- Non-legacy category probes stayed closed with 404 for anonymous and
  replay-owner states, covering unknown, private-named, unlisted-named, and
  subcommunity-backed-style slugs.
- The API responses did not expose raw schema-cache or missing-column errors,
  and raw `authorship_source_id` / `authorship_persona_id` fields were not
  present.

Browser checks:

- Hosted `/forums`, `/forums/general`, and `/forums/documents-and-codexes`
  loaded on desktop and 390px mobile for anonymous and replay-owner states.
- No raw `community_subcommunities`, `threads.authorship_*`, schema-cache, or
  missing-column error was visible.
- No visible application error or document-level horizontal overflow appeared
  on the checked forum pages.
- Owner-state spot checks for landing, Discover, Studio, replay public Space,
  replay public Developer Space, and Billing loaded without visible application
  error or document-level horizontal overflow.

Closeout verdict:

- PR116 forum/browser blockers are cleared on the hosted Railway target for the
  accepted replay scope.
- The earlier public document discussion seed/content caveat remains deferred:
  the selected public Space document route loaded, while
  `GET /documents/:id/discussion` returned `eligible:true` with
  `discussion:null`.

## Validation

- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- `npx --yes playwright@1.41.2 install chromium`
- `npx --yes @playwright/test@1.41.2 test tmp-pr116-rehearsal.spec.js --reporter=line --workers=1`
- `node tmp-pr116-forum-probe.mjs`
- `npx --yes @playwright/test@1.41.2 test tmp-pr116-forum-browser.spec.js --reporter=line --workers=1`
- `npx --yes @playwright/test@1.41.2 test tmp-pr116-discover-console.spec.js --reporter=line --workers=1`
- `npx --yes @playwright/test@1.41.2 test tmp-pr116-hosted-rerun.spec.js --reporter=line --workers=1`
- `npx --yes @playwright/test@1.41.2 test tmp-pr116-authorship-rerun.spec.js --reporter=line --workers=1`
- `git diff --check`
