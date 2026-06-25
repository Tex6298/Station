# PR314 Phase 3 Public Persona Interaction Pilot Rehearsal Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: BLOCKED: missing non-owner tester access

## Summary

PR314 could not complete the required internal pilot chain because the
rehearsal environment does not currently expose an invited signed-in non-owner
tester credential/session. The lane explicitly requires blocking on this
condition rather than creating new data or using the replay owner as the tester.

Useful hosted evidence before the blocker:

- Hosted web/API are healthy and deployment-ready at commit prefix
  `d59be4ee8efa`.
- The expected public persona route exists at
  `/personas/station-replay-alpha-persona`.
- The public persona slug is safe and not UUID-shaped.
- Signed-out desktop and 375px mobile public persona boundary checks passed.
- Public chat is enabled for the seed persona.
- Replay-owner auth and owner-only public interaction aggregate/readback
  baseline passed.

The required signed-in non-owner tester chat/report interaction was not run.
No public chat, report, checkout, portal, billing, owner readback mutation,
admin moderation mutation, provider forcing, rate-limit forcing, or broad
mutation test was performed.

## Hosted Freshness

Pass.

- Web `/health`: HTTP `200`, healthy.
- Web `/health/deployment`: HTTP `200`, `ready:true`, branch `main`.
- Web commit prefix: `d59be4ee8efa`.
- API `/health`: HTTP `200`, healthy.
- API `/health/deployment`: HTTP `200`, `ready:true`, branch `main`.
- API commit prefix: `d59be4ee8efa`.

## Public Persona Seed

Pass.

- Public route: `/personas/station-replay-alpha-persona`.
- Safe slug: yes.
- UUID-shaped slug: no.
- Public readback API: HTTP `200`.
- Visitor-safe context preview API: HTTP `200`.
- Public chat enabled: yes.
- Public preview counts:
  - public profile: `1`
  - published documents: `0`
  - public discussions: `0`
  - public Salon threads: `1`
- Private buckets excluded from preview: `7`.

## Signed-Out Boundary

Pass.

Checked routes:

- Discover.
- Public replay Space.
- Public persona page on desktop.
- Public persona page at 375px mobile width.

Signed-out checks confirmed public persona/readback, public-source-only framing,
and the sign-in prompt for public chat. No document-level mobile overflow was
detected.

Visible text scans did not find UUID-shaped values, secret-shaped values, known
private source markers, or owner/private workspace surface copy.

## Signed-In Non-Owner Tester

Blocked.

The rehearsal checked `8` plausible non-owner tester/visitor credential keys in
the process environment. Present key count: `0`.

Because no invited signed-in non-owner tester credential/session was available,
the rehearsal did not run the one required public persona chat/report
interaction.

## Owner Readback Baseline

Partial pass before blocker.

The replay owner could sign in, the matching owner persona was found exactly
once, and owner-only public interaction readback was visible.

Owner readback baseline:

- Public route can open: yes.
- Public chat enabled: yes.
- Transcript stored: no.
- Visitor identity stored: no.
- Raw events stored: no.
- Aggregate windows present: `last7Days`, `last30Days`.
- Owner UI showed aggregate-only copy: daily aggregate only, no visitor identity
  or transcript.

This does not satisfy the full PR314 owner-readback requirement because no new
non-owner tester interaction could be performed first.

## Desktop And Mobile

Partial pass before blocker.

- Signed-out desktop discovery/public persona route: pass.
- Signed-out 375px public persona route: pass.
- Owner desktop aggregate readback baseline: pass.
- Signed-in non-owner tester desktop/mobile chat/report path: not run because
  tester access is missing.

## Privacy Verdict

Partial pass before blocker.

No private Memory, Archive, Continuity, Canon, Integrity, owner setup,
provider configuration, private source bodies, raw ids, credentials, prompts,
provider payloads, billing identifiers, visitor identity, transcripts, or
reporter details were observed in the checked public or owner readback surfaces.

The full privacy verdict for the tester interaction remains blocked until an
invited non-owner tester account/session is available.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr314-public-persona-blocker.spec.js --reporter=line --workers=1`:
  pass, one hosted browser blocker-evidence test.
- `git diff --check`: pass.

## Recommendation

Wake MIMIR.

Exact next owner: MIMIR.

Reason: PR314 cannot complete without an invited signed-in non-owner tester
credential/session. MIMIR should either provide/route that test access and
reopen a narrow ARIADNE rerun, or block the Phase 3 public persona interaction
pilot until the access condition is intentionally satisfied.
