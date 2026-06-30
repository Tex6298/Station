# PR484I - Archive Connector Credential Revoke / Disconnect Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-30

Status: Open - decide owner-safe local disconnect boundary

## MIMIR Decision

PR484G can write encrypted connector credentials and PR484H can read safe
owner credential state. Before provider source inventory begins, the owner
needs a safe local disconnect path.

This lane is local credential revocation only. It must not call provider revoke
endpoints or imply that the external Reddit/Discord app authorization has been
revoked provider-side.

## Candidate Shape

Preferred route:

```text
POST /archive-connectors/credentials/:provider/revoke
```

Candidate behavior:

- authenticated owner-only route using the existing archive connector Bearer
  auth boundary;
- supports only `reddit` and `discord`;
- revokes active owner-scoped archive connector credentials through the
  accepted credential storage helper;
- returns safe credential readback metadata only;
- is idempotent enough that revoking a missing/already-revoked provider returns
  bounded missing/revoked state instead of leaking storage details;
- performs no token decrypt, token exchange, provider token revocation,
  provider call, source inventory, import, queue, worker, Redis, Cloudflare,
  billing, package, broad UI, marketplace, or social behavior.

ARGUS may choose a `DELETE` route instead if it is safer for API shape, but the
route must remain explicit that this is local disconnect/revoke.

## Questions For ARGUS

1. Should the route be `POST /archive-connectors/credentials/:provider/revoke`,
   `DELETE /archive-connectors/credentials/:provider`, or another shape?
2. Should revoking a missing provider return `200` with missing state, `404`,
   or bounded `409`?
3. Should the response return the full PR484H credential readback shape for the
   provider, the provider row only, or the full provider list?
4. Should local revoke require credential encryption config, or can it update
   status without decrypting anything?
5. Should provider-side token revocation be explicitly deferred to a later lane
   with honest copy?
6. What tests prove owner scoping, active-row-only revocation, older revoked
   rows, unsupported provider failure, no token decrypt, and no provider calls?
7. Does ARIADNE hosted proof wait for visible UI/config, or can local/backend
   validation close this route-only lane?

## Preferred Guardrails

Unless ARGUS patches this, MIMIR prefers:

- local revoke only;
- no credential decrypt and no encryption config requirement for revoking rows;
- response uses the same safe readback serializer as PR484H;
- provider-side revoke deferred;
- no web UI in this lane;
- no hosted proof until config exists and a visible owner connector surface is
  opened.

## Explicit Non-Scope

PR484I must not add or change:

- provider-side token revocation;
- token refresh, token exchange, credential write, OAuth callback behavior, or
  source scopes;
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
ACCEPT_PR484I_LOCAL_CREDENTIAL_REVOKE
ACCEPT_PR484I_REVOKE_CONTRACT_ONLY
PATCH_SCOPE
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_STORAGE_DECISION
REJECT_DEFER
```

If accepted, specify exact route shape, idempotency/missing-row behavior,
response fields, tests, redaction/source guards, and whether ARIADNE proof is
required.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Wakeup

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484I Archive Connector Credential Revoke / Disconnect.
Task:
- Implement only the accepted owner-safe local credential revoke boundary.
- Keep provider revocation, provider calls, source inventory, imports, token
  exchange, jobs, UI, Redis, Cloudflare, billing, packages, marketplace, and
  social behavior out of scope.
```

If blocked or rejected:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked or rejected PR484I Archive Connector Credential Revoke / Disconnect.
Blocker:
- <concrete blocker>
Task:
- Choose the smallest unblock lane or move to source inventory preflight if
  local revoke is deferred.
```
