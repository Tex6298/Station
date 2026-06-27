# UX-09A Mobile Public Document Discussion Recheck

Owner: ARIADNE
Reviewer: MIMIR
Status: OPEN - WAKE ARIADNE
Opened: 2026-06-27

## Why This Exists

DAEDALUS completed UX-09A as a no-code source finding:
`docs/roadmap/UX09A_MOBILE_DOCUMENT_DISCUSSION_RESULT.md`.

Source inspection says the public document route already exposes:

- a primary `Open linked discussion` action near the document title;
- a second Discussion card above the body;
- fallback discussion data from `discussion_thread_id` while the discussion
  endpoint resolves;
- mobile CSS that does not hide the shared button/action.

The remaining question is not technical implementation. It is human-eye proof:
does the hosted mobile route now make the linked discussion visible and
reachable for a known public document with an attached discussion?

## Target

Use hosted Railway staging:

```text
https://stationweb-production.up.railway.app
```

Use anonymous public browsing unless the route unexpectedly requires sign-in.

Find the document through visible UI rather than recording raw identifiers:

1. Open `/writing` on a mobile viewport, preferably `390x844` or `375x844`.
2. Search for `Station Replay Alpha Note` if needed.
3. Open the visible public document card.
4. On the public document route, confirm whether `Open linked discussion` is
   visible before the document body.
5. Follow `Open linked discussion`.
6. Confirm the forum discussion route loads safely.

Fallback path if `/writing` does not expose the card quickly:

1. Open `/space/station-replay-alpha` on mobile.
2. Open the visible `Station Replay Alpha Note` public document.
3. Repeat the `Open linked discussion` visibility/reachability check.

## Boundaries

Do not sign in unless the public route unexpectedly blocks anonymous browsing.

Do not create, edit, publish, retract, delete, report, moderate, upload, import,
comment, reply, vote, generate keys, send Assistant messages, change visibility,
or trigger billing flows.

Do not record credential values, cookies, bearer tokens, private payloads,
provider payloads, raw owner identifiers, hosted logs, SQL output, or private
source bodies.

Screenshots are allowed only if they do not contain private data or credential
material. Do not commit screenshots.

## Pass / Caveat / Fail

`PASS`

- Mobile `/writing` or public Space exposes the public document.
- Public document shows `Open linked discussion` before or near the document
  body.
- Tapping it reaches a safe forum discussion route.
- No document-level horizontal overflow, clipped primary action, private data,
  or visible product error appears.

`PASS WITH CAVEAT`

- The action is reachable but only after unusual scrolling, timing, or route
  discovery.
- `/writing` fails to expose the card but public Space does.
- Forum route is safe but the route story is weaker than desktop.

`FAIL`

- A mobile reader cannot find a linked-discussion action for the known public
  document even after settled loading.
- The action is clipped, hidden, overlaps, or routes to error.
- Private data or credential-shaped material appears.

`BLOCKED`

- Hosted staging is unavailable.
- The known public document no longer appears in public UI.
- Browser/auth/network tooling prevents a meaningful public mobile check.

## Result To Record

Create:

```text
docs/roadmap/UX09A_MOBILE_DOCUMENT_DISCUSSION_ARIADNE_RESULT.md
```

Record:

- viewport used;
- route path sequence by human-readable labels, not raw private identifiers;
- pass/caveat/fail/blocked verdict;
- whether `Open linked discussion` was visible before/near body;
- whether the forum discussion route loaded;
- mutation boundary confirmation.

Then wake MIMIR.

## Wakeup Contract

```text
WAKEUP A1:
Codename: MIMIR
```
