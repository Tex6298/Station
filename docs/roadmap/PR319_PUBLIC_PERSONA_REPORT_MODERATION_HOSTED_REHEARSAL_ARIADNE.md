# PR319 - Public Persona Report Moderation Hosted Rehearsal

Owner: ARIADNE

Opened by: MIMIR

Date: 2026-06-25

Status: Open

## Trigger

ARGUS accepted PR318 with:

```text
PASS WITH HOSTED REHEARSAL RECOMMENDED
```

PR318 hardened the public persona report moderation pointer and admin readback
path. The next step is hosted/browser evidence for the human moderation route.

## Scope

Hosted/browser rehearsal only. Do not implement or mutate moderation status.

Target route:

```text
/forums/moderation?targetType=persona
```

Hosted freshness must show PR318 commit `935664be` or later. If the deployed
web/API build is stale, stop and wake MIMIR with `BLOCKED: stale deployment`.

## Required Rehearsal

1. Hosted freshness
   - Check web/API `/health` and `/health/deployment`.
   - Record sanitized commit prefixes.
   - Confirm the deployed code includes PR318 commit `935664be` or later.

2. Admin moderation route
   - Sign in with the available admin-capable replay account/session.
   - Open `/forums/moderation?targetType=persona`.
   - Confirm the human moderation console loads a persona-filtered report view.
   - Confirm the view uses the existing authenticated admin data route without
     exposing the raw `/reports` API as the human destination.

3. Persona report row safety
   - Confirm at least one persona report row or safe empty/blocked state.
   - If a persona report row is visible, verify it shows safe target context,
     public route/name/status, and status controls as intended.
   - The row must not show raw persona ids, reporter ids, report ids, visitor
     ids, private source ids, transcripts, provider traces, billing identifiers,
     credentials, SQL, or raw report bodies.
   - Persona report target actions must remain unavailable unless a separate
     moderation action lane opens.

4. Non-admin boundary
   - With the signed-in non-owner tester or another ordinary account, confirm
     `/forums/moderation?targetType=persona` is not accessible as an admin queue.
   - If a true non-admin owner of the replay persona is not available, record
     that limitation and rely on PR318 local tests for non-admin owner pointer
     hiding. Do not create new owner accounts.

5. Owner readback
   - Open the replay owner persona readback.
   - Confirm owner readback remains aggregate/status-only and does not expose
     reporter identity, report bodies, visitor transcript, raw event rows,
     provider traces, raw ids, private source ids, billing identifiers, token
     rows, or credentials.

6. Desktop and mobile
   - Rehearse desktop.
   - Rehearse around `375px` mobile width.
   - Check the moderation route and owner readback for fit, no dead controls,
     and no document-level horizontal overflow.

## Output

Return one of:

```text
PASS
BLOCKED: stale deployment
BLOCKED: missing admin access
BLOCKED: missing persona report seed
FAIL: product/code defect
FAIL: privacy/boundary defect
```

Include:

- deployed web/API commit prefixes;
- admin route result;
- persona report row safety result;
- non-admin boundary result;
- owner readback result;
- desktop/mobile notes;
- privacy verdict;
- exact next wakeup target and reason.

## Wakeup

Wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE rehearsed PR319 public persona report moderation hosted path.
Verdict:
- PASS / BLOCKED / FAIL.
Task:
- Close PR319 or route the smallest concrete follow-up.
```
