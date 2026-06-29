# PR476 - Social Publishing Connector Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_PR476A_OWNER_SOCIAL_PUBLISHING_READINESS`

## Decision

ARGUS accepts the smallest honest first slice as:

```text
PR476A - Owner Social Publishing Readiness
```

This is an owner-only readback/fencing slice. It should make the existing social
publishing surface honest about what Station can safely support today without
live posting, OAuth/token storage, provider API calls, public syndication,
queues/workers, webhooks, billing changes, real provider accounts, or secret
exposure.

It is not a live connector launch.

## Existing Surface Findings

Repo inspection found existing social publishing code that is more live-looking
than the accepted PR476 guardrails allow:

- `/settings/social` renders provider cards for Bluesky, Mastodon, Tumblr,
  LinkedIn, Reddit, WordPress, and Ghost.
- The Settings page asks for app passwords, access tokens, usernames, site
  URLs, and Ghost admin API keys, and it exposes Connect/OAuth/disconnect/save
  controls.
- `apps/api/src/routes/social.ts` contains authenticated connection, OAuth,
  compose, post-history, and teaser-generation routes.
- `apps/api/src/services/social.service.ts` contains direct provider posting
  calls for Bluesky, Mastodon, Tumblr, LinkedIn, WordPress, Ghost, and Reddit.
- `dispatchPost()` can write external post ids/URLs and provider error text
  back into `social_posts`.
- The public document owner page imports `PostComposer` and exposes a
  "Signal Share to socials" entrypoint.
- `infra/supabase/migrations/005_social_publishing.sql` and
  `packages/db/src/types.ts` define `social_connections.access_token` and
  `social_connections.refresh_token` as plain text fields.

These findings do not block a readback-only PR476A. They do block any claim
that Station has accepted live social connectors.

## Boundary Findings

Accepted for PR476A:

- owner-only readiness/readback;
- static supported provider inventory;
- configured/not-configured status by boolean/category only;
- visible disabled state for unavailable connector actions;
- bounded copy that says connector setup is paused until credential and posting
  safety contracts exist;
- no external provider calls.

Blocked beyond PR476A:

- live posting/cross-posting/syndication;
- OAuth initiation, callback token exchange, refresh-token rotation, provider
  account linking, or credential storage;
- storing app passwords, access tokens, refresh tokens, Ghost admin API keys,
  OAuth codes, provider account ids, or webhook payloads;
- background dispatch, retries, queues/workers, scheduling, webhooks, or
  deletion/retraction on external platforms;
- public syndication readback, follower metrics, comments/replies import, or
  moderation sync.

The concrete blocker for live connectors is the absence of an accepted
encrypted external-token storage contract plus an accepted OAuth/callback,
outbound payload sanitizer, and connector execution/retry contract.

## Accepted PR476A Scope

DAEDALUS may implement a narrow readback-only fence:

- Add a small readiness model/helper for supported social targets:
  - platforms: Bluesky, Mastodon, Tumblr, LinkedIn, Reddit, WordPress, Ghost;
  - labels, auth style, and character-limit/readback metadata;
  - no credentials, handles, provider account ids, or URLs derived from user
    input.
- Add an authenticated API readback route such as `GET /social/readiness` that:
  - requires the signed-in owner session;
  - returns provider readiness/status categories only;
  - reports OAuth app env readiness as booleans/status labels only, never env
    values;
  - reports `credentialStorageAccepted: false`, `postingEnabled: false`, and
    `connectionActionsEnabled: false`;
  - does not query `access_token`, `refresh_token`, provider account ids, or
    existing connection rows;
  - does not call `dispatchPost()` or any external provider endpoint.
- Fence existing live social action routes so PR476A cannot accidentally post,
  connect, exchange OAuth codes, store credentials, generate provider-backed
  teasers, or mutate existing social connection metadata from customer-facing
  UI. Preferred behavior is a bounded readback-only error before DB write or
  provider call.
- Replace `/settings/social` with an owner-only readiness/readback page:
  - show supported provider targets and disabled status;
  - remove or disable credential inputs and live Connect/OAuth/disconnect/save
    controls;
  - do not show stored handles, tokens, app passwords, refresh tokens, account
    ids, admin keys, OAuth codes, callback URLs, or external post URLs;
  - keep the page scoped to the existing Settings route without broad Settings
    redesign.
