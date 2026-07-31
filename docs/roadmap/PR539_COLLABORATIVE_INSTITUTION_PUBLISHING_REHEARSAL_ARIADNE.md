# PR539 Collaborative Institution Publishing - Hosted Human Rehearsal

Owner: ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-31

Status:

```text
READY_PR539_COLLABORATIVE_INSTITUTION_PUBLISHING_FOR_ARIADNE
```

## Rehearsal Result

Prove through the hosted human routes that an Institution owner and active
member can understand and use one shared Institution publication without
confusing human attribution with ownership, while a signed-out visitor sees
only the deliberately public result.

Use exact deployed source
`34c91e078faccc93b36316e03e382a3cfb74d14e`. Use the retained owner and active
member credentials already configured in ignored local evidence/env state; do
not ask Marty for credentials and do not record secrets.

## Human Routes

- Institution team: `/institutions/station-institutional-alpha/team`
- publication workspace:
  `/institutions/station-institutional-alpha/publications/station-institution-publication-alpha`
- signed-out publication:
  `/institutions/station-institutional-alpha/publications/public/station-institution-publication-alpha`
- signed-out Institution: `/institutions/station-institutional-alpha`
- signed-out Developer Space:
  `/developer-spaces/station-replay-dev-alpha`

Start from the fresh verified retained state: one published publication at
version `7` with seven paired publication audit events, retained Project
public, and zero tagged Auth-user or membership residue.

## Controlled Human Cycle

Perform this exact sequence through visible browser controls, one account at a
time:

1. **Owner** - open Team and the retained publication. Confirm Institution and
   Project context, published/version state, creator and last-editor labels,
   owner role, working public link, visible `Retract`, disabled draft save, and
   no misleading member-only or placeholder control. Click `Retract` once and
   confirm visible success plus private-draft/version readback.
2. **Signed out** - confirm the publication now presents a bounded not-found
   state, while the public Institution and Developer Space routes remain
   reachable without an auth redirect or `401` surface.
3. **Active member** - open Team and the same retained draft. Confirm member
   role and creator attribution remain truthful, edit the body with one short
   clearly tagged human-rehearsal sentence, save once, and confirm visible
   success/version movement. Confirm `Publish` and `Retract` are absent; do not
   submit the create-publication form.
4. **Owner** - reopen the same draft, confirm the member is now the truthful
   last editor, and publish once. Confirm visible success, public-link return,
   and no stale form state.
5. **Signed out** - read the republished page and follow both Institution and
   Project attribution links. Confirm public copy contains the human-rehearsal
   sentence and bounded creator/editor labels, with no raw ids, emails, team,
   version, audit, billing, provider, token, or private Studio data.

The exact expected retained delta is three successful transitions: version
`7 -> 10` and paired publication audit events `7 -> 10`. There must still be
one retained publication, no new Institution publication row, no disposable
account/member residue, and the final Project/publication states must both be
public. Any extra transition, row, or audit event is a rehearsal failure that
must be explained and reconciled before handoff.

## Human-Eye Matrix

Cover at least:

- owner desktop at `1440x1000` in one theme;
- active-member mobile at `390x844` in the other theme; and
- signed-out public mobile at `375x812`, plus a desktop public spot check.

At each relevant stop check loading, success, error/not-found, disabled, and
role-specific states for legibility; keyboard focus and ordinary tab order;
button and link truth; long title/body wrapping; stable layout during state
changes; and zero horizontal overflow or clipped actions. This is a human-eye
product rehearsal, not a screenshot-only DOM inventory.

## Required Receipts

- exact API/web deployment SHA before writes;
- before/after retained publication version, status, Project visibility, and
  paired audit count;
- signed-out HTTP/product truth for publication hidden/restored and both public
  neighbour routes;
- owner/member control-presence and action-result observations;
- viewport/theme/overflow/focus observations and public-safe screenshots;
- final read-only retained verifier with migration/ledger/catalog unchanged;
- exact zero disposable Auth/membership/publication residue; and
- disclosure of any console, failed-request, session, stale-state, or visual
  defect, even if the core cycle completes.

Sensitive screenshots, credentials, raw ids, and detailed receipts remain in
ignored `.station-private/pr539`. Commit only a public-safe result.

## Stop Conditions

Stop before further mutation and wake MIMIR if exact source is not deployed,
the start state is not version/audit `7/7`, the owner/member identity cannot be
proven, the wrong control appears, a transition produces an unexpected delta,
an unrelated public route regresses, or cleanup/final publication truth cannot
be established. Do not improvise additional publication rows or accounts.

## Baton

ARIADNE completes the rehearsal, records one public-safe result, and wakes
MIMIR with a pass or exact blocker. Do not sleep without that response and do
not hand the lane directly to another implementation agent.
