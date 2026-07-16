# PR528D - Partner Route Hosted Rehearsal ARIADNE Result

Owner: ARIADNE / A4 -> MIMIR / A1

Date completed: 2026-07-16

Status: complete - pass

## Verdict

```text
PASS_PR528D_PARTNER_ROUTE_HOSTED_REHEARSAL
```

The final partner route rehearsal passed on the exact accepted hosted source.
The public chain reads as a coherent public Station experience, and the private
Aster chain reads as an owner-only continuity workspace rather than an admin
dashboard. No finding prevents the bounded partner review.

## Deployment Gate

Both Railway services reported ready on branch `main` at the exact accepted
SHA:

```text
67da511fed5c69471516dd3bc03b4ba4614cab54
```

The web and API deployment identities matched. Migration readiness remained at
the accepted `025-086` range with all expected migration proofs present.

## Rehearsal Matrix

ARIADNE inspected all 11 selected routes in Light and Dark at `1440x900` and
`390x844`:

```text
44/44 route cases complete
```

| Check | Result |
| --- | --- |
| Public route cases | `24/24` |
| Private route cases | `20/20` |
| Page exceptions | `0` |
| Console errors | `0` |
| Non-aborted request failures | `0` |
| HTTP failures | `0` |
| Unexpected writes | `0` |
| Horizontal-overflow cases | `0` |
| Viewport escapes | `0` |
| Control overlaps | `0` |
| Theme mismatches | `0` |
| Checked text-contrast samples | `16/16` at or above `4.5:1`; minimum `5.03:1` |

Deliberate Next.js full-page transitions cancelled 76 superseded RSC requests.
Each cancellation was paired with `net::ERR_ABORTED`, no HTTP failure, and no
page exception. This remains the established `NO_ACTION` navigation-cancellation
classification.

## Human-Eye Route Result

### Public chain

The signed-out route from the public home through Discover, Continuity Field
Notes, its published document, and the linked Forum discussion is visible and
understandable without a guessed search phrase. The Space reads as an
independent public microsite. Document summary, body, authorship, provenance,
visibility, and discussion are distinct, while signed-out contribution remains
truthfully unavailable.

The Forum category and thread rows are composed correctly at both viewports.
The thread row itself is the open affordance; no overlapping legacy `View`
label remains. The document-to-thread and thread-to-document relationship is
clear in both themes.

### Private chain

Studio establishes a private working home with clear companion, Memory,
Integrity, Archive, and public-Space destinations. Aster's home, Memory Inbox,
Continuity page, and Global Archive remain visibly owner-only and preserve the
distinction between pending candidates, durable continuity, active Memory, and
private source material.

The three repaired theme paths pass in every applicable case:

- public-document trust heading and explanatory copy;
- Memory Inbox archive-trust copy; and
- Global Archive `Ask Assistant` action.

The no-match Archive search and reset were truthful in all four cases. Normal
authenticated navigation and one hard refresh retained the session.

Private provider generation was not invoked. The empty Companion surface
remained useful and did not create a failed conversation shell; Settings stayed
reachable through the persistent Studio navigation and the mobile `Navigate`
menu. The lack of proactive, contextual provider-readiness guidance before a
send is a concrete `DEFER_PR529` detail, not a PR528D blocker, because this lane
explicitly excluded provider calls and the separately recorded configuration
blocker remains truthful.

## Finding Classification

### `DEFER_PR529`

Four observed details are now retained in the paused PR529 ledger:

- the Companion's provider-setup guidance is contextual only after a blocked
  send rather than visible proactively on the empty state;
- `/login` shows Email and Password labels without programmatic input
  association;
- Memory Inbox candidate title and body editors lack accessible names; and
- the Global Archive sort control lacks a programmatic label.

These controls remained visually legible and caused no route, geometry,
privacy, or persistence failure in the bounded rehearsal.

### `NO_ACTION`

- The public Space's independent dark editorial theme is intentional and
  legible in both global appearance modes.
- Mobile pages continue below the fixed screenshot viewport without horizontal
  escape or incoherent overlap.
- Signed-out Forum reading remains complete while contribution stays gated.
- Station Assistant remains an operational destination rather than a persona.
- No candidate, Integrity, Archive, publishing, community, or provider mutation
  was performed to manufacture coverage.

## Session And Data Restoration

The rehearsal used one fresh ordinary product sign-in. It then signed out
through the deployed account menu and proved all of the following:

- browser auth storage was cleared;
- the old access token was rejected;
- the exact fresh Auth session was absent;
- the exact fresh refresh token was absent;
- the pre-existing private-owner session baseline was restored exactly; and
- a protected Studio route returned to the login boundary.

The retained public and private product corpora hashed exactly before and after
the run. Public engagement residue, private conversations, provider traces,
token transactions, and forbidden private rows remained zero. No provider was
called and no retained corpus row was mutated.

Screenshots contained owner material and remained private OS-temp evidence.
No credential, token, protected identifier, private row body, private
timestamp, or screenshot is committed.

## Validation

| Check | Result |
| --- | --- |
| Hosted web/API readiness and exact SHA | Pass |
| Human-eye Light/Dark desktop/mobile matrix | `44/44` |
| Public/private corpus exact readback | Pass |
| Product-path sign-out and exact fresh-session cleanup | Pass |
| Provider calls and unexpected writes | `0` |
| `git diff --check` | Required before commit |
| `pnpm typecheck` | Not required; documentation-only changes touch no import or script |

## Handoff

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
