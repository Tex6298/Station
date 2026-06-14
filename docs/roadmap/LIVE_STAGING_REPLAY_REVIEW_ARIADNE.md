# Live Staging Replay Review - ARIADNE

Date: 2026-06-14

Reviewer: A4 / ARIADNE

Reviewed wakeup: `d2cfb9d` closing the live web deployment proof lane.

Verdict: Accepted for MIMIR closeout. No DAEDALUS implementation blocker or
ARGUS visibility/security concern was found.

## Targets

- Live web: `https://stationweb-production.up.railway.app`
- Live API observed from the browser client:
  `https://stationapi-production.up.railway.app`
- Web deployment identity: `/health/deployment` returned `200`, `ok:true`,
  `ready:true`, and Railway web commit `be13573`.

## Public Chain

The public route chain is replayable:

- `/` settled as the public Station front door.
- `/discover` settled with public/community copy and routeable seeded replay
  results.
- `/space/station-replay-alpha` settled as the seeded public Space.
- `/space/station-replay-alpha/documents/450e0e9f-530b-4434-af64-b83b25beb959`
  settled with the public document, provenance context, and an attached
  discussion.
- `/forums/general/4c1365f9-04d0-4a7c-9bdb-7ab678ce4712` settled as the linked
  forum discussion.

The visible "private archive" language on public routes is exclusion/trust copy,
not private corpus leakage. No public-chain DAEDALUS blocker was found.

## Signed-In Studio

Signed-in replay passed with sanitized session checks only:

- Real `/login?redirect=/studio` form submission reached `/studio`.
- Same-browser `/studio` reload preserved local Station session and auth cookie.
- Persona Memory, Continuity, and Archive routes settled without route-level
  overflow, failed fetches, or app error screens.
- Continuity is visible as its own stop rather than being collapsed into Archive
  or Memory.
- Archive remains owner-private source infrastructure with server-reported
  storage/quota context.

## Archive And Export

The per-persona Archive page exposed the expected owner-only export controls.
`View manifest` and `View portable bundle` both opened readbacks after scrolling
the controls into view.

Accepted:

- Manifest readback appeared.
- Portable bundle readback appeared with `README.md`, `manifest.json`, and
  `manifest.md` framing.
- Review notes record only sanitized structure and booleans, not private archive
  text or package payloads.

## Developer Spaces

The earlier observer capture that stayed on `Opening observatory...` did not
reproduce under a stricter wait.

Accepted:

- Direct anonymous API detail for `/developer-spaces/station-replay-dev-alpha`
  returned `200`, public visibility, one node, one event, and no linked
  documents.
- Direct owner API detail returned `200` with owner access.
- Anonymous public observer settled in the browser with `Station Replay Dev
  Alpha`, `Live observatory`, tracked node, public signal, event stream, reading
  guide, current nodes, and latest snapshot.
- Signed-in observer settled with the same public observatory plus the owner
  `Manage` affordance.
- Developer Space manage settled with ingestion key, usage, live ingestion,
  visual mode, observatory widgets, and export controls.

Future polish: the seeded Developer Space still has no linked public methodology,
finding, or field-log documents. That makes the story thinner, but it is not a
functional replay blocker.

## Billing And Stripe Test Paths

Billing replay passed within test-mode bounds:

- `/billing` settled with the active Basic plan, available paid plans, and no
  route-level overflow or app error.
- `Manage / cancel subscription` opened Stripe Billing Portal on
  `billing.stripe.com`.
- `Upgrade - GBP 100/mo` opened Stripe Checkout on `checkout.stripe.com`.

No Stripe session URLs, tokens, or customer identifiers were recorded.

## Verdict

Pass for the current human staging replay.

Blockers: none.

Future polish:

- Seeded Archive import/library material is still thin.
- Developer Space storytelling would benefit from linked public methodology or
  field-log documents.
- Dense global mobile navigation remains a future IA polish item, not a replay
  blocker.

## Validation

- Hosted Chrome/CDP replay against the live Railway web app.
- Direct anonymous and owner API detail probes for the seeded Developer Space.
- Public web deployment identity probe.
- Sanitized booleans, route labels, hostnames, headings, and counts only.
- No code changes were made in this review.
