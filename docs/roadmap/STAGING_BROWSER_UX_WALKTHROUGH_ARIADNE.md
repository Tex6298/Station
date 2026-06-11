# Staging Browser UX Walkthrough - ARIADNE

Date: 2026-06-11
Reviewer: ARIADNE

Status: browser/mobile UX walkthrough complete. No screenshots, credentials,
tokens, cookies, response bodies, prompt bodies, private excerpts, raw corpus
text, owner IDs, persona IDs, thread IDs, export IDs, or local env values are
committed in this note.

## Scope

This walkthrough used `docs/ops/STAGING_BROWSER_UX_WALKTHROUGH.md` after ARGUS
accepted the deployed API replay evidence for the seeded corpus.

The goal was browser readiness, not another backend proof pass.

Staging URLs:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

Browser/viewport coverage:

- Chrome headless through Chrome DevTools Protocol.
- Desktop: 1365 x 900.
- Mobile: 390 x 844.

## Sanitized Coverage

Public/unauthenticated surfaces:

- `/` returned 200 and showed the public Station front door with Discover,
  Spaces, Developer Spaces, and Forums navigation.
- `/discover` returned 200 and kept Discover, Developer Spaces, Spaces, and
  Forums legible.
- `/login` rendered the sign-in route with forgot-password and create-account
  affordances.
- `/reset-password/update` returned 200. Without a recovery token it correctly
  offered the request-new-link/back-to-sign-in path.
- Public Space, public document, forum discussion, and Developer Space
  observatory routes returned 200 and did not show document-level horizontal
  overflow at the checked desktop/mobile widths.

Authenticated browser/session surfaces:

- Replay owner sign-in through the browser login form reached `/studio`, wrote
  the expected local session, and set the non-secret auth cookie.
- Reloading protected routes with the restored session kept the user in the
  authenticated app rather than redirecting back to login.
- `/studio` returned 200 on desktop and mobile. The top nav showed Discover,
  Writing, Forums, Studio, My Space, and Developer; Studio was active; no
  document-level horizontal overflow was detected.
- `/studio/personas/:personaId` returned 200. Runtime Context loaded for the
  seeded persona, the owner-only export status/readback surface was present, and
  no visible error component was found.
- `/studio/personas/:personaId/files` returned 200. Archive trust/library,
  private-source, storage/quota, import, and export-status surfaces were present
  enough for staging walkthrough; no visible error component was found.
- `/billing` returned 200 and showed current plan/status, available plans, and
  the expected status-only billing state.
- `/studio/export` returned 200 and showed the static Export Workspace surface.

Mobile sanity:

- Global top navigation stayed within the document width at 390 x 844.
- Studio, persona Archive, public document, public Space, and Developer Space
  routes did not show document-level horizontal overflow at 390 x 844.
- Studio mobile navigation was present on Studio routes.

## Browser-Ready Enough

The staged browser is ready enough for a replay walkthrough of the seeded
corpus:

- public entry routes are reachable;
- login and session restore work in the browser;
- private Studio and owner persona surfaces are reachable;
- private archive trust and runtime context surfaces render for the owner;
- public Space/document/forum and Developer Space observatory surfaces render;
- billing status renders;
- desktop/mobile navigation does not show the previous top-nav overflow issue.

## Product Friction

These are not backend/API blockers, but they matter before a polished user
demo:

- `/studio/export` is a static workspace mock. It says "Generate export" and
  refers to downloadable/background export behavior, while the live accepted
  path is still per-persona manifest/status readback. This can mislead users.
- Billing is status-only for the replay owner: Canon tier, inactive
  subscription, and no customer attached. That matches current backend proof but
  is not a complete paid-customer browser journey.
- Observability traces are accepted as empty API metadata, but there is no
  browser-facing observability experience to review.
- Discover and onboarding are serviceable as public entry points, but still
  need future Station-native IA/copy polish before they carry the full product
  promise.
- Developer Space public observatory renders live nodes/events, but seeded
  methodology/field-log storytelling is still thin for a non-technical visitor.
- The Studio mobile menu label is visually supplied by CSS; the page remains
  usable, but a later accessibility pass should confirm the disclosure has an
  explicit accessible name.

## True Staging Blockers

None found in this browser/mobile walkthrough.

The remaining issues are product friction or future polish, not blockers for
running a seeded staging replay through the browser.

## Follow-Up

Recommended DAEDALUS follow-up:

- Small UX copy/behavior patch for `/studio/export`: either mark it clearly as
  a preview/static planning surface or point users to the current per-persona
  export status/readback path. Do not imply downloadable bundles/background jobs
  are live until they are.

Recommended ARIADNE follow-up:

- After MIMIR chooses the next UI slice, review onboarding/Discover language
  against Station north-star and privacy boundaries.

ARGUS follow-up:

- No immediate security/privacy review is required from this walkthrough. Ask
  ARGUS to review if DAEDALUS changes `/studio/export`, auth/session UX, billing
  CTA behavior, or any visibility-bearing browser surface.
