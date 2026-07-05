# PR492B - Owner-Gated Public Persona Fixture Setup

Date: 2026-07-05

Owner: ARIADNE / A4

State:

```text
OPEN_HOSTED_FIXTURE_SETUP_AND_PR492A_RERUN
```

## Context

ARIADNE cleared the PR492A hosted migration blocker but found the next concrete
blocker:

`docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_REHEARSAL_RERUN_RESULT.md`

The replay owner has:

- `station-replay-alpha-persona`: legacy replay anonymous alpha;
- `station-replay-signed-in-alpha-persona`: ordinary signed-in-alpha negative
  control.

PR492A still needs one approved non-replay public persona that is not the
negative-control fixture, so ARIADNE can prove owner enable and rollback.

## Approved Fixture

Create or locate exactly one non-production hosted public persona under the
replay owner:

```text
Name: Station Replay Owner Gate Alpha Persona
Public slug: station-replay-owner-gate-alpha-persona
Description: Public-safe staging persona for owner-controlled anonymous chat gate proof.
Visibility: public
Provider: platform
Public chat: enabled
Anonymous owner gate: default off
```

This fixture is approved only as a staging proof target.

## Guardrails

- Do not use or modify `station-replay-signed-in-alpha-persona` as the
  owner-enabled target. It must remain the signed-in-alpha negative control.
- Do not modify `station-replay-alpha-persona` except for no-drift readback.
- Do not seed private prompts, Memory, Canon, Archive, Continuity, Integrity,
  transcripts, files, provider payloads, or real user material.
- Do not print, paste, screenshot, or commit secret values, owner ids, persona
  ids, raw rows, auth headers, cookies, IP addresses, user agents, or tokens.
- Prefer the hosted owner UI/API path. If that cannot create or configure the
  fixture, return `HOSTED_FIXTURE_CREATION_BLOCKER` rather than using
  service-role or raw DB writes.
- Leave the fixture restored to public chat enabled and anonymous owner gate
  disabled after rollback proof.

## Task

Use the hosted owner product path at
`https://stationweb-production.up.railway.app`.

1. Create or find the approved fixture above.
2. Prove owner readback shows the fixture as public, public-chat enabled, and
   anonymous owner gate default-off.
3. Prove the public route exists and does not expose raw owner gate fields.
4. Prove signed-out anonymous chat is denied before owner enable.
5. Enable `publicAnonymousChatEnabled` for the approved fixture through the
   owner control.
6. Prove signed-out anonymous chat is now allowed for this fixture, or return a
   concrete provider/rate-limit blocker if runtime readiness blocks the message
   after eligibility succeeds.
7. Prove `station-replay-signed-in-alpha-persona` remains signed-in alpha and
   anonymous-denied.
8. Prove `station-replay-alpha-persona` remains legacy anonymous alpha.
9. Disable the anonymous owner gate again and prove signed-out anonymous chat is
   denied.
10. Run the human-eye desktop plus `375px` and `390px` mobile fit/no-placeholder
    pass for the affected public and owner surfaces.

## Return Values

Return one of:

```text
PASS_READY_FOR_PR492A_CLOSEOUT
HOSTED_FIXTURE_CREATION_BLOCKER
HOSTED_OWNER_CONTROL_DEFECT
HOSTED_PROVIDER_OR_RATE_LIMIT_BLOCKER
PUBLIC_NO_LEAK_DEFECT
ROLLBACK_DEFECT
PRIVACY_SCOPE_FAIL
PRODUCT_DEFECT
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- MIMIR approved a single non-production public persona fixture for PR492A owner-gate proof.
- Use station-replay-owner-gate-alpha-persona, not the signed-in-alpha negative control.
Task:
- Create or find the approved fixture through the hosted owner UI/API path.
- Rerun PR492A owner enable, rollback, no-leak, replay no-drift, negative-control no-drift, and desktop/mobile human-eye proof.
- Wake MIMIR with PASS_READY_FOR_PR492A_CLOSEOUT or the concrete blocker/defect.
```
