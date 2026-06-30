# PR484J-M - Archive Connector Disabled State Rerun

Owner: ARIADNE / A4

Date: 2026-06-30

Status: Open - hosted human-eye rerun

## Context

ARGUS accepted the PR484J-M repair:

`docs/roadmap/PR484J_M_ARCHIVE_CONNECTOR_CREDENTIAL_READBACK_DISABLED_STATE_REVIEW_RESULT.md`

The repair addresses ARIADNE's hosted PR484J-L defect:

`docs/roadmap/PR484J_L_ARCHIVE_CONNECTOR_OWNER_UI_FLOW_REHEARSAL_RESULT.md`

Original hosted defect:

- readiness correctly reported connector setup blockers;
- `GET /archive-connectors/credentials` returned bounded
  `500 archive_connector_credential_read_failed`;
- the owner persona Archive panel showed generic retryable-error copy instead
  of the honest disabled credential/provider setup state.

Accepted repair:

- readiness and credential readback settle independently;
- readiness setup/config blockers win the visible state when credential readback
  fails;
- disabled setup/config states expose no connect/import actions;
- readiness-healthy credential failures still render bounded retryable copy;
- final-import retry cannot be inherited from stale state after
  readiness/credential refresh failures.

## Rerun Target

Use hosted Railway web/API after app commit `1e15b2e6` or later is deployed.

Primary owner route:

```text
/studio/personas/[personaId]/files
```

Use the same replay owner flow as the PR484J-L rehearsal where possible. Do not
print or persist credentials, tokens, cookies, OAuth codes, OAuth state handles,
provider URLs, provider payloads, raw ids, usernames, source bodies, or
secret-shaped values.

## Required Checks

ARIADNE should rerun only the narrow visible repair boundary:

- hosted freshness is at `1e15b2e6` or later, or record freshness blocker;
- replay-owner auth still works;
- persona Archive connector panel is discoverable;
- desktop layout fits;
- 375px mobile layout fits;
- 390px mobile layout fits;
- when readiness reports credential-encryption/provider setup blockers and
  credentials readback fails, the panel shows honest disabled setup/config copy;
- under that disabled setup/config state, no connect, account lookup, source
  inventory, import intent, activation, preview, staging, import preview, or
  final import action is available;
- safe refresh/retry copy is still bounded;
- saved-items-only generic copy is preserved;
- no OAuth code, state value, authorization URL, token, cookie, provider
  payload, raw id, username, subreddit, URL, author, source body, fingerprint,
  SQL detail, stack trace, hosted log, or secret-shaped value is exposed;
- no scope drift appears into Discord content, broader Reddit categories,
  queues/workers, pagination, recurring pulls, billing, Redis, Cloudflare,
  marketplace, partner adapters, social behavior, public writes, Canon,
  Continuity, or review candidates.

## Output Requested

Write a result doc with:

- route and environment used;
- hosted freshness;
- desktop/mobile verdicts;
- disabled-state verdict;
- any remaining blocker or caveat;
- final recommendation.

If the rerun passes, wake MIMIR with:

```text
PASS_READY_TO_CLOSE
```

If it fails, wake MIMIR with the smallest repair lane.

If hosted freshness is not yet deployed, wake MIMIR with a concrete freshness
blocker and do not widen the product lane.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR484J-M, the narrow repair for the owner connector panel disabled-state defect you found.
- The repair should make readiness setup/config blockers win over credential-readback 500s, showing honest disabled credential/provider setup copy with no connect/import actions.
- ARGUS also patched stale final-import retry exposure from credential/readiness refresh failures.
Task:
- Rerun the hosted persona Archive connector panel on desktop plus 375px and 390px mobile after app commit 1e15b2e6 or later is deployed.
- Verify the disabled setup/config state now appears when readiness is blocked and credential readback fails, with no connect/account/source/import actions available.
- Recheck fit, saved-items-only generic copy, no secret/provider/source leakage, and no scope drift.
- Wake MIMIR with PASS_READY_TO_CLOSE, the smallest repair lane, or a concrete hosted freshness blocker.
```

