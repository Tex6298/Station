# PR484J-L - Archive Connector Owner UI Flow Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-06-30

Status: PRODUCT_DEFECT_NEEDS_DAEDALUS

## Verdict

ARIADNE does not pass PR484J-L for MIMIR closeout yet.

The hosted persona Archive route is fresh, discoverable, readable on desktop
and 375px/390px mobile, and does not leak secrets or provider/source material.
However, hosted `GET /archive-connectors/credentials` returns a bounded `500`
for the replay owner. Because the owner panel loads readiness and credentials
together, the visible connector card settles into a generic retryable error
instead of the honest disabled config state that readiness already knows:
credential encryption is not configured and the Reddit provider app is missing.

Smallest repair lane:

```text
PR484J-M - Archive connector credential readback fail-closed disabled state
```

## Environment

- Hosted Railway web/API.
- Web/API health checks were ready on commit `35828f8`.
- Replay-owner sign-in and `/auth/me` passed; session values were not printed
  or recorded.
- Route rehearsed: `/studio/personas/[personaId]/files`.
- No screenshots were persisted; ARIADNE used temporary browser DOM/layout
  metrics and removed the local harness afterward.

## Hosted Readiness

| Check | Result | Notes |
| --- | --- | --- |
| Reddit readiness | Blocked | `credential_encryption_required`, OAuth app status `missing`. |
| Discord readiness | Blocked | `credential_encryption_required`, OAuth app status `missing`; no Discord connector UI was exposed. |
| Credential readback | Fail | `GET /archive-connectors/credentials` returned `500 archive_connector_credential_read_failed`. |
| Reddit start sample | Pass with config block | `POST /archive-connectors/oauth/reddit/start` returned setup-required, no state handle, no authorization URL. |

## Human Route Checks

| Check | Result | Notes |
| --- | --- | --- |
| Persona Archive discoverability | Pass | The Reddit saved-items panel rendered inside the owner persona Archive tab. |
| Desktop layout | Pass | No horizontal overflow or detected out-of-viewport visible nodes. |
| 375px mobile layout | Pass | No horizontal overflow or detected out-of-viewport visible nodes. |
| 390px mobile layout | Pass | No horizontal overflow or detected out-of-viewport visible nodes. |
| Saved-items-only generic copy | Pass | Visible connector copy used generic `Reddit saved items`; no source bodies or provider item data appeared. |
| Explicit owner-action gates | Pass with blocker | The panel exposed only `Refresh connector state`; no connect/import action was available while config was blocked. |
| Honest disabled/config state | Fail | The panel showed generic retryable-error copy instead of `Credential storage unavailable` / credential-encryption-required disabled copy. |
| Callback fallback | Pass | Provider-error callback query was scrubbed and showed cancelled/restart copy without raw query values. |
| Final import success honesty | Blocked | Not reachable because hosted connector credential/config prerequisites are blocked. |

## Safety Checks

| Check | Result | Notes |
| --- | --- | --- |
| Visible secret/provider/source leakage | Pass | No OAuth code, state value, authorization URL, token, cookie, provider payload, raw id, username, subreddit, URL, author, source body, fingerprint, SQL detail, stack trace, hosted log, or secret-shaped value was detected. |
| Browser-observed route load mutations | Pass | Loading and inspecting the route triggered no browser-observed `POST`, `PUT`, `PATCH`, or `DELETE`. |
| Scope drift | Pass | No broad Reddit category action, Discord source action, social behavior, billing, Redis, Cloudflare, marketplace, partner adapter, recurring pull, queue/worker, public write, Canon, Continuity, or review-candidate UI appeared in the connector panel. |

## Required Repair

DAEDALUS should make the owner connector panel fail closed into the accepted
readiness-disabled state when hosted credential metadata cannot be read during
known connector setup/config blockers.

Preferred shape:

- keep `/archive-connectors/credentials` bounded and non-leaky;
- if the credentials table or credential metadata is unavailable while
  readiness reports credential encryption/provider setup missing, the owner UI
  should still show the honest disabled config state rather than a generic
  retryable connector error;
- preserve the existing no-connect/no-import action posture until credential
  encryption and provider app config are present.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted web health | Pass | Ready on commit `35828f8`; deployment ids were not recorded. |
| Hosted API health | Pass | Ready on commit `35828f8`; deployment ids were not recorded. |
| Temporary hosted browser rehearsal | Fail | Desktop/375px/390px fit and redaction passed; disabled config copy failed because credential readback returned 500. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for existing markdown files. |

## MIMIR Handoff

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

Task:

- Open the smallest repair lane: `PR484J-M - Archive connector credential
  readback fail-closed disabled state`.
