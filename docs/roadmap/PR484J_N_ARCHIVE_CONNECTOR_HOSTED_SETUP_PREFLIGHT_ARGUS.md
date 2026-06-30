# PR484J-N - Archive Connector Hosted Setup Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

PR484J-L/M closed the owner-visible connector flow defect. The UI is now safe
when hosted connector setup is blocked.

The next separate lane is live connector hosted setup: determine the smallest
safe path from the current disabled state to a real owner Reddit OAuth /
source-inventory proof without leaking secrets or widening import scope.

Current hosted blockers observed by ARIADNE:

- credential storage unavailable;
- Reddit provider app missing;
- `GET /archive-connectors/credentials` returns bounded
  `500 archive_connector_credential_read_failed`;
- `POST /archive-connectors/oauth/reddit/start` returns bounded
  `409 archive_connector_provider_app_setup_required`;
- owner UI correctly disables connect/import actions.

## Candidate Config Names To Verify

ARGUS should verify these against code and readiness behavior before waking
DAEDALUS or MIMIR:

- `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`:
  archive connector credential storage key, at least 32 characters;
- `ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID`:
  Reddit archive connector app client id;
- `ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET`:
  Reddit archive connector app client secret;
- `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY`:
  source staging batch encryption key, at least 32 characters, needed before
  private source staging can complete;
- accepted callback path:
  `/archive-connectors/oauth/callback/reddit`.

Do not use or treat the paused social publishing variables
`REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` as archive connector config.

## Decision Requested

ARGUS should decide the smallest safe next lane:

1. If this is config-only, wake MIMIR with the exact Railway/API variables and
   safe operator instructions, without printing secrets.
2. If code or docs must change first, wake DAEDALUS with the smallest repair or
   readback lane.
3. If hosted proof can proceed once config exists, define the ARIADNE proof
   route and required pass/fail checks.

## Preflight Questions

ARGUS should answer:

- Are the four config names above complete for the current Reddit saved-items
  owner flow, or is any additional accepted env/schema state required?
- Does the hosted API need the credential table/migrations checked before config
  is useful?
- Should setup proof stop after readiness/OAuth-start, after callback exchange,
  after source inventory, or after a no-import source preview?
- What is the first proof that should not be attempted without real Reddit app
  credentials?
- What exact callback URL should be registered in Reddit for hosted Railway?
- Should source staging encryption be required before OAuth setup, or only
  before staging/import proof?
- What should DAEDALUS or ARIADNE validate after config is present?

## Scope Guard

This preflight must not add:

- new provider support;
- Discord content reads;
- broader Reddit categories;
- pagination or recurring pulls;
- queues/workers;
- billing, Redis, Cloudflare, marketplace, partner adapters, or social
  behavior;
- public writes, Canon, Continuity, or review candidates;
- new import execution behavior beyond the already accepted Reddit saved-items
  flow.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-M and the PR484J-L visible owner connector defect after ARIADNE passed the hosted rerun.
- The owner persona Archive connector panel now safely shows disabled credential/provider setup copy when hosted connector setup is blocked.
- The remaining blocker is no longer UI; it is live archive connector hosted setup for Reddit saved-items.
Task:
- Hostile-preflight PR484J-N Archive Connector Hosted Setup.
- Verify the exact config/schema/callback requirements for moving from disabled setup state to live Reddit OAuth/source-inventory proof.
- Candidate config names to verify: ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY, ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID, ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET, ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY, and /archive-connectors/oauth/callback/reddit.
- Decide whether this is config-only for MIMIR, a smallest DAEDALUS code/docs lane, or an ARIADNE hosted proof lane after config.
- Keep Discord content, broader Reddit categories, queues/workers, billing, Redis, Cloudflare, marketplace, social behavior, public writes, Canon, Continuity, review candidates, and new import execution behavior out.
```

