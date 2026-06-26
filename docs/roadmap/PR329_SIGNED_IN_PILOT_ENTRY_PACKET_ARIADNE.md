# PR329 - Signed-In Pilot Entry Packet

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Why This Opens

PR328 classified the pilot boundary as:

```text
PILOT ENTRY READY AFTER MARTY DETAILS
```

The baton is with MIMIR, but real tester entry is still blocked until the pilot
details are named. While those details are pending, ARIADNE can prepare the
human-facing entry packet and monitoring checklist without contacting testers
or mutating the product.

This is directly tied to PR328. It is not unrelated implementation work.

## Inputs

Use:

- `docs/roadmap/PR327_NAMED_SIGNED_IN_PILOT_HOSTED_REHEARSAL_RESULT.md`
- `docs/roadmap/PR328_POST_PR327_PILOT_ENTRY_BOUNDARY_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`

Accepted constraints:

- first pilot is 3-5 trusted named signed-in testers;
- operational invite-only is acceptable only if Station does not claim
  product-enforced named-user allowlisting;
- no DAEDALUS allowlist lane is required unless MIMIR changes that promise;
- real tester entry is blocked until tester names/accounts, allowed actions,
  monitors, route set, start/stop window, and rollback owner are recorded.

## Task

Create a result packet:

```text
docs/roadmap/PR329_SIGNED_IN_PILOT_ENTRY_PACKET_RESULT.md
```

The packet should contain:

- a one-screen pilot readiness checklist MIMIR can fill before tester entry;
- tester instruction copy that says:
  - this is a controlled signed-in pilot, not a public launch;
  - use only the named routes;
  - do not paste private data, credentials, secrets, personal data, or
    third-party confidential material;
  - allowed actions depend on the tester's assigned row;
  - report anything that looks confusing, broken, unsafe, or leaky;
- an allowed-action matrix template for each tester:
  - public persona chat;
  - public persona report;
  - public Space/document/discussion navigation;
  - read-only navigation;
- owner/admin monitoring checklist:
  - public persona chat attempts/successes/failures as aggregate counts;
  - persona report total/active/status counts;
  - admin persona moderation rows for safe target context;
  - rate-limit, quota, provider-unavailable, and public-persona-disabled states;
  - public Space/document/discussion routeability;
- stop/rollback checklist:
  - disable public persona chat;
  - stop sharing route links/instructions;
  - pause tester instructions;
  - wake MIMIR, ARGUS, or DAEDALUS depending on the failure;
- exact safe route set from PR327/PR328, with placeholders only where Marty
  still needs to provide real tester details.

## Hard Limits

Do not:

- contact or invite real testers;
- use real tester accounts;
- run another hosted mutation;
- change code, schemas, config, Railway, Supabase, Stripe, provider/model,
  Redis, Cloudflare, queue, worker, deploy, key, or database-admin state;
- widen scope into anonymous chat, public launch, commercial/customer/partner
  readiness, durable visitor transcripts, or visitor identity analytics;
- claim product-enforced named-user allowlisting.

## Result Required

Return one verdict:

```text
PASS
PASS WITH CAVEATS
BLOCKED
```

Wake MIMIR with:

- the verdict;
- whether the packet is ready for MIMIR to fill with Marty details;
- any exact missing product detail that cannot be represented as a placeholder.
