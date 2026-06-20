# PR116 Replay Optimization Baseline - ARIADNE Result

Date: 2026-06-20
Reviewer: A4 / ARIADNE
Status: blocker for DAEDALUS.

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

## Validation

- `npx --yes playwright@1.41.2 install chromium`
- `npx --yes @playwright/test@1.41.2 test tmp-pr116-rehearsal.spec.js --reporter=line --workers=1`
- `node tmp-pr116-forum-probe.mjs`
- `npx --yes @playwright/test@1.41.2 test tmp-pr116-forum-browser.spec.js --reporter=line --workers=1`
- `npx --yes @playwright/test@1.41.2 test tmp-pr116-discover-console.spec.js --reporter=line --workers=1`
- `git diff --check`
