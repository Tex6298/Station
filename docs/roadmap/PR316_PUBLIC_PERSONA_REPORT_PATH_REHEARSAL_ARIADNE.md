# PR316 - Public Persona Report Path Rehearsal

Owner: ARIADNE

Opened by: MIMIR

Date: 2026-06-25

Status: Open

## Trigger

KVASIR completed ADV-003 as advisory terrain after PR315 passed. MIMIR accepts
the terrain but must keep mainline moving at the active product boundary.

PR315 proved exactly one signed-in non-owner public persona chat interaction and
owner aggregate/readback. It deliberately did not mutate the report path.

PR316 is the next bounded Phase 3 mainline action: prove the existing public
persona report path as a human would use it, without expanding into public
launch, commercial packaging, partner claims, anonymous chat, provider/model
work, Redis, Cloudflare, workers, or new implementation.

## Scope

Hosted/browser evidence only.

Use the current deployed target:

```text
https://stationweb-production.up.railway.app
```

Expected public persona route:

```text
/personas/station-replay-alpha-persona
```

Use current hosted seed truth if the route changes.

Use the signed-in non-owner tester environment aliases already provisioned for
PR315. Do not print, commit, or copy credential values.

## Required Rehearsal

1. Hosted freshness
   - Check web/API `/health` and `/health/deployment`.
   - Record sanitized commit prefixes only.

2. Signed-out boundary
   - Open the public persona route signed out.
   - Confirm public profile/readback remains visible and private Studio,
     Memory, Archive, Continuity, Canon, Integrity, owner setup, provider
     settings, private source bodies, raw ids, credentials, prompts, provider
     payloads, billing identifiers, visitor identity, transcripts, reporter
     identity, and report bodies are not visible.

3. Signed-in non-owner report path
   - Sign in as the non-owner tester.
   - Find and use exactly one enabled public persona report interaction through
     the human-visible path.
   - Use a bland staging-safe reason if a reason is required.
   - If a duplicate/open-report state already exists for this tester and target,
     record the safe duplicate/confirmation state and do not attempt repeated
     mutation.
   - If no human-visible report affordance exists, wake MIMIR with
     `FAIL: product/code defect` and do not call hidden APIs as a substitute.

4. Owner readback
   - Sign in as the replay owner.
   - Open Studio and the matching owner persona.
   - Verify owner-only public interaction readback stays aggregate/status-only.
   - If report aggregate counters or moderation status are visible, record
     sanitized counts/status only.
   - Owner readback must not expose reporter identity, reporter prompt/body,
     raw report body, visitor chat transcript, raw event rows, provider traces,
     raw ids, private source ids, billing identifiers, token transaction rows,
     or credentials.

5. Desktop and mobile
   - Rehearse desktop.
   - Rehearse around `375px` mobile width.
   - Check that public persona report controls and owner readback fit without
     overlap, dead controls, or document-level horizontal overflow.

## Output

Return one of:

```text
PASS
BLOCKED: stale deployment
BLOCKED: tester sign-in failed
BLOCKED: missing public persona route
FAIL: product/code defect
FAIL: privacy/boundary defect
```

Include:

- deployed web/API commit prefixes;
- public persona route used;
- signed-out boundary result;
- signed-in non-owner report result;
- owner readback result;
- desktop/mobile notes;
- privacy verdict;
- exact next wakeup target and reason.

## Wakeup

Wake MIMIR with the result:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE rehearsed the PR316 public persona report path.
Verdict:
- PASS / BLOCKED / FAIL.
Task:
- Close PR316 or route the smallest concrete follow-up.
```
