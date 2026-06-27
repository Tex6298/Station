# UX-01A - Studio route-story and mobile workbench ARIADNE review

Date: 2026-06-27
Reviewer: ARIADNE / A4
Status: visible pass after ARIADNE CSS patch - wake ARGUS

## Scope

Reviewed the UX-01A Studio route-story/mobile workbench implementation after
ARGUS accepted the technical boundary.

Checked:

- desktop sidebar current-stop card;
- mobile details summary and opened current card;
- dashboard place strip;
- persona workspace place strip;
- owner-only privacy/state readback;
- safe next actions;
- desktop, 375px, and 390px layout fit.

This review did not touch backend contracts, auth/session semantics, API
routes, storage/upload behavior, archive parsers, export package behavior,
runtime context selection/redaction, provider/model behavior, billing, public
routes, community routes, schema, migrations, worker/queue, Redis, Cloudflare,
Railway, or Supabase config.

## Initial Finding

The first desktop screenshot caught a real route-story layout bug on persona
workspace pages.

The persona `StudioPlaceStrip` squeezed `Orion Archive / Home` into
one-character lines because the metadata and action row consumed the available
horizontal space. The route-story content was present, but the current stop was
not readable enough for UX-01A.

## ARIADNE Patch

Patched `apps/web/app/globals.css` only:

- changed `.studio-place-strip` from a horizontal flex row to a grid stack;
- kept the first route-story block at full available width;
- let metadata pills and actions wrap from the left instead of forcing the
  current-stop label to collapse.

This is a visible UX fix inside the accepted Studio route-story boundary.

## Browser Review

Local setup:

- Web: `http://127.0.0.1:3147`
- API: mocked owner-only responses at `http://127.0.0.1:4999`
- Session: synthetic local browser session only
- No real owner data, hosted chat, provider calls, uploads, exports, or
  public/community mutations were used.

Routes checked:

- `/studio`
- `/studio/personas/persona-alpha`
- `/studio/personas/persona-alpha/continuity`
- `/studio/personas/persona-alpha/memory`
- `/studio/personas/persona-alpha/files`
- `/studio/personas/persona-alpha/calibration`
- `/studio/archive`
- `/studio/assistant`
- `/studio/onboarding`

Viewport matrix:

- desktop `1366 x 900`
- mobile `375 x 844`
- mobile `390 x 844`

Result:

- 27 route/viewport checks passed after the CSS patch.
- No document-level horizontal overflow.
- No route-story element overflow.
- No visible application-error text.
- Current stop, owner-only/private boundary, saved/preserved state, and safe
  next action were visible on desktop or immediately reachable in the opened
  mobile details panel.
- Screenshots inspected locally: desktop dashboard, desktop persona workspace,
  375px dashboard, 375px persona Archive, 390px persona workspace, and 390px
  global Archive.

## UX Verdict

Pass after ARIADNE patch.

The route-story readback now does what UX-01A needs:

- Studio reads as private workbench, not generic dashboard decoration.
- The desktop sidebar names the current stop and keeps privacy/state/next
  action close together.
- The dashboard place strip is legible and clear about owner-only private work.
- Persona workspace place strips no longer collapse under action/meta chips.
- Mobile details summary names the private boundary and current stop; opening
  it exposes the current card and first safe action before the route grid.
- Archive wording remains precise: per-persona Archive, global Archive, and
  export remain related but distinct.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Local Playwright route matrix | Pass | 27 desktop/375px/390px route-story checks passed after the CSS patch. |
| Screenshot inspection | Pass | Initial collapse reproduced, CSS patch applied, rerun screenshots inspected clean. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 133 tests passed. |

## Recommendation

Wake ARGUS to review the CSS-only ARIADNE patch and validation. After ARGUS
accepts, MIMIR can close UX-01A or decide whether UX-02 Archive trust should
open next.
