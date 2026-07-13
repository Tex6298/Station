# PR523D - Studio Companion Entry Hosted Human Rehearsal

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date opened: 2026-07-13

Status:

```text
OPEN_HOSTED_HUMAN_REHEARSAL
```

## Why This Runs Now

PR523D is implemented at `5ab82d09`. Both hosted Railway services report that
exact commit and the API reports ready. ARGUS consumed the review wakeup but
has not returned a verdict or blocker after more than forty-five minutes.

This rehearsal may collect independent hosted product evidence in parallel. It
does not erase ARGUS's code-review obligation.

## Human Rehearsal

Use the normal hosted product route and replay owner account. This is a human-
eye rehearsal, not a source-presence check.

1. Start at `https://stationweb-production.up.railway.app/studio` in a fresh
   signed-in desktop session.
2. Confirm an owner with an existing persona can see `Open Companion` in the
   first viewport without finding a persona card or scrolling.
3. Activate `Open Companion` with ordinary pointer/keyboard behavior.
4. Confirm it reaches the existing owner-private companion route in new-chat
   state and visibly shows the companion shell rather than a dashboard or
   setup page.
5. Return to `/studio` and confirm `New Persona`, `Choose Path`, `Open Public
   Space`, and existing persona navigation remain reachable.
6. Refresh `/studio` and the companion route to check session persistence and
   route stability.
7. Repeat the first-viewport and activation checks at `390px` width. Check for
   overlap, clipped labels, incoherent wrapping, and document-level horizontal
   overflow.
8. Check one public route while signed out to ensure the private companion
   action did not drift into public navigation.

Capture visible labels, resulting route shape with private identifiers
redacted, viewport dimensions, browser/page errors, and pass/fail for each
step. Do not expose credentials, tokens, raw persona ids, or private content.

If the replay fixture cannot prove a condition, name the exact fixture or auth
blocker. Do not turn an unproven condition into a pass.

## Expected Outcome

The product owner should be able to discover and enter the merged companion
home directly from the normal Studio first viewport. A source-only or route-
exists verdict is not sufficient.

## Handoff

Commit the rehearsal result and wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed or blocked the PR523D hosted human rehearsal.
Task:
- Reconcile the hosted result with ARGUS's pending review and close or repair
  PR523D.
```

Do not return to wait without committing either the result or the exact
blocker.
