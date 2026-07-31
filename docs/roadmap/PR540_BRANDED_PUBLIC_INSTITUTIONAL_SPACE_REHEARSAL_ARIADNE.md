# PR540 Branded Public Institutional Space - Hosted Human Rehearsal

Owner: ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-31

Status:

```text
READY_PR540_BRANDED_PUBLIC_INSTITUTIONAL_SPACE_FOR_ARIADNE
```

## Human Result

Prove that a real Institution owner can manage an authored Institutional
Space, an active member sees truthful read-only configuration, and a signed-out
visitor receives a coherent verified Institution home containing only public
Institution work and Projects.

Use exact deployed source
`02da4dbcec4b6f55b0cdcecafd4dd3d68038b6f1`. Use the retained owner and active
member credentials already available in ignored local evidence/env state. Do
not ask Marty for credentials and do not record secrets.

## Human Routes

- Institution team: `/institutions/station-institutional-alpha/team`
- Institution Space workspace: `/institutions/station-institutional-alpha/space`
- public Institution: `/institutions/station-institutional-alpha`
- retained public publication:
  `/institutions/station-institutional-alpha/publications/public/station-institution-publication-alpha`
- retained public Project:
  `/projects/public/station-institution-project-alpha`

Start only from the fresh verified retained state: one published Institution
Space at version/audit `5/5`, one published Institution publication, one public
Institution Project, exact API/web source `02da4dbc`, and zero fixture Auth or
membership residue.

## Controlled Human Cycle

Perform this exact serialized sequence through visible browser controls:

1. **Owner desktop** - enter through Team, open the Institutional Space, and
   confirm Institution principal, owner role, published/version `5` truth,
   creator/editor labels, exact retained preview, `Unpublish`, and working
   public-page link. Confirm draft fields are disabled while published.
2. **Owner** - click `Unpublish` once. Confirm visible success, draft/version
   `6` readback, editable brand fields, and the absence of a stale public link.
3. **Signed out** - open the public Institution. Confirm it remains a reachable
   minimal verified identity page while the authored mark, headline, about,
   publication aggregation, and Project aggregation are absent. Confirm the
   retained publication and public Project remain individually reachable.
4. **Active member mobile** - open Team and the Space workspace. Confirm
   member/read-only role, draft/version `6`, truthful creator/editor labels,
   disabled fields and accents, and no save, publish, or unpublish control.
5. **Owner** - change only the About field by appending one short,
   clearly-labelled human-rehearsal sentence, save once, and confirm visible
   success plus version `7`. Then publish once and confirm visible success,
   version `8`, disabled published fields, and restored public link.
6. **Signed out** - confirm the public Institution shows the retained mark,
   authored headline/about including the rehearsal sentence, one published
   work item, and one Institution Project. Follow both content links and
   confirm they remain public and route correctly.

The exact expected retained delta is three successful Space transitions:
version `5 -> 8` and paired Space audit events `5 -> 8`. There must still be
one retained Space, no new Institution, Project, publication, Auth user, or
membership row, and the final Space/publication/Project states must all be
public. Any extra transition or audit event is a rehearsal failure that must
be disclosed and reconciled before handoff.

## Human-Eye Matrix

Cover at least:

- owner desktop at `1440x1000` in one theme;
- active-member mobile at `390x844` in the other theme;
- signed-out public mobile at `375x812`; and
- a signed-out public desktop spot check.

Check route transitions, loading/success/error states, keyboard focus and tab
order, role-specific control truth, disabled-state legibility, mark/headline/
about wrapping, visible next-band hint, publication/Project link reachability,
stable state after refresh, light/dark treatment, and zero horizontal overflow
or clipped actions. This is a human-eye rehearsal, not a screenshot-only DOM
inventory.

## Required Receipts

- exact API/web deployment SHA before mutation;
- before/after retained Space version, status, and paired Space audit count;
- signed-out minimal identity while draft and full aggregate after publish;
- owner/member control-presence and action-result observations;
- retained publication and Project link results in both Space states;
- viewport/theme/overflow/focus observations and public-safe screenshots;
- final read-only migration/ledger/catalog/authority verifier;
- exact zero disposable Auth/membership/Institution/Project/publication/Space
  residue; and
- disclosure of every console, failed-request, session, stale-state, or visual
  defect, even if the core cycle completes.

Sensitive screenshots, credentials, raw ids, and detailed receipts remain in
ignored `.station-private/pr540`. Commit only a public-safe result.

## Stop Conditions

Stop before further mutation and wake MIMIR if the exact source is not
deployed, the start state is not version/audit `5/5`, owner/member identity is
not provable, the wrong role receives an action, a public draft field leaks, a
transition produces an unexpected delta, retained public links regress, or
the final published state and zero-residue truth cannot be established. Do not
create replacement Institutions, Spaces, Projects, publications, or accounts.

## Baton

ARIADNE completes the rehearsal, records one public-safe result, and wakes
MIMIR with a pass or exact blocker. Do not hand the lane to another
implementation agent and do not sleep without a response.
