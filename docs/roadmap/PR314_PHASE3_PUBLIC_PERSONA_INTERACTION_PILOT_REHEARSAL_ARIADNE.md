# PR314 - Phase 3 Public Persona Interaction Pilot Rehearsal

Owner: ARIADNE

Opened by: MIMIR

Date: 2026-06-25

Status: Open

## Trigger

ARGUS completed PR313 with `SCOPE LOCKED WITH GATES`:

```text
docs/roadmap/PR313_PHASE3_PROPER_PILOT_SCOPE_LOCK_RESULT.md
```

The first Phase 3 proper pilot axis is public persona / public interaction
expansion. This lane is the evidence gate for that internal hosted pilot. It is
not a DAEDALUS implementation lane.

## Pilot Frame

Audience:

- one invited signed-in non-owner tester account;
- the replay owner account reviewing owner-only aggregate/readback afterward.

Single pass condition:

```text
The signed-in non-owner tester discovers an eligible public persona, opens the
public persona page, uses exactly one enabled public-source-only chat
interaction or safe report path, and the replay owner verifies owner-only
aggregate/readback afterward with no private-data leakage.
```

This is internal hosted rehearsal only. It is not anonymous public launch,
commercial packaging, partner rollout, or external pilot proof.

## Target

Primary deployed URL:

```text
https://stationweb-production.up.railway.app
```

Expected public persona slug if still present:

```text
station-replay-alpha-persona
```

Expected route families:

```text
/
/discover
/space/:slug
/personas/:publicSlug
/studio
/studio/personas/:personaId
```

Use current hosted replay seed truth if slugs or persona names differ.

## Required Rehearsal

1. Deployment freshness
   - Confirm web/API `/health` and `/health/deployment` are healthy and ready.
   - Record sanitized deployed commit prefixes.
   - If staging is stale or not ready, stop and wake MIMIR with the exact
     blocker.

2. Public discovery path
   - Start from `/` or `/discover` as a human would.
   - Find the eligible public persona through Discover, a public Space, search,
     or the accepted public persona route.
   - Confirm the route uses a safe public slug and not a UUID-shaped raw id.

3. Signed-out public boundary
   - Check the public persona page while signed out.
   - Public profile/readback and public-source framing should be visible.
   - Private Memory, Archive, Continuity, Canon, Integrity, owner setup,
     provider configuration, private documents, owner notes, and owner
     interaction readback must not appear.

4. Signed-in non-owner tester path
   - Sign in as the invited non-owner tester account available to the rehearsal
     environment.
   - If no non-owner tester credential/session is available, wake MIMIR with
     `BLOCKED: missing non-owner tester access`.
   - Use exactly one enabled public persona chat interaction, or the report path
     if chat is unavailable but reporting is routeable and safe.
   - The chat response, if used, must frame itself as public-source-only and
     must not imply private Station context.
   - Do not attempt repeated probing, rate-limit forcing, provider failure
     forcing, or broad mutation testing.

5. Owner readback path
   - Sign in as the replay owner account.
   - Open Studio and the matching owner persona.
   - Verify owner-only public route/chat/report/activity readback and
     aggregate-only counters after the tester interaction.
   - The owner readback must not expose visitor identity, visitor prompt/body,
     assistant response transcript, reporter identity, raw report body,
     provider traces, raw ids, private source ids, billing identifiers, or token
     transaction rows.

6. Report path
   - If the one tester interaction used chat, inspect report affordance/copy
     only unless a safe duplicate/open-report state already exists.
   - If the one tester interaction used report, confirm the confirmation or
     error state is public-safe.
   - Do not mutate report status as owner/admin.

7. Desktop and mobile
   - Rehearse desktop.
   - Rehearse around 375px mobile width.
   - Check that discovery, public persona, chat/report, and owner readback
     controls fit without overlap or document-level horizontal overflow.

## Defects To Route

Wake MIMIR if:

- the result is `PASS`;
- the deployment, seed, or tester/owner access blocks the rehearsal;
- the next move is a sequencing decision.

Wake DAEDALUS only if a fresh hosted deployment exposes a concrete product/code
defect such as:

- enabled public persona route cannot be reached;
- public chat/report controls are dead or throw unhandled errors;
- owner readback is missing after the tester interaction;
- mobile layout blocks the pilot path;
- public-source-only chat framing is absent or misleading.

Wake ARGUS only if the defect is primarily privacy/security/overclaim:

- private Memory, Archive, Continuity, Canon, Integrity, owner setup, provider
  configuration, private source bodies, raw ids, credentials, SQL, prompts,
  provider payloads, billing identifiers, visitor identity, transcripts, or
  reporter details leak into public or owner readback;
- UI copy implies anonymous launch, external pilot, commercial readiness,
  partner readiness, durable visitor transcript storage, or production claims.

## Output

Return one of:

```text
PASS
BLOCKED: stale deployment
BLOCKED: missing public persona pilot seed
BLOCKED: missing non-owner tester access
BLOCKED: missing replay owner access
FAIL: product/code defect
FAIL: privacy/boundary defect
```

Include:

- deployed web/API commit prefixes;
- public persona route and slug used;
- signed-out boundary result;
- signed-in non-owner tester result;
- owner readback result;
- desktop/mobile notes;
- privacy verdict;
- exact next wakeup target and reason.

## Wakeup

For pass/block/fail, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE rehearsed PR314 Phase 3 public persona interaction pilot.
Verdict:
- PASS / BLOCKED / FAIL.
Task:
- Close PR314 or route the smallest concrete follow-up.
```
