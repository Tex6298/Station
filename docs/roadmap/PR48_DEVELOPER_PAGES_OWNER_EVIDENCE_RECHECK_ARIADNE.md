# PR48 - Developer Pages Owner Evidence Recheck

Date: 2026-06-18
Agent: A4 / ARIADNE
Status: opened by MIMIR

## Purpose

Run a signed human-eye rehearsal for the owner Developer Space evidence console
after PR47.

ARGUS accepted PR47 in code review. Railway web and API are already serving
commit `65076251d3a7f6fb28d0258a75b1d30749a5c3a8`, so this is a deployed
browser check, not a local-code review.

## Routes

Check as the replay owner account:

- `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha/manage`
- `https://stationweb-production.up.railway.app/developer-spaces/animus-field-lab/manage`

Also confirm the public visitor routes still look unchanged enough after the
owner-console pass:

- `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha`
- `https://stationweb-production.up.railway.app/developer-spaces/animus-field-lab`

## Deployment Guard

Before browser review, check:

- `https://stationweb-production.up.railway.app/health/deployment`
- `https://stationapi-production.up.railway.app/health/deployment`

Both should report Railway commit `65076251d3a7f6fb28d0258a75b1d30749a5c3a8`
or newer, with `ok:true`. Do not print secrets, tokens, cookies, private archive
text, raw provider payloads, or owner IDs.

## Human Rehearsal Checklist

On both signed owner manage routes:

- The management page loads without route error, hard loading state, or sign-in
  loop.
- The left-side metrics say `Evidence`, not generic `Notes`.
- The evidence section is named `Evidence path`.
- The form uses evidence language:
  - role select options include `Methodology / architecture`,
    `Finding / milestone`, `Field log / update`, and `Note / paper`;
  - role-purpose copy changes when the role changes;
  - `Position`, `Title`, `Body`, `Publish to visitor evidence path`, and
    `Save evidence` are visible and fit at desktop and 390px mobile width.
- Existing linked evidence is ordered methodology, finding, field log, then
  notes.
- Publicly visible evidence is labeled `Visible to visitors`.
- Non-public evidence is labeled `Hidden from visitors`, not called a draft
  merely because the link is private.
- Ingestion key, visual mode, widget, usage, export, and curl instruction
  sections still exist and do not show obvious regression.
- No document-level horizontal overflow at desktop or 390px mobile.

If you can safely exercise the create action without disrupting public staging,
create one owner-only smoke evidence item on `station-replay-dev-alpha`:

- role: `Note / paper`;
- title prefix: `ARIADNE PR48 smoke`;
- body: one short public-safe sentence saying it is an owner-console smoke note;
- position: high number such as `999`;
- leave `Publish to visitor evidence path` unchecked.

Then verify it appears in the owner list as `Hidden from visitors` and does not
appear on the anonymous public Developer Space route.

## Pass / Fail

Pass if the owner manage UI clearly matches the public evidence-path model and
the public routes remain visitor-safe.

Fail if:

- the signed manage routes are stale or inaccessible;
- the new form/list language is missing;
- evidence order is wrong;
- owner-only material appears publicly;
- public routes gain dead controls, fake links, overflow, or obvious wording
  drift;
- the smoke item cannot be created, if you attempt the action.

## Handoff

Wake MIMIR with:

- deployment commit checked;
- account mode used;
- desktop/mobile result;
- whether you created the owner-only smoke evidence item;
- public-route privacy result;
- pass/fail verdict;
- any specific defect DAEDALUS should fix.
