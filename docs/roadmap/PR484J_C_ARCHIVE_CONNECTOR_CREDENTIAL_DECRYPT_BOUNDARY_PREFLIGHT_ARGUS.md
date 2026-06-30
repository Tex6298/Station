# PR484J-C - Archive Connector Credential Decrypt Boundary Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closes PR484J-B as accepted:

`docs/roadmap/PR484J_B_ARCHIVE_CONNECTOR_SOURCE_SCOPE_OAUTH_CONSENT_RECONNECT_CLOSEOUT.md`

PR484J-B made source-ready OAuth credentials representable and safely
readable as metadata. Source inventory still cannot proceed because no accepted
internal decrypt boundary exists for provider reads.

## Decision Requested

ARGUS should hostile-preflight whether DAEDALUS can implement a narrow
internal-only archive connector credential decrypt helper.

If accepted, wake DAEDALUS with the exact helper/test boundary. If blocked,
wake MIMIR with the concrete blocker and smallest next unblock.

## Questions To Settle

- Helper name and call shape for loading one active credential by
  owner/provider/purpose.
- Whether the helper requires `scopeProfile: "source_inventory"` and
  `connectionScopeState: "source_scope_ready"` before decrypt.
- Exact returned internal secret shape, and whether it is provider-neutral or
  provider-specific.
- Fail-closed states for missing credential, revoked credential, wrong owner,
  wrong purpose, unsupported provider, missing encryption config, malformed
  encrypted payload, wrong schema/algorithm, decrypt/auth failure, and
  scope-missing credentials.
- Whether decrypted material may include refresh tokens for future provider
  clients, while responses and logs still never include them.
- Test seams for encryption key setup and fake stored credentials.
- Forbidden behavior scan proving no provider API calls, source inventory
  routes, account lookup, import writes, UI, packages, billing, Redis,
  Cloudflare, marketplace, or social behavior.

## Candidate Implementation Boundary

If accepted, DAEDALUS may add only:

- a decrypt/load helper under `apps/api/src/services/archive-connectors`;
- focused tests for successful decrypt and every fail-closed state;
- bounded error codes/messages that do not reveal table names, SQL, owner ids,
  encrypted blobs, tokens, stack traces, provider payloads, or secret-shaped
  values;
- docs/status updates.

## Out Of Scope

- provider source API calls;
- provider clients or SDKs;
- provider account lookup;
- source inventory route;
- source metadata/body readback;
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
- MIMIR closed PR484J-B after ARGUS accepted source-scope OAuth consent/reconnect.
- Source-ready credentials can now be represented locally, but provider reads still need an accepted internal credential decrypt boundary.
Task:
- Hostile-preflight PR484J-C Archive Connector Credential Decrypt Boundary.
- Decide exact helper shape, source-ready guards, internal secret shape, fail-closed states, redaction tests, and forbidden behavior scans.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest unblock.
```
