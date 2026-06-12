# Staging browser rehearsal - ARIADNE

Date: 2026-06-12

Owner: ARIADNE, A4 UX Navigator

## Verdict

STAGING-DEMO-BROWSER-01 ran as a real Chrome headless browser traversal with
Station session data stored in browser localStorage and the normal
`station-auth` cookie present.

The non-paid browser path is nearly ready, but the first pass found one
concrete UX blocker: mobile `/studio` had document-level horizontal overflow.
ARIADNE patched the Studio dashboard mobile layout so dashboard panels and rows
can shrink and wrap on narrow screens.

The patch is not a product expansion. It does not alter auth, visibility,
quota, archive, billing, export, or backend semantics.

## Rehearsal Mode

- Browser: local Chrome headless through DevTools Protocol.
- Desktop viewport: 1365 x 900.
- Mobile viewport: 390 x 844.
- Live staging web: `https://stationweb-production.up.railway.app`
- Live staging API: `https://stationapi-production.up.railway.app`
- Replay owner session was created through API sign-in and injected into
  browser localStorage/cookie.
- No screenshots were saved.
- No prompts, completions, private excerpts, raw response bodies,
  owner/persona/export/trace/customer IDs, tokens, cookies, keys, credentials,
  or replay corpus text were captured.

## Browser Results

Primary route result:

- 25 browser route checks passed.
- 1 browser route check failed.

Desktop passed:

- front door
- Discover
- public Space
- public document
- forum discussion
- Developer Space public observatory
- login route
- Studio home
- persona workspace
- persona Memory
- persona Continuity
- persona Archive
- Export Workspace
- Developer Space manage
- Billing status
- Settings observability

Mobile passed:

- front door
- Discover
- persona Memory
- persona Archive
- public document
- Developer Space public observatory
- Billing status
- Settings observability

API readback notes from the same rehearsal:

- Export bundle readback succeeded with 3 files.
- Observability summary returned 3 traces and 3,882 total tokens.
- Public Developer Space readback showed 1 node, 1 event, and latest snapshot
  present.

## UX Blocker Found

Mobile `/studio` failed the document overflow check:

- status: 200
- route landed correctly
- no failure text
- no loading text
- document overflow: true
- measured scroll width before patch: 437px on a 390px viewport

CDP bounds showed the overflow came from Studio dashboard panels and rows
refusing to shrink inside the mobile grid. The top navigation also has off-edge
items, but they remain inside its intended horizontal scroll container and did
not increase document scroll width after the dashboard patch.

## Patch

Changed:

- `apps/web/components/studio/studio-dashboard.tsx`
- `apps/web/app/globals.css`

Patch behavior:

- Adds class hooks to Studio dashboard panels and rows.
- On mobile, dashboard containers/panels are constrained to `max-width: 100%`
  with `min-width: 0`.
- Dashboard rows can wrap instead of forcing the page wider than the viewport.
- Row content can shrink within the available width.

Patch proof:

- The same CSS shape injected into live staging reduced mobile `/studio`
  document scroll width from 437px to 390px on a 390px viewport.
- The committed code mirrors that tested CSS behavior.

## Deployed Post-Patch Rerun

After Railway served the overflow patch, ARIADNE reran the narrow browser gate.

Deployment proof:

- API `/health/deployment`: 200, `ready:true`, served SHA prefix
  `0614fdd06e65`.

Browser result:

- 6 checks passed.
- 0 checks failed.

Routes:

- mobile `/studio`: 200, landed, scroll width 390px on a 390px viewport, no
  horizontal overflow.
- mobile persona Memory: 200, landed, scroll width 390px on a 390px viewport,
  no horizontal overflow.
- mobile persona Archive: 200, landed, scroll width 390px on a 390px viewport,
  no horizontal overflow.
- desktop Studio home: 200, landed, no horizontal overflow.
- desktop Settings observability: 200, landed, no horizontal overflow.
- export bundle readback: 200, 3 files.

Post-rerun verdict:

- The deployed mobile Studio overflow blocker is cleared.
- STAGING-DEMO-BROWSER-02 passes.

## Remaining Friction

- This pass was automated Chrome traversal, not a human narrative rehearsal.
- Paid activation remains excluded unless Marty completes the external Stripe
  Checkout/event step.
- Redis, Cloudflare, background jobs, and full workspace export remain out of
  scope.

## Validation

- Live browser traversal before patch: 25 passed, 1 failed.
- CDP CSS injection proof on mobile `/studio`: 437px scroll width down to 390px.
- Deployed post-patch browser rerun: 6 passed, 0 failed.
- `npx --yes pnpm@10.32.1 --filter @station/web typecheck`
- `npx --yes pnpm@10.32.1 test:studio-ui`
- `npx --yes pnpm@10.32.1 --filter @station/web lint` passed with existing
  warnings outside this patch.
- `git diff --check`

## Recommended Next Lane

Move to a human demo narrative rehearsal rather than reopening backend
infrastructure.
