# ARIADNE Human Rehearsal

Date opened: 2026-06-14

Owner: A4 / ARIADNE

Target: `https://stationweb-production.up.railway.app`

Purpose: run the staging app from a human eye view with tools. This is a human
rehearsal: move through the product as a person would, notice what feels broken,
misleading, dead, unfinished, or off-brand, and then use browser/tool evidence to
pin down the defect. Do not hand this back to Marty as homework. Every visible
control should either work, navigate, visibly change state, submit successfully,
show a clear validation/error state, or be disabled/labelled as unavailable.

## Defect Classes To Look For

- Dead control: a visible button, chip, tab, card action, link, menu item, or
  keyboard submit does nothing.
- Silent placeholder: a control is not implemented but appears live, enabled,
  or primary.
- False state change: a tab/filter/search control changes styling but not data,
  URL, empty-state copy, count, or any other observable state.
- Broken form path: submit throws a console error, unhandled promise, failed RPC
  shape, missing validation, or no visible success/failure result.
- Route break: a public chain or protected chain cannot be completed by normal
  clicks from the UI.
- Session regression: signed-in reload loses session, protected routes redirect
  incorrectly, or signout leaves local session/cookie state behind.
- Public/private boundary leak: public routes reveal private archive, memory,
  canon, import, continuity, package payloads, or owner-only controls.
- Mobile/keyboard defect: content clips, controls overlap, focus gets trapped,
  keyboard submit fails, or dense nav prevents route use.
- Visual-language regression: a route falls back to the old generic dark
  vibecoded dashboard look instead of the current Station visual direction.
  Classify as blocker only when it harms comprehension, trust, or flow; otherwise
  record as future polish.

## Anonymous Public Run

Check desktop and mobile where practical.

- `/`
  - Top nav: Station, Discover, Writing, Forums, Sign in, Sign up.
  - Primary CTAs route or produce the expected auth flow.
  - No dead hero/sidebar controls.
- `/discover`
  - Hero CTAs: `Read the public feed`, `Watch live projects`, `Read forums`.
  - Search input changes query/results or shows clear empty/loading behavior.
  - Tabs: `Latest`, `Featured`, `Staff picks`.
  - Filter chips: `All`, `Essay`, `Codex`, `Manifesto`, `Research`,
    `Field Log`, `Theory`.
  - Result cards route to their target.
  - Signed-out join/sign-in panel controls work.
- Public chain
  - `/discover` to public Space.
  - Public Space to public document.
  - Public document to linked forum discussion.
  - Discussion back/related links remain routeable.
- `/writing`
  - Search, filters/tabs, public document cards, and empty states.
- `/forums`
  - Category cards and `View` controls.
  - Thread page actions visible to signed-out users either work safely or are
    clearly gated by login.
  - `Up`, `Down`, `Report`, and reply controls must not appear live if gated.
- Public Developer Space observer
  - `/developer-spaces/station-replay-dev-alpha` renders the observer.
  - Anonymous users do not see owner-only manage/key controls.
  - Observer does not stay stuck on loading text.

## Signed-In Studio Run

Use sanitized observations only. Do not record tokens, secrets, package payloads,
or private archive text.

- Auth
  - Login reaches `/studio`.
  - Reload preserves the signed-in session.
  - Signout clears session and protected routes redirect to login.
- Studio shell
  - Top nav, sidebar nav, account menu, `Publish`, `New Chat`, `New Persona`,
    search, persona links, `Blog Posts`, `Public Space`, and `Global Archive`.
  - No enabled shell control is dead.
- Persona page
  - Tabs: `Home`, `Timeline`, `Memory`, `Canon`, `Archive`, `Integrity`.
  - Each tab is its own stop and has route/state evidence.
- Chat and continuity
  - Chat send by button and keyboard.
  - `Archive`, `Save to memory`, and `Promote to canon` buttons either work,
    show a clear disabled state, or explain gating.
  - Continuity appears as its own stop, not just runtime-context counts.
  - Continuity preview input/button produces observable output or validation.
  - `Run Integrity Session` produces an observable result or disabled/gated
    state.
- Memory
  - Add-memory form: title, summary, content, weight control, `Save Memory`.
  - Saved-memory actions such as `Reinforce` and `Quarantine`.
  - Counts and cards update or show a clear reason they did not.
- Archive
  - Paste/import source material form and submit behavior.
  - Archive library counts and import status.
  - Any `Attach`, `Pin`, `Draft`, `Export`, manifest, or bundle controls.
  - Thin seeded archive/import material is polish unless a control is dead or
    misleading.
- Export
  - `Create JSON/Markdown manifest`, `Manifest open`, `Bundle open`,
    `View manifest`, and `View portable bundle`.
  - Readbacks open without exposing data in the audit notes.
- Developer Space
  - List page create form controls.
  - `View observatory`, `Manage`, `Open observatory`.
  - Manage page: `Generate key`, `Save visual mode`, widget checkboxes,
    `Up`, `Down`, ingestion/live/export controls.
  - Owner-only controls stay owner-only.
- Settings and Billing
  - Settings cards route.
  - Billing plan buttons, `Manage / cancel subscription`, Stripe Portal, Stripe
    Checkout test paths.
  - No production payment path is triggered; record only hostnames and visible
    mode, not session URLs or customer identifiers.

## Reporting Format

For every defect, record:

- Route and signed-in state.
- Control label or selector.
- Expected behavior.
- Actual behavior.
- Console/network clue if available.
- Severity: blocker, implementation defect, copy/gating defect, or future polish.
- Recommended owner: DAEDALUS for implementation, ARGUS for visibility/security,
  MIMIR for product decision.

Wake DAEDALUS only for concrete implementation defects. Wake MIMIR with the
audit verdict if the run passes or if the only remaining issues are product
polish decisions.
