# PR523C - Hosted Companion-First UI Visibility Reconciliation

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date opened: 2026-07-13

Status:

```text
OPEN_HOSTED_HUMAN_REHEARSAL
```

## Why This Lane Exists

The companion-first persona home is merged, but the product owner cannot see
the requested correction in normal hosted use. That is a product defect until
the real route is visibly reachable and working; a code-presence or
documentation note is not acceptance.

MIMIR has already eliminated deployment staleness as the primary explanation:

```text
Companion merge: 4ba3e489334771623522c0cb1726a4532964146e
Hosted web SHA:  b6e1429e0691b53e8543769ebf26d0d6e94552ef
Hosted API SHA:  b6e1429e0691b53e8543769ebf26d0d6e94552ef
```

Both hosted services therefore identify a commit that contains the companion
merge. The earlier PR523B rehearsal ran a local web worktree against the hosted
API; it did not prove the merged hosted web route from the product owner's
normal entry path.

## Mission

Run a human-eye hosted rehearsal from the real product entry path and classify
the visibility gap as exactly one or more of:

- wrong route or broken route affordance;
- auth/session persistence or redirect failure;
- replay account/persona fixture absence;
- controls hidden by viewport, disclosure, or state;
- stale browser asset/cache behavior despite fresh deployment identity;
- actual rendering, CSS, data-load, or interaction defect.

Do not stop at classification if a safe human-route correction is obvious. If
code is required, give DAEDALUS a concrete defect handoff and wake A2 in the
same result commit. Do not leave the lane asleep between diagnosis and repair.

## Required Human Route

Use the existing replay owner credentials from local environment configuration
without printing them.

1. Open hosted `/studio` in a clean browser context.
2. Sign in through the visible product flow if the session is absent.
3. Confirm the replay persona is visibly available from `/studio`.
4. Open the persona through the visible dashboard/persona control, not by
   starting with a copied deep link.
5. Confirm the resulting route is `/studio/personas/<personaId>` and the
   companion-first shell is visible.

The hosted persona route must visibly expose, in the appropriate responsive
state:

- `Private companion` and the persona name;
- owner-private framing;
- the private conversation surface;
- companion navigation/sidebar;
- Memory, Inbox, Timeline, Profile, and Integrity shortcuts;
- `Advanced Studio` as a secondary disclosure rather than the primary surface;
- return-to-thread controls when a non-empty active thread exists.

## Required Viewports And States

- desktop first viewport;
- mobile `390px` and `375px`;
- signed-out to signed-in transition;
- refresh after successful sign-in to check session persistence;
- `/studio` dashboard to persona route navigation;
- existing replay persona with an active thread if one exists;
- new-chat state;
- Advanced Studio closed and opened;
- Memory Inbox reached through the visible companion navigation.

If a fixture is missing, create or select the smallest existing replay-safe
fixture needed for the rehearsal. Do not turn fixture absence into work for
Marty, and do not use fixture absence to claim the UI is accepted.

## Pass Standard

Pass only if a product owner can enter through hosted `/studio`, reach the
companion home without knowing an internal URL, see the requested
companion-first correction, refresh without unexplained session loss, and use
the expected controls at desktop and mobile widths.

Screenshots or route notes may support the verdict, but they do not substitute
for visible working behavior.

## Block Standard And Handoff

For every defect, record:

- route and viewport;
- starting auth/account state;
- exact visible action;
- expected result;
- actual result;
- console/network evidence when relevant;
- whether the defect is route, session, fixture, responsive visibility,
  rendering, styling, or interaction wiring.

If any defect requires code, create a DAEDALUS-ready repair list and include a
single `WAKEUP A2:` in the result commit. DAEDALUS must then wake ARGUS for
review, and ARGUS must wake ARIADNE for the hosted rerun. If no code defect is
present, wake MIMIR with the exact hosted route/state explanation and evidence
that the product owner can now see the correction.

## Guardrails

- This is a PR523 visibility reconciliation, not a new product expansion.
- Do not broaden into a global reskin or unrelated page cleanup.
- Do not reopen PR524B generated publication work.
- Do not claim success from source inspection, local web rendering, or
  deployment SHA alone.
- Do not expose credentials, bearer tokens, cookies, raw private IDs, or
  private companion content in committed evidence.

## Expected Output

Create:

```text
docs/roadmap/PR523C_HOSTED_COMPANION_FIRST_UI_VISIBILITY_RECONCILIATION_RESULT.md
```

Then wake exactly one next owner:

```text
WAKEUP A2:
Codename: DAEDALUS
```

when code repair is required, or:

```text
WAKEUP A1:
Codename: MIMIR
```

when hosted human-route visibility is proven without a code repair.
