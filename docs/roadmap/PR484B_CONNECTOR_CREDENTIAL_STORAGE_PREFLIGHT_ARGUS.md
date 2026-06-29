# PR484B - Connector Credential Storage Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide smallest safe credential storage/callback-state unblock

## MIMIR Decision

PR484A accepted the provider-neutral archive connector credential contract, but
live Reddit/Discord intake is still blocked until Station has an accepted way
to store external connector credentials and OAuth callback state.

MIMIR opens PR484B as a direct unblock for the same Live Archive Connectors
feature:

```text
Encrypted connector credential storage and OAuth state/callback contract
```

Do not add live Reddit/Discord API calls yet.

## Current Repo Evidence

Accepted PR484A truth:

- provider ids are `reddit` and `discord`;
- archive connector purpose is separate from social publishing and AI BYOK;
- future storage requires dedicated encrypted connector credential handling;
- OAuth state must bind owner/session/provider/purpose, use one-time nonce and
  expiry, and redact callback code;
- source inventory and import writes remain future.

Useful adjacent precedent:

- encrypted AI BYOK exists for AI provider credentials, but ARGUS already ruled
  that it is precedent for encryption mechanics only, not an accepted archive
  connector credential store;
- no-write import preview is the accepted model for later source inventory
  readback;
- social publishing readiness stays paused and must not be activated by this
  lane.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement a
small PR484B unblock.

Return one of:

```text
ACCEPT_PR484B_ENCRYPTED_CONNECTOR_CREDENTIAL_STORE
ACCEPT_PR484B_OAUTH_STATE_STORE_ONLY
BLOCKED_NEEDS_CONFIG
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_DEFER
```

If accepted, specify exact touched files or acceptable local equivalents,
tests, env/config assumptions, migration expectations, redaction rules, and
whether ARIADNE hosted proof is required.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Candidate PR484B Shapes

ARGUS may accept, patch, or reject these candidates.

Preferred if schema/storage is safe now:

1. Encrypted connector credential store:
   - add a dedicated owner-scoped archive connector credential table/schema or
     accepted local equivalent;
   - encrypt connector secrets with a connector-specific environment key or an
     ARGUS-accepted reuse of existing encryption infrastructure;
   - store only provider id, owner id, redacted account label, status,
     encrypted token payload, timestamps, and revocation state needed for later
     live OAuth/API proof;
   - expose no route/UI behavior in this slice unless ARGUS explicitly accepts
     it.

Smaller if credential storage is too much:

2. OAuth state store only:
   - add owner/session/provider/purpose-bound one-time state nonce storage with
     expiry and consumption semantics;
   - no provider token storage;
   - no OAuth redirect/callback route behavior;
   - no provider API calls.

If neither is safe, name the direct blocker. Examples: missing connector
encryption key policy, schema decision, migration risk, hosted env requirement,
callback-state storage contract, token rotation/revocation design, or audit
logging contract.

## Questions ARGUS Should Answer

1. Can existing AI BYOK encryption infrastructure be reused safely for archive
   connector secrets, or is a connector-specific env key required?
2. Does PR484B need a DB migration, or can it remain a helper/schema contract?
3. What owner/id/provider/status fields are safe to store and later read back?
4. What fields must never be returned: access tokens, refresh tokens, OAuth
   codes, cookies, credentials, raw external account ids, provider payloads,
   private messages, source bodies, SQL/table details, stack traces, hosted
   logs, or secret-shaped values?
5. Should OAuth state storage be separate from credential storage?
6. Which tests must DAEDALUS run if accepted?
7. Does any accepted PR484B shape require ARIADNE hosted proof, or is it
   API/schema/helper only?
8. What exact config, if any, would Marty need to supply after PR484B?

## Guardrails

Do not add or claim:

- live Reddit API calls, Discord API calls, provider SDK execution, configured
  test-credential execution, source inventory pulls, recurring pulls, or import
  writes;
- OAuth redirects/callback routes unless ARGUS explicitly accepts a route-only
  state proof;
- public connector pages, cross-owner connector access, admin impersonation,
  social posting behavior, provider/model calls, billing/Stripe, Redis,
  Cloudflare, workers, queues, scheduled jobs, runtime provisioning, or broad
  connector marketplace;
- automatic import into Memory, Canon, Continuity, public documents, archive
  sources, import jobs, or import review.

Do not expose access tokens, refresh tokens, OAuth codes, cookies, credentials,
raw external account ids, private source bodies, private messages, archive
snippets, unsafe permalinks, provider payloads, storage paths, signed URLs,
hosted logs, SQL/table output, table names, stack traces, prompts, or
secret-shaped values.

## Inputs

- `docs/roadmap/PR484A_CONNECTOR_CREDENTIAL_CONTRACT_CLOSEOUT.md`
- `docs/roadmap/PR484A_CONNECTOR_CREDENTIAL_CONTRACT_REVIEW_RESULT.md`
- `docs/architecture/live-archive-connector-credential-contract.md`
- `apps/api/src/services/archive-connectors/credential-contract.ts`
- Current AI BYOK encryption/storage code and tests.
- Current Supabase migration/schema conventions.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR484B Connector Credential Storage preflight.
Verdict:
- ACCEPT_PR484B_ENCRYPTED_CONNECTOR_CREDENTIAL_STORE | ACCEPT_PR484B_OAUTH_STATE_STORE_ONLY | BLOCKED_NEEDS_CONFIG | BLOCKED_NEEDS_MIMIR_DECISION | REJECT_DEFER
Task:
- Wake DAEDALUS with accepted scope, route the smallest unblock lane, make the config/product decision, or choose another named Phase 3/customer-facing feature.
```
