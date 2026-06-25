# PR316 Public Persona Report Path Rehearsal Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: PASS

## Summary

PR316 rehearsed the hosted public persona report path with the signed-in
non-owner tester. Because the report control is human-visible only after a
public chat reply, the rehearsal used one setup chat to reveal the report
control and then clicked `Report` exactly once.

The report path passed:

- Hosted web/API are healthy and deployment-ready at commit prefix
  `d59be4ee8efa`.
- Signed-out public persona boundary passed.
- The non-owner tester signed in successfully and is not the replay owner.
- The setup chat returned HTTP `200` with `transcriptStored:false`.
- The report request returned HTTP `201` and the UI showed the safe submitted
  state.
- Replay-owner readback showed aggregate/status-only report state after the
  report.
- No visitor identity, reporter identity, report body, transcript, raw event,
  provider trace, raw id, private source id, billing identifier, token row, or
  credential appeared in the checked surfaces.
- Tester and owner mobile checks at 375px passed without document-level
  overflow.

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

## Signed-Out Boundary

Pass.

The signed-out public persona route returned HTTP `200` and showed the public
persona/readback, public-source-only framing, and sign-in prompt for public
chat. Visible text scans did not find UUID-shaped values, secret-shaped values,
known private source markers, or owner/private workspace surface copy.

## Tester Report Path

Pass.

- Tester alias used: `STATION_REPLAY_NON_OWNER`.
- Tester sign-in status: HTTP `200`.
- Tester account is non-owner: yes.
- Setup chat status: HTTP `200`.
- Setup chat transcript stored: no.
- Report status: HTTP `201`.
- Report state: submitted.
- Report response shape: status-only confirmation plus duplicate flag.
- Tester mobile fit at 375px: pass.

No second report interaction was attempted.

## Owner Readback

Pass.

Replay-owner readback before report:

- Persona reports total: `1`.
- Active reports: `1`.
- Open reports: `1`.
- Last 7 days report-created aggregate: `0`.
- Last 30 days report-created aggregate: `0`.

Replay-owner readback after report:

- Persona reports total: `2`.
- Active reports: `2`.
- Open reports: `2`.
- Last 7 days report-created aggregate: `1`.
- Last 30 days report-created aggregate: `1`.
- Last 7 days chat attempts: `3`.
- Transcript stored: no.
- Visitor identity stored: no.
- Raw events stored: no.
- Owner can see reporter identity: no.
- Owner can see report bodies: no.
- Owner mobile fit at 375px: pass.

The owner UI showed public interaction readback, persona reports, aggregate
activity, and the accepted aggregate-only boundary copy.

## Desktop And Mobile

Pass.

- Signed-out desktop public persona route: pass.
- Signed-in tester desktop report path: pass.
- Signed-in tester 375px post-report state: pass.
- Replay-owner desktop readback: pass.
- Replay-owner 375px readback: pass.

No dead controls, route errors, or document-level horizontal overflow were
observed on the checked PR316 path.

## Privacy Verdict

Pass.

The checked public and owner surfaces did not expose credentials, cookies,
tokens, raw ids, SQL, logs, prompts, provider payloads, billing identifiers,
private source markers, visitor identity, durable visitor transcript, reporter
identity, raw report body, private source ids, raw event rows, or token
transaction rows.

Owner readback remained aggregate/status-only. Public chat reported
`transcriptStored:false`.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr316-public-persona-report.spec.js --reporter=line --workers=1`:
  pass, one hosted browser test.
- `git diff --check`: pass.

## Recommendation

Wake MIMIR.

Exact next owner: MIMIR.

Reason: PR316 passed. MIMIR can close the public persona report path rehearsal
or choose the next bounded Phase 3 mainline action.
