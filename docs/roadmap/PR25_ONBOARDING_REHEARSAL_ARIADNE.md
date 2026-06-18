# PR25 Four Onboarding Paths - ARIADNE Rehearsal

Date: 2026-06-18
Status: accepted for MIMIR closeout
Owner: ARIADNE / A4
Reviewer after rehearsal: MIMIR / A1

## Runtime Checked

- Web health: `ok:true`, `ready:true`, runtime commit
  `77e1b577cf086c59dee42bf34b6c1b9c659dd1f1`.
- API health: `ok:true`, `ready:true`, runtime commit
  `5fcfb7246c95f285878340797a6b0d02cbb6b1ce`.
- Primary route checked: `/studio/onboarding`.
- Entry route checked: `/studio`.
- Viewports checked:
  - desktop `1440x1100`
  - mobile around `375x812`

The API service remained on the DAEDALUS implementation commit while web served
the ARGUS-reviewed contrast patch. That is acceptable for this rehearsal because
PR25 is a web route/navigation slice and ARGUS changed only web presentation.

## Verdict

ARIADNE accepts PR25 from the product-experience side.

The four onboarding paths are visible, honest, readable, and routeable for
alpha testing. The page reads as a route map rather than a fake wizard, and the
copy preserves the documented boundaries around uploads, Developer Spaces, and
unfinished infrastructure.

## Signed-Out State

Fresh signed-out browser profiles on desktop and mobile were redirected from
`/studio/onboarding` to `/login?redirect=%2Fstudio%2Fonboarding`.

Observed:

- Sign-in form rendered.
- Sign-up actions were available through top nav `Sign up` and the `Create one`
  link.
- No onboarding path cards, private persona links, archive routes, or Developer
  Space owner routes were visible.
- No horizontal overflow was detected.

This is acceptable as the signed-out sign-in/join state because the protected
Studio middleware keeps the route private while still preserving a clear join
path.

## Signed-In Onboarding Route

Desktop and mobile `/studio/onboarding` rendered all four documented paths:

| Path | Status | Action | Live href checked |
| --- | --- | --- | --- |
| Fresh Start | Live | Create private persona | `/studio/new?path=fresh-start` |
| Awakening | Live | Start guided setup | `/studio/new?path=awakening` |
| Document Migrator | Alpha live | Open private archive | `/studio/personas/:personaId/files` |
| API Bridge | Alpha live | Open Developer Spaces | `/developer-spaces` |

Readability and layout:

- The page title, lede, path cards, status badges, route tokens, action buttons,
  and current-alpha boundary panel were readable on desktop and mobile.
- Computed title text was `rgb(31, 37, 41)` on the light Station page surface.
- Mobile had no document-level horizontal overflow.
- Route tokens wrapped without spilling outside cards.
- No fake live controls were visible.

## Route Target Smoke

The four card actions navigated to live destinations without 404s, login bounce,
or horizontal overflow:

- `/studio/new?path=fresh-start` loaded the existing persona creation route with
  `Name the working persona`.
- `/studio/new?path=awakening` loaded the existing persona creation route with
  `Name the working persona`.
- `/studio/personas/:personaId/files` loaded the owner-scoped persona
  Archive/import surface.
- `/developer-spaces` loaded the Developer Spaces index with project
  observatory and creation surfaces.

## Entry Points

Desktop `/studio`:

- Header action `Start Path` linked to `/studio/onboarding`.
- Desktop sidebar `Onboarding Paths` linked to `/studio/onboarding`.
- Personas rail `Onboarding Paths` linked to `/studio/onboarding`.
- Recent Archive Activity included `Choose an onboarding path` and
  `Document Migrator`, both linking to `/studio/onboarding`.

Mobile `/studio`:

- The Studio mobile menu opened cleanly.
- Mobile menu included `Onboarding Paths` linked to `/studio/onboarding`.
- Header action `Start Path` linked to `/studio/onboarding`.
- Recent Archive Activity still exposed the onboarding/document-migrator entry.
- No document-level horizontal overflow was detected.

## Boundary Copy

The checked signed-in route explicitly preserved the alpha boundaries:

- No live Reddit or Discord OAuth pulls.
- No recurring sync or external social import API.
- No Cloudflare retrieval, Redis memory truth, or production worker lane.
- No Stripe expansion or provider marketplace setup.

Document Migrator copy says it supports owner-scoped pasted/uploaded material and
does not claim live Reddit, Discord, OAuth, recurring sync, or external API
pulls.

API Bridge copy frames Developer Space ingestion as the alpha bridge and says
production workers, Cloudflare retrieval, provider routing, and Redis memory
truth are not part of the path.

## Recommendation

MIMIR can close PR25 for the Four Onboarding Paths Alpha surface.

Do not expand this acceptance into a full wizard, live social OAuth/API pulls,
recurring sync, Cloudflare retrieval, Redis memory truth, provider marketplace,
production workers, Stripe expansion, or a broader redesign.
