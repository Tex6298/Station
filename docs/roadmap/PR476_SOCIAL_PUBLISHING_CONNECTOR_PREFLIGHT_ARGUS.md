# PR476 - Social Publishing Connector Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - wake ARGUS

## Why This Lane

PR475 is closed. The next feature-expansion choice should move to a named
Phase 3/customer-facing capability, not another extension of Live Events /
Seminars.

Social Publishing / External Connectors is already visible in product surfaces
and future-lane notes:

- Settings names social publishing as a customer-facing account area.
- Future lanes still list live OAuth/API connectors as future/open.
- The repo contains social publishing UI and provider service code that needs a
  hostile boundary check before Station builds more on top of it.

The useful next question is:

```text
Can Station open a first honest social-publishing connector slice without live
posting, OAuth/token storage, provider API calls, or secret exposure?
```

## Preflight Task

ARGUS should hostile-review the current repo and return one of:

```text
ACCEPT_PR476A_OWNER_SOCIAL_PUBLISHING_READINESS
ACCEPT_PR476A_OUTBOUND_PACKAGE_PREVIEW
BLOCKED_CONFIG_UNBLOCK_FIRST
REJECT_DEFER
NEEDS_MIMIR_DECISION
```

If accepted, name the smallest PR476A implementation shape and wake DAEDALUS.

Preferred first slices, in order:

1. Owner-only Social Publishing readiness/readback:
   - show supported provider targets;
   - show configured/not configured status without revealing secrets;
   - make unavailable provider actions visibly disabled;
   - no external calls.
2. Outbound package preview:
   - let an owner inspect what Station would send for one public document or
     published item;
   - keep it as local preview/readback only;
   - no OAuth, token storage, provider call, or live posting.
3. If a specific provider is already safely wired with test-only config, ARGUS
   may propose a narrower provider-specific readiness proof, but only if it
   still avoids live posting and raw credential storage.

If blocked, name the exact blocker and the smallest numbered unblock lane that
directly enables this feature. Examples: encrypted external-token storage
contract, OAuth callback/callback-url contract, provider config inventory, or
outbound payload sanitizer.

## Questions ARGUS Should Answer

1. What social publishing surfaces already exist in web/API code?
2. Are any existing controls currently live-looking while actually unsafe,
   unwired, or dependent on missing config?
3. Do any existing services make provider API calls that need to be hidden,
   disabled, or fenced before customer-facing expansion?
4. Is there already owner-scoped encrypted credential storage suitable for
   external social providers, or is token storage a concrete blocker?
5. Can PR476A be implemented as readback/preview only, or does even that require
   schema/API cleanup?
6. What exact files/tests should DAEDALUS touch if accepted?
7. What ARIADNE human rehearsal would prove the first slice from a signed-in
   owner point of view without requiring real provider accounts?

## Guardrails

Do not add or claim:

- live posting, syndication, cross-posting, scheduling, retries, queue/worker
  dispatch, webhook delivery, or background jobs;
- OAuth authorization flows, OAuth callbacks, token exchange, credential
  storage, refresh-token rotation, provider account linking, or provider
  dashboard setup;
- provider API calls to Bluesky, Mastodon, Tumblr, LinkedIn, Reddit,
  WordPress, Ghost, X/Twitter, Substack, or any other external platform;
- public syndication readback, follower/engagement metrics, comments/replies
  import, deletion/retraction on external platforms, or moderation sync;
- billing/entitlement changes, provider/model policy changes, Redis,
  Cloudflare, broad Settings redesign, or broad publishing architecture.

Do not print or persist secrets, access tokens, app passwords, admin API keys,
provider account ids, OAuth codes, refresh tokens, webhook payloads, hosted
logs, SQL output, or external post URLs in docs, tests, or UI.

Do not use real Marty/provider accounts or make live public posts.

## Inputs

- `docs/roadmap/PR475_LIVE_EVENTS_SEMINARS_ATTENDANCE_INTEREST_CLOSEOUT.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/roadmap/PRODUCTION_OPERATIONS_READINESS_DELTA_RESULT.md`
- `docs/roadmap/DEPENDENCIES_UPSTREAM_CARRYOVER_CROSSWALK.md`
- `apps/web/app/settings/social/page.tsx`
- `apps/api/src/services/social.service.ts`
- Current Studio publishing UI/API tests.

## Wakeup Templates

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR476 Social Publishing Connector preflight.
- The accepted slice is readback/preview only and avoids live provider calls.
Task:
- Implement the exact PR476A slice ARGUS names.
Guardrails:
- No live posting, OAuth/token storage, provider API calls, syndication, queues/workers, webhooks, billing changes, real accounts, or secret exposure.
```

If blocked or decision-dependent:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR476 Social Publishing Connector preflight.
Verdict:
- BLOCKED_CONFIG_UNBLOCK_FIRST | REJECT_DEFER | NEEDS_MIMIR_DECISION
Task:
- Choose the smallest numbered unblock lane or pick a different named Phase 3/customer-facing feature.
```
