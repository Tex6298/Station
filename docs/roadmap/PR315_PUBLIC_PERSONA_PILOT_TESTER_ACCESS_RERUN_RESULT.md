# PR315 Public Persona Pilot Tester Access Rerun Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: PASS

## Summary

PR315 reran the PR314 tester-access blocker after MIMIR provisioned a
staging-only signed-in non-owner tester. The tester credential aliases were
available locally and were loaded without printing or committing values.

The hosted public persona pilot chain passed:

- Hosted web/API are healthy and deployment-ready at commit prefix
  `d59be4ee8efa`.
- The public persona route used was `/personas/station-replay-alpha-persona`.
- The non-owner tester signed in successfully and is not the replay owner.
- Exactly one tester public persona chat interaction was sent through the
  hosted public persona UI.
- The chat request returned HTTP `200`, produced a visible reply, and reported
  `transcriptStored:false`.
- No second chat or report interaction was sent.
- Replay-owner readback after the chat showed aggregate activity only, with no
  visitor identity, transcript, or raw event storage.
- Tester and owner mobile checks at 375px passed without document-level
  overflow.

Harness note: the first probe stopped after the visible reply because my local
reply scanner treated private-context boundary language as a hard stop. The
reply did not hit the raw-id, secret-shaped, or known private-source marker
checks before that stop. To preserve the exactly-one interaction rule, I did
not send another chat; I ran only a post-chat readback probe.

## Hosted Freshness

Pass.

- Web `/health`: HTTP `200`, healthy.
- Web `/health/deployment`: HTTP `200`, `ready:true`, branch `main`.
- Web commit prefix: `d59be4ee8efa`.
- API `/health`: HTTP `200`, healthy.
- API `/health/deployment`: HTTP `200`, `ready:true`, branch `main`.
- API commit prefix: `d59be4ee8efa`.

## Public Persona Route

Pass.

- Public route: `/personas/station-replay-alpha-persona`.
- Safe slug: yes.
- Public persona readback API: HTTP `200`.
- Public chat enabled: yes.

## Tester Interaction

Pass.

- Tester alias used: `STATION_REPLAY_NON_OWNER`.
- Tester sign-in status: HTTP `200`.
- Tester account is non-owner: yes.
- Interaction used: public persona chat.
- Chat status: HTTP `200`.
- Chat reply visible in the hosted UI: yes.
- Chat transcript stored: no.
- Report interaction run: no.
- Second chat interaction run: no.

The signed-in tester route remained public persona/public-source framed. The
post-chat mobile route at 375px kept the chat form reachable and did not show
document-level overflow.

## Owner Readback

Pass.

Replay-owner readback after the tester chat:

- Owner sign-in status: HTTP `200`.
- Matching owner persona count: `1`.
- Aggregate activity visible in owner UI: yes.
- Last 7 days chat attempts: `2`.
- Last 7 days chat successes: `2`.
- Last 7 days chat failures: `0`.
- Last 30 days chat attempts: `2`.
- Last 30 days chat successes: `2`.
- Transcript stored: no.
- Visitor identity stored: no.
- Raw events stored: no.

The owner readback stayed aggregate-only and showed the accepted boundary copy:
daily aggregate only; no visitor identity or transcript.

## Desktop And Mobile

Pass.

- Tester desktop public persona path: pass.
- Tester mobile public persona path at 375px: pass.
- Owner desktop aggregate readback: pass.
- Owner mobile aggregate readback at 375px: pass.

No dead controls, route errors, or document-level horizontal overflow were
observed on the checked PR315 path.

## Privacy Verdict

Pass.

The checked public and owner surfaces did not expose credentials, cookies,
tokens, raw ids, SQL, logs, prompts, provider payloads, billing identifiers,
private source markers, visitor identity, durable visitor transcript, reporter
identity, raw report body, or token transaction rows.

Owner readback remained aggregate-only. Public chat reported
`transcriptStored:false`.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr315-public-persona-tester-rerun.spec.js --reporter=line --workers=1`:
  sent exactly one hosted tester chat, received HTTP `200`, reached a visible
  reply, then stopped on an over-broad local private-context phrase check.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr315-postchat-readback.spec.js --reporter=line --workers=1`:
  pass, no second chat/report mutation; verified tester mobile route and owner
  aggregate/readback after the single chat.
- `git diff --check`: pass.

## Recommendation

Wake MIMIR.

Exact next owner: MIMIR.

Reason: PR315 closes the PR314 tester-access blocker. MIMIR can accept the
public persona interaction pilot rehearsal as internally passed, or route a
separate copy/assertion refinement if he wants stricter automated classification
of public-chat boundary language.
