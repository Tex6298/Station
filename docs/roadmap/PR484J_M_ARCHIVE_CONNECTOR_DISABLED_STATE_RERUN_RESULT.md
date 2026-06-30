# PR484J-M - Archive Connector Disabled State Rerun Result

Owner: ARIADNE / A4

Date: 2026-06-30

Status: Pass - ready for MIMIR closeout

## Verdict

```text
PASS_READY_TO_CLOSE
```

ARIADNE reran the hosted owner persona Archive connector panel after the
PR484J-M repair reached Railway production. The visible defect found in
PR484J-L is fixed: readiness setup/config blockers now win over the hosted
credential-readback failure and render the honest disabled setup state.

## Environment

- Hosted web health: ready at app commit `1e15b2e6`.
- Hosted API health: ready at app commit `1e15b2e6`.
- Route checked: `/studio/personas/[personaId]/files?connector=reddit`.
- Replay-owner sign-in, `/auth/me`, and persona readback passed.
- Deployment ids, replay credentials, tokens, cookies, OAuth values, and raw
  persona ids were not recorded.

## Hosted Readbacks

Readiness:

- `GET /archive-connectors/readiness` returned `200`.
- Purpose remained `archive_connector`.
- Readback remained owner-only.
- Credential encryption was not configured.
- Reddit readiness was `credential_encryption_required`.
- Reddit OAuth app status was `missing`.
- Discord readiness also remained setup-blocked, but Discord content did not
  appear in the owner panel.

Credentials:

- `GET /archive-connectors/credentials` returned bounded
  `500 archive_connector_credential_read_failed`.
- No authorization URL or OAuth state handle appeared.

Setup sample:

- `POST /archive-connectors/oauth/reddit/start` returned bounded
  `409 archive_connector_provider_app_setup_required`.
- No authorization URL or OAuth state handle appeared.

## Browser Proof

The hosted route was checked with a temporary browser/CDP harness on:

| Viewport | Result | Notes |
| --- | --- | --- |
| Desktop `1440px` | Pass | No horizontal overflow; connector panel rendered disabled setup state. |
| Mobile `375px` | Pass | No horizontal overflow; disabled setup copy fit. |
| Mobile `390px` | Pass | No horizontal overflow; disabled setup copy fit. |

Visible connector-panel state:

- `Credential storage unavailable`
- `Connector credential encryption is not configured.`
- `Ask for archive connector credential storage before connecting Reddit.`
- `No Reddit credential readback`
- `Reddit saved items`
- `Counts only`
- `No final import yet`

Action gating:

- The only visible connector action was `Refresh connector state`.
- No `Connect Reddit`, `Reconnect Reddit`, account confirmation, source
  inventory, import intent, activation, source preview, staging, import
  preview, or final import action was visible.
- The browser made only read-style connector requests for the panel state:
  readiness and credentials. No mutating connector flow request fired from the
  rendered disabled state.

## Privacy And Scope

Passed:

- No OAuth code, state value, authorization URL, token, cookie, provider
  payload, raw id, username, subreddit, URL, author, source body, fingerprint,
  SQL detail, stack trace, hosted log, or secret-shaped value was exposed by
  the connector panel.
- Saved-items-only generic copy was preserved.
- The panel stayed inside the owner persona Archive surface.
- No Discord content, broader Reddit source category, queue/worker, recurring
  pull, billing, Redis, Cloudflare, marketplace, partner adapter, social
  behavior, public write, Canon, Continuity, or review-candidate scope entered
  the connector panel.

## Caveat

Hosted credential storage/provider setup is still intentionally unavailable in
this environment. That is the expected setup-blocked condition for this rerun;
PR484J-M only repairs the owner-visible disabled state when that blocked
readiness truth and a credential-readback 500 happen together.

## Recommendation

MIMIR can close PR484J-M / the PR484J-L visible owner connector defect as
`PASS_READY_TO_CLOSE`, then choose the next lane without widening this repair.
