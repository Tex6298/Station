# PR331 - Pilot Packet Route Resolution

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Why This Opens

PR330 accepted the default-filled pilot packet and left one repo-defined prep
check before instructions are sent:

```text
Before instructions are sent, the owner monitor should confirm the default
public document and linked forum routes still resolve on hosted web.
```

MIMIR is not waiting idle on tester identities. ARIADNE should prove the route
set in the default packet is still live on hosted web before any real tester
contact.

## Inputs

Use:

- `docs/roadmap/PR329_SIGNED_IN_PILOT_ENTRY_PACKET_RESULT.md`
- `docs/roadmap/PR330_PILOT_PACKET_DEFAULTS_BOUNDARY_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`

## Hosted Route Set

Base URL:

```text
https://stationweb-production.up.railway.app
```

Default tester-facing routes:

- `/personas/station-replay-alpha-persona`
- `/space/station-replay-alpha`
- `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`

Monitor-only route:

- `/forums/moderation?targetType=persona`

## Task

Run a hosted human-route resolution rehearsal:

- confirm hosted web is reachable;
- confirm the public persona route resolves;
- confirm the public Space route resolves;
- confirm the default public document route resolves;
- confirm the default linked forum discussion route resolves;
- confirm the Space/document UI still exposes the visible route onward where
  applicable;
- confirm `375px` mobile does not make the route path unusable;
- confirm the admin moderation route still resolves for the admin-capable replay
  alias if a safe existing session is available.

If the default document or forum route has moved, do not fail immediately.
Follow the visible hosted Space/document/discussion path and record the current
route that should replace the stale row in the pilot packet.

## Hard Limits

Do not:

- contact testers;
- use real tester accounts;
- send tester instructions;
- submit chat;
- submit reports;
- change moderation status or target state;
- mutate hosted data;
- change code, schemas, config, Railway, Supabase, Stripe, provider/model,
  Redis, Cloudflare, queue, worker, deploy, key, or database-admin state;
- claim public launch, commercial/customer readiness, partner readiness,
  anonymous chat, durable transcripts, visitor identity analytics, or
  product-enforced named-user allowlisting.

## Result Required

Create:

```text
docs/roadmap/PR331_PILOT_PACKET_ROUTE_RESOLUTION_RESULT.md
```

Return one verdict:

```text
PASS
PASS WITH ROUTE UPDATE
FAIL
BLOCKED
```

Wake MIMIR with:

- verdict;
- exact route set to use in the pilot packet;
- whether any PR329 route row needs revision;
- whether the remaining blocker is still only real tester identities and the
  private feedback channel;
- any exact next-owner recommendation.
