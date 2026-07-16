# PR528D - Partner Route Hosted Rehearsal

Owner: ARIADNE / A4

Date opened: 2026-07-16

Status: Open for final human-eye rehearsal

```text
OPEN_PR528D_PARTNER_ROUTE_HOSTED_REHEARSAL
```

## Purpose

Run the final human rehearsal of the bounded PR528 partner route set on the
accepted hosted product. This is the human-eye view of Station, not an API
inventory and not another implementation lane.

Bind both Railway services to this exact accepted hosted SHA before judging
the run:

```text
67da511fed5c69471516dd3bc03b4ba4614cab54
```

PR528C9 cleared the Station Guide sign-out blocker and classified the two
dedicated probe accounts' audit history as separate, non-blocking test hygiene.
PR528B13 is queued after this rehearsal so its global session revocation cannot
interrupt ARIADNE's authenticated browser session.

## Rehearsal Character

Use a real browser and judge the routes as a person encountering the product.
Automation may collect screenshots, request failures, geometry, and exact
cleanup evidence, but it does not replace visual inspection of hierarchy,
legibility, copy, affordances, state changes, and route continuity.

Do not ask Marty to click, inspect, or report anything. ARIADNE owns the whole
hosted rehearsal with the tools and protected credentials already available to
the team.

## Exact Matrix

Repeat the selected 11-route matrix in all four cases:

- Light at `1440x900`;
- Dark at `1440x900`;
- Light at `390x844`; and
- Dark at `390x844`.

Expected total:

```text
44 route cases
```

The selected routes are:

1. `/`;
2. `/discover`;
3. the retained public `Continuity Field Notes` Space;
4. its retained published document;
5. `/forums`;
6. the document's one linked Forum thread;
7. `/studio`;
8. the private Aster companion home;
9. Aster's Memory Inbox;
10. Aster's Continuity page; and
11. `/studio/archive`.

Use protected identifiers from the existing encrypted operator packet. Do not
print or commit ids, credentials, private timestamps, Memory text, Archive
text, or other private row bodies.

## Human Route Stories

### Signed-out public chain

Follow the visible route, without typing a guessed search phrase:

```text
/
  -> /discover
  -> Continuity Field Notes
  -> What should a companion keep steady?
  -> What belongs in continuity, and what should be allowed to change?
```

Judge whether a partner can understand:

- what Station is from the public front door;
- that Discover exposes real public work rather than internal proof material;
- that a Space is a bounded public microsite;
- summary, body, provenance, visibility, authorship, and discussion are
  distinct and legible;
- the document-to-thread and thread-to-document relationship is obvious; and
- signed-out contribution is unavailable without making public reading feel
  broken.

Also open `/forums` through the human navigation and confirm category/thread
rows, reply counts, and View affordances are composed correctly rather than
showing the previous overlapping label defect.

### Signed-in private chain

Use the retained private Aster owner through the ordinary product sign-in path:

```text
/studio
  -> Aster companion home
  -> Memory Inbox
  -> Timeline / Continuity
  -> Global Archive
```

Judge whether a partner can understand:

- Studio as a private working home rather than an admin dashboard;
- Aster as the principal companion and continuity surface;
- the companion shortcut strip: Memory Inbox, Timeline, Profile, Integrity;
- return-to-thread choices and composer state where present;
- the difference between active Memory, a pending continuity candidate,
  Timeline/Continuity, and private Archive source material;
- provenance and confidence language without exposing implementation jargon;
- Continuity as its own useful stop, not only runtime-context counts; and
- Archive as private trust infrastructure, with one truthful no-match search
  and clear reset.

Private chat/provider generation remains a separately documented configuration
blocker. Do not make a provider call and do not fail PR528D merely because no
accepted private provider is configured. The visible state must be truthful,
useful, and route the owner toward the existing Settings path without creating
a failed conversation shell.

## Specific Regression Checks

Recheck the three PR528 theme repairs in every applicable matrix case:

- public-document trust heading and explanatory copy;
- Memory Inbox archive-trust explanatory copy; and
- Global Archive `Ask Assistant` action.

For every visible control in the selected route set:

- activate navigation and action controls that are meant to be live;
- verify the expected route or local state change;
- record any inert enabled control as a blocker with route, label, viewport,
  theme, expected behavior, and observed behavior; and
- accept disabled or unavailable controls only when the UI states why.

Check authenticated persistence across normal navigation and one hard refresh.
At the end, use the deployed product sign-out path, confirm protected routes no
longer remain authenticated, and prove the rehearsal's exact fresh session and
refresh token are absent. The pre-existing private-owner session baseline may
remain for queued PR528B13; do not clean it in this lane.

## Write Boundary

Allowed hosted writes:

- one bounded ordinary private-owner sign-in session required for the human
  route;
- the product sign-out that removes that exact session; and
- transient browser preference state required to exercise Light and Dark.

Do not:

- accept, reject, reinforce, quarantine, promote, import, publish, reply,
  report, vote, pin, attach, draft, or export;
- create or edit corpus content;
- invoke a provider;
- trigger a deploy;
- run the legacy protected-read verifier; or
- clean the 258 legacy probe sessions reserved for PR528B13.

The retained public and private corpora must hash/read back exactly before and
after the rehearsal.

## Evidence And Classification

Record:

- exact web/API runtime identities and readiness;
- `44/44` route-case completion or the exact stopped case;
- page exceptions, non-aborted request failures, HTTP failures, horizontal
  overflow, viewport escape, theme mismatch, and unexpected writes;
- human-eye findings with screenshots kept private where they contain owner
  material;
- public and private corpus invariant readback; and
- exact rehearsal-session cleanup.

Classify every finding as:

- `BLOCK_PR528D` when it prevents a credible partner route story, breaks a
  live control, leaks private material, loses auth unexpectedly, or leaves
  unbounded residue;
- `DEFER_PR529` for a concrete non-blocking detail with route, impact,
  evidence, owner, and resume trigger; or
- `NO_ACTION` with a short reason.

## Verdict

Pass only with:

```text
PASS_PR528D_PARTNER_ROUTE_HOSTED_REHEARSAL
```

Otherwise use:

```text
BLOCK_PR528D_<CONCRETE_REASON>
```

## Handoff

Commit a public-safe result and wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the final human-eye PR528 partner route rehearsal on exact accepted hosted SHA 67da511f.
Verdict:
- PASS_PR528D_PARTNER_ROUTE_HOSTED_REHEARSAL
Task:
- Wake DAEDALUS for queued PR528B13 dedicated probe-session hygiene before PR528 closeout.
```