- Fence the document-level social entrypoint:
  - remove or disable the live `PostComposer` flow from public document owner
    pages;
  - do not call `/social/compose` or `/social/generate-teaser`;
  - if copy remains, make it clear that external sharing is a future connector
    readiness area, not an active post action.
- Do not add migrations, new credential tables, OAuth flows, provider SDKs,
  workers, queues, webhooks, billing changes, or real provider-account setup.

If DAEDALUS finds that safely disabling the existing live action routes would
break an explicitly accepted customer commitment, stop and wake MIMIR with that
specific conflict instead of shipping a half-fenced connector surface.

## Required Tests

DAEDALUS should add focused coverage proving:

- signed-out `/social/readiness` is rejected by auth;
- signed-in `/social/readiness` returns supported provider statuses without
  token, refresh token, app password, admin key, OAuth code, account id, env
  value, callback URL, stored handle, external post URL, SQL/table detail, or
  stack trace;
- readiness output contains only boolean/status categories for OAuth app config;
- live action routes fail closed before DB writes or provider calls when the
  connector surface is in readback-only mode;
- `/settings/social` renders disabled/readback copy and no credential inputs or
  active Connect/OAuth/post controls;
- the public document owner route no longer exposes a live social posting
  composer or calls social compose/teaser APIs;
- no provider `fetch()` call, `dispatchPost()`, queue/worker dispatch, webhook
  emission, or billing path is introduced.

Suggested files/tests:

- `apps/api/src/routes/social.ts`
- `apps/api/src/routes/social.test.ts`
- `apps/web/app/settings/social/page.tsx`
- `apps/web/lib/social-publishing-readiness.ts`
- `apps/web/lib/social-publishing-readiness.test.ts`
- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`
- `apps/web/components/social/post-composer.tsx` only if DAEDALUS chooses to
  convert it into a non-mutating paused/readback component rather than removing
  the entrypoint.
- Existing regression commands for `apps/web/lib/publishing-ui.test.ts`,
  `apps/api/src/routes/publishing-approvals.test.ts`, and
  `apps/web/lib/auth-routes.test.ts`.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/social.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/social-publishing-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/publishing-approvals.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a diff-only sensitive/scope scan covering tokens, app passwords, admin
API keys, OAuth codes, refresh tokens, provider account ids, callback URLs,
external post URLs, provider payloads, SQL/table output, stack traces, queues,
workers, webhooks, billing, and live-posting claims.

## ARIADNE Rehearsal Requirement

After DAEDALUS implements PR476A and ARGUS accepts it, MIMIR should route
ARIADNE for hosted read-only proof:

- signed-in `/settings/social` desktop and 390px mobile;
- supported provider readiness cards render;
- credential inputs and Connect/OAuth/disconnect/save/post buttons are absent
  or disabled;
- the document owner page no longer exposes a live social posting composer;
- no real provider account is used;
- no live post, OAuth redirect, token exchange, provider call, queue/worker,
  webhook, billing action, or external URL is created;
- no secrets, env values, tokens, account ids, provider payloads, hosted logs,
  SQL output, stack traces, or private document text are captured.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | PR476 handoff, future lanes, operations delta, dependency crosswalk, Settings social page, social API routes/service, social migration/types, document owner social entrypoint, and current publishing tests inspected. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts` | Pass | 12 tests passed for Station-native publishing helper/readback behavior. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/publishing-approvals.test.ts` | Pass | 5 tests passed for owner-scoped publishing approval behavior. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/auth-routes.test.ts` | Pass | 6 tests passed; `/settings/social` remains protected. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully from turbo cache. |
| `git diff --check` | Pass | No whitespace errors before ARGUS docs edits. |

## Handoff

Wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
```

Task: implement `PR476A - Owner Social Publishing Readiness` exactly as a
readback-only fence. Do not implement live posting, OAuth/token storage,
provider API calls, public syndication, queues/workers, webhooks, billing
changes, real provider accounts, or secret exposure.
