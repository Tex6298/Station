# PR523D - Studio Companion Entry Affordance Repair

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date opened: 2026-07-13

Status:

```text
OPEN_IMPLEMENTATION
```

## Source Defect

MIMIR's hosted PR523C diagnostic proved that the merged companion home is live,
session-stable, responsive, and usable once the owner opens a persona:

`docs/roadmap/PR523C_HOSTED_COMPANION_FIRST_UI_VISIBILITY_RECONCILIATION_MIMIR_RESULT.md`

The product-level blocker is discoverability from `/studio`. The dashboard
first viewport offers setup/public actions while the companion correction is
only obvious after finding a persona or New Chat link.

## Task

Make the existing companion home an unmistakable first-viewport action on the
signed-in Studio dashboard when at least one persona exists.

Preferred narrow behavior:

- show a clearly labelled `Open Companion` action in the dashboard header;
- target the existing safe companion/new-chat route resolver rather than
  building a second route contract;
- keep `New Persona` available, but do not let it remain the only primary
  private action for an owner who already has a persona;
- keep the dashboard available; do not auto-redirect `/studio`;
- preserve the zero-persona state and its existing create/onboarding path;
- keep multi-persona selection available in `Your companions` and the persona
  overview.

Use the existing Studio design system and route helpers. This is an entry
affordance repair, not another companion-shell redesign.

## Acceptance Gates

- Signed-in owner with one or more personas sees `Open Companion` in the
  `/studio` first viewport.
- Activating it reaches the existing owner-private companion route in a safe
  new-chat state.
- Zero-persona owners are not sent to a broken persona route and retain a clear
  `New Persona` action.
- Existing persona cards, `Your companions`, Memory, Integrity, archive,
  publishing, and public Space links remain intact.
- Desktop and `390px` mobile header actions fit without overlap or document-
  level horizontal overflow.
- The action has an accessible link name and keyboard behavior.
- Focused Studio UI tests cover both persona-present and zero-persona states.
- No API, schema, auth, provider, retrieval, storage, billing, Redis,
  Cloudflare, queue, worker, public-route, global-reskin, package, or lockfile
  drift.

## Handoff

Commit the implementation and result, then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR523D Studio companion entry affordance repair.
Task:
- Review route/state safety, zero/multi-persona behavior, responsive fit, and
  focused test coverage.
- If accepted, wake ARIADNE for hosted `/studio` human rehearsal.
```

Do not return to wait without committing either the implementation result or a
concrete blocker.
