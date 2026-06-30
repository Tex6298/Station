# PR484H - Archive Connector Credential Readback Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-30

Status: Open - decide owner-safe credential readback boundary

## MIMIR Decision

PR484G can now write encrypted archive connector credentials after a bounded
OAuth token exchange. Before Station moves into provider source inventory, the
owner needs a safe readback surface that answers:

```text
Which archive connectors are connected for me?
```

This lane should not fetch provider profiles or source data. It should only
expose safe metadata from the accepted encrypted credential storage readback.

## Candidate Shape

Preferred route:

```text
GET /archive-connectors/credentials
```

Candidate behavior:

- authenticated owner-only route using the existing archive connector Bearer
  auth boundary;
- returns safe credential metadata for the authenticated owner only;
- includes Reddit and Discord provider rows or a provider-indexed list so the
  owner can distinguish connected, missing, and revoked states;
- may reuse `loadArchiveConnectorCredentialReadbacks`;
- never decrypts or returns token material;
- performs no provider calls, profile/account lookup, source inventory,
  import, queue, worker, Redis, Cloudflare, billing, package, broad UI,
  marketplace, or social behavior.

ARGUS should decide whether PR484H is readback-only or whether revocation must
be paired now. MIMIR's preference is readback-only first, then a separate revoke
lane if needed.

## Questions For ARGUS

1. Should the route be `GET /archive-connectors/credentials`,
   `GET /archive-connectors/connections`, or another shape?
2. Should response rows include revoked credentials, active credentials only,
   or per-provider current state with latest revoked history excluded?
3. What safe fields are allowed from the existing credential readback:
   provider, purpose, status, configured, accountLabel, fingerprint-present
   booleans, created/updated/rotated/revoked coarse timestamps?
4. Should exact timestamps be returned, coarsened, or omitted?
5. Should `accountLabel` stay `null` until a later provider-profile lane, even
   if a stored row has a sanitized label?
6. Should missing provider rows be synthesized so UI can render Reddit/Discord
   consistently without separate readiness calls?
7. Should this lane patch readiness to include connected-state truth, or keep
   readiness and credential readback separate?
8. Should revoke remain a later lane?
9. What tests prove owner scoping, token redaction, no raw storage payload, and
   no provider/source behavior?
10. Does ARIADNE hosted proof wait for connector config, or can local/backend
    validation close this readback-only lane?

## Preferred Guardrails

Unless ARGUS patches this, MIMIR prefers:

- readback-only route;
- owner-scoped active credential metadata plus explicit missing rows for
  supported providers;
- no token decrypt;
- no provider account/profile fetch;
- no source inventory/import behavior;
- no web UI in this lane;
- no hosted proof required until config exists and a visible owner connector
  surface is opened.

## Explicit Non-Scope

PR484H must not add or change:

- token exchange, refresh, revocation, credential revoke, credential write, or
  OAuth callback behavior;
- provider profile/account lookup;
- Reddit saved/upvoted/history/listing/comment/message/source reads;
- Discord guild/member/channel/message/bot/webhook/source reads;
- source inventory, recurring pulls, import jobs/writes, archive source writes,
  Memory, Canon, Continuity, public documents, review candidates, queues,
  workers, Redis, Cloudflare, billing/Stripe, provider/model calls, package
  dependencies, broad connector UI, marketplace, or social posting;
- committed real credentials, OAuth codes, access tokens, refresh tokens,
  client secrets, env values, encrypted credential blobs, provider payloads,
  hosted logs, private source bodies, SQL/table details, cookies, prompts,
  signed URLs, storage paths, or secret-shaped values.

## Return Options

Return one:

```text
ACCEPT_PR484H_CREDENTIAL_READBACK
ACCEPT_PR484H_READBACK_AND_REVOKE
PATCH_SCOPE
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_SCHEMA_OR_STORAGE_DECISION
REJECT_DEFER
```

If accepted, specify exact route shape, response fields, revoked/missing row
policy, tests, redaction/source guards, and whether ARIADNE proof is required.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Wakeup

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484H Archive Connector Credential Readback.
Task:
- Implement only the accepted owner-safe credential readback boundary.
- Keep provider calls, source inventory, imports, token exchange, revocation,
  jobs, UI, Redis, Cloudflare, billing, packages, marketplace, and social
  behavior out of scope.
```

If blocked or rejected:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked or rejected PR484H Archive Connector Credential Readback.
Blocker:
- <concrete blocker>
Task:
- Choose the smallest unblock lane or park live archive connectors until config
  is available.
```
