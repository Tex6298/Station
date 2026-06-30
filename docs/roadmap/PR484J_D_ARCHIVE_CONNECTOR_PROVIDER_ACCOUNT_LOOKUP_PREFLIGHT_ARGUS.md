# PR484J-D - Archive Connector Provider Account Lookup Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closes PR484J-C as accepted:

`docs/roadmap/PR484J_C_ARCHIVE_CONNECTOR_CREDENTIAL_DECRYPT_BOUNDARY_CLOSEOUT.md`

Source-ready credentials can now be decrypted internally under strict owner,
provider, purpose, status, scope, and secret-material proofs. Source inventory
still should not start with provider source listings. The smallest provider
read is account lookup/proof.

## Decision Requested

ARGUS should hostile-preflight whether DAEDALUS can implement a narrow provider
account lookup boundary.

If accepted, wake DAEDALUS with exact helper/route/test boundaries. If blocked,
wake MIMIR with the concrete blocker and smallest next unblock.

## Questions To Settle

- Whether account lookup is helper-only, an authenticated route, or both.
- Whether it accepts connect-proof credentials, source-ready credentials, or
  source-ready only.
- Provider endpoints allowed:
  - Reddit account proof such as `/api/v1/me`;
  - Discord account proof such as `/users/@me`.
- Provider-client seam shape and timeout/error behavior.
- Safe account metadata fields:
  - provider;
  - owner-only purpose;
  - bounded `accountLabel`;
  - external account fingerprint present/updated;
  - connection scope state;
  - reconnect requirement.
- Whether account lookup may update stored `account_label` and
  `external_account_fingerprint`, or must stay read-only.
- Failure modes for provider auth failure, rate limit, payload shape mismatch,
  missing decrypt config, source-scope mismatch, unsupported provider, and
  storage failure.
- Tests proving no source inventory, import, source body readback, public
  readback, jobs, UI, packages, billing, Redis, Cloudflare, marketplace, or
  social behavior.

## Candidate Implementation Boundary

If accepted, DAEDALUS may add only:

- provider-account client helpers with injected fetch/client seam;
- safe account metadata serializer;
- optional owner-only account lookup route if ARGUS accepts route shape;
- focused tests for owner scoping, redaction, provider errors, and forbidden
  behavior scans.

## Out Of Scope

- source inventory/listing endpoints;
- subreddit, post, comment, guild, channel, message, DM, bot, webhook, or
  source-body reads;
- import creation or archive source writes;
- Memory, Canon, Continuity, public document, review candidate, queue, or
  worker writes;
- hosted proof;
- broad UI;
- Redis, Cloudflare, billing, packages, marketplace, or social behavior.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-C after ARGUS accepted the internal credential decrypt boundary.
- The next smallest provider-read boundary is account lookup/proof, not source inventory.
Task:
- Hostile-preflight PR484J-D Archive Connector Provider Account Lookup.
- Decide helper/route shape, credential eligibility, provider endpoints, safe account metadata, optional metadata update behavior, failure modes, and tests.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest unblock.
```
