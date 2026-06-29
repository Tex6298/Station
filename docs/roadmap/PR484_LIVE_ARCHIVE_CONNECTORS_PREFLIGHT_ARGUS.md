# PR484 - Live Archive Connectors Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide smallest safe live external archive connector slice

## MIMIR Decision

After closing PR483A, MIMIR chooses a different named Phase 3/customer-facing
feature:

```text
Live Reddit/Discord OAuth/API intake and recurring pulls
```

Do not deepen workspace export again by inertia.

Manual pasted/uploaded archive intake is protected alpha. The reopened product
gap is live external archive connectors: owner-authorized Reddit/Discord/API
intake that can eventually pull source material into private archive review
without asking users to paste everything manually.

## Current Repo Evidence

Useful existing pieces:

- `prep-lane-audit.md` names live Reddit/Discord OAuth/API intake and
  recurring pulls as future/open.
- Current import/archive flows already support owner-only pasted/uploaded
  intake, fail-closed parser behavior, Import Review Inbox, and extraction to
  candidates.
- PR477A accepted owner-only Document Migrator preview/readback before explicit
  import confirmation.
- PR476A accepted Social Publishing readiness/readback but did not add live
  OAuth, tokens, callbacks, or provider posting.
- Encrypted owner BYOK exists for AI provider keys, but that does not
  automatically authorize external archive connector credentials.

Risk to review:

- Live connector work can accidentally become OAuth credential storage,
  callback handling, recurring workers, background queues, provider API pulls,
  rate-limit policy, Redis/Cloudflare architecture, public leakage, or
  auto-import without owner confirmation.
- A safe first slice must either be genuinely live and bounded, or explicitly
  name the concrete blocker and smallest unblock lane. Do not accept another
  generic paused-readiness card unless it directly removes a blocker.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement a
small PR484A slice that moves live archive connectors forward without
overclaiming.

Return one of:

```text
ACCEPT_PR484A_CONNECTOR_CREDENTIAL_CONTRACT
ACCEPT_PR484A_REDDIT_READONLY_OAUTH_PROOF
ACCEPT_PR484A_DISCORD_READONLY_IMPORT_PROOF
BLOCKED_NEEDS_UNBLOCK_LANE
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_DEFER
```

If accepted, specify exact touched files or acceptable local equivalents,
tests, public/private boundary rules, config assumptions, and whether ARIADNE
must run hosted desktop/mobile rehearsal.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Candidate PR484A Shapes

ARGUS may accept, patch, or reject these candidates.

Preferred if live OAuth/API execution is not yet safe:

1. Connector credential contract:
   - define owner-only connector credential state, provider ids, callback
     expectations, secret redaction, and import permission boundaries;
   - use existing encrypted credential patterns only if ARGUS accepts them for
     external connector credentials;
   - do not perform provider API calls or recurring pulls;
   - must be a real unblock for live Reddit/Discord intake, not merely a paused
     marketing panel.

If existing config and code make a live proof safe:

2. Reddit read-only OAuth/API proof:
   - owner connects or uses configured test credentials for read-only Reddit
     source inventory;
   - read only safe source metadata/counts before owner confirmation;
   - create no archive source/import job before explicit owner confirmation;
   - no recurring pull in this slice.

3. Discord read-only import proof:
   - owner uses a bounded Discord export/API source path for read-only source
     inventory;
   - read only safe source metadata/counts before owner confirmation;
   - create no archive source/import job before explicit owner confirmation;
   - no recurring pull in this slice.

If none are safe, name the direct unblock. Examples: external connector
credential encryption contract, OAuth callback/csrf contract, connector
provider registry, read-only source inventory contract, import confirmation
contract, rate-limit/idempotency contract, or hosted test-credential policy.

## Questions ARGUS Should Answer

1. What current import/archive code can be reused for live connector source
   inventory without creating archive material before owner confirmation?
2. Is there any accepted external connector credential storage pattern, or is
   encrypted AI BYOK insufficient for Reddit/Discord/social credentials?
3. What OAuth callback, csrf/state, token redaction, refresh-token, revocation,
   and audit logging boundaries are required before DAEDALUS touches code?
4. Can the first slice use read-only configured test credentials, or would that
   create an unsafe hidden platform connector?
5. Which provider should come first: Reddit, Discord, or a provider-neutral
   credential/source inventory contract?
6. What must remain hidden: access tokens, refresh tokens, OAuth codes,
   cookies, external account ids, source body text, private messages, archive
   snippets, permalinks where unsafe, provider payloads, SQL/table details,
   stack traces, hosted logs, or secret-shaped values?
7. Which tests must DAEDALUS run if accepted?
8. What would ARIADNE need to prove on hosted desktop and 390px mobile?

## Guardrails

Do not add or claim:

- live write/post actions to Reddit, Discord, social platforms, or any external
  provider;
- recurring pulls, background jobs, workers, queues, scheduled jobs, Redis,
  Cloudflare, runtime provisioning, or production connector reliability;
- automatic import into Memory, Canon, Continuity, public documents, archive
  sources, or import jobs without explicit owner confirmation;
- broad connector marketplace, public connector pages, cross-owner connector
  access, admin impersonation, provider/model calls, billing, Stripe, schema
  changes, migrations, or new external config unless ARGUS accepts the exact
  unblock scope.

Do not expose access tokens, refresh tokens, OAuth codes, cookies, external
account ids, private source bodies, private messages, archive snippets,
provider payloads, hosted logs, SQL/table output, table names, stack traces,
storage paths, signed URLs, prompts, credentials, or secret-shaped values in
docs, tests, UI, API responses, or logs.

## Inputs

- `docs/roadmap/PR483A_WORKSPACE_EXPORT_SCOPE_READBACK_CLOSEOUT.md`
- `docs/roadmap/prep-lane-audit.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/roadmap/PR477A_OWNER_DOCUMENT_MIGRATOR_IMPORT_PREVIEW_CLOSEOUT.md`
- `docs/roadmap/PR476A_OWNER_SOCIAL_PUBLISHING_READINESS_CLOSEOUT.md`
- Current archive/import routes, parser services, import review UI, settings
  credential/provider patterns, and related tests.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR484 Live Archive Connectors preflight.
Verdict:
- ACCEPT_PR484A_CONNECTOR_CREDENTIAL_CONTRACT | ACCEPT_PR484A_REDDIT_READONLY_OAUTH_PROOF | ACCEPT_PR484A_DISCORD_READONLY_IMPORT_PROOF | BLOCKED_NEEDS_UNBLOCK_LANE | BLOCKED_NEEDS_MIMIR_DECISION | REJECT_DEFER
Task:
- Wake DAEDALUS with accepted scope, route the smallest unblock lane, make the product/config decision, or choose another named Phase 3/customer-facing feature.
```
