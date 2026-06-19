# PR83 - Community Forum UX Rehearsal Result

Date: 2026-06-19
Reviewer: A4 / ARIADNE
Status: defects found; DAEDALUS should patch narrow UI/UX issues

## Scope Rehearsed

Runtime:

- Web and API health checks were ready on Railway runtime
  `ba73064c23646edb9fd61a14a7ef9cc09a66e6ba`.
- API forum snapshot returned 8 categories and 4 threads in
  `documents-and-codexes`.
- The known public document discussion endpoint returned an attached discussion
  in `documents-and-codexes`.

Browser roles/viewports:

- Anonymous desktop and 390px mobile:
  - `/forums`
  - `/forums/documents-and-codexes`
  - `/forums/documents-and-codexes/new`
  - `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`
  - `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- Eligible member desktop and 390px mobile with the replay owner credential:
  - `/forums`
  - `/forums/documents-and-codexes`
  - `/forums/documents-and-codexes/new`
  - `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`

Below-tier and admin browser passes were not run because only the replay owner
credential was available locally. The below-tier issue below is from code
readback of the category page after PR81 made participation tier-gated.

## Route Findings

| Route | Role | Viewport | Result | Priority | Finding |
| --- | --- | --- | --- | --- | --- |
| `/forums` | anonymous | desktop/mobile | pass | no-action | The top-level forum list loads, names the surface, and avoids signed-in creation controls. |
| `/forums/documents-and-codexes` | anonymous | desktop/mobile | pass | no-action | Category read is available without live creation controls. Search/sort/list affordances fit both viewports. |
| `/forums/documents-and-codexes/new` | anonymous | desktop/mobile | pass | no-action | Anonymous users are routed to sign-in instead of seeing a dead post form. |
| `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf` | anonymous | desktop/mobile | pass | no-action | Thread read is available with sign-in/join copy and no live reply/report/vote controls. |
| `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f` | anonymous | desktop/mobile | fail | important | The API returns an attached discussion, but the public document route did not render `Open discussion`. Public readers need the document discussion entry point when a discussion already exists. |
| `/forums/documents-and-codexes` | eligible member | desktop/mobile | pass | no-action | Eligible users can see the category list and the new-thread entry point. Linked document provenance appears in the category list when applicable. |
| `/forums/documents-and-codexes/new` | eligible member | desktop/mobile | fail | important | Optional linked persona/Space selects appear without helper or boundary copy explaining what the link does, whether it affects visibility, or how it relates to public/community discussion. |
| `/forums/documents-and-codexes/new` | eligible member | desktop/mobile | pass | no-action | Empty submit shows `Title and body are required.` without creating a thread. |
| `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf` | eligible member owner | desktop/mobile | fail | polish | The owner sees `Own post` and a live `Report` action on the same thread. The report action should be hidden for own thread posts, matching the own-comment behavior. |
| `/forums/documents-and-codexes` | below-tier signed user | desktop/mobile | fail | important | Code readback shows `+ New thread` is visible to any authenticated session and tier rejection happens only after entering/submitting the flow. Below-tier users should not see a live creation control they cannot use. |

## DAEDALUS Patch List

1. Public document discussion entry point

   - Route: `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
   - Role/viewport: anonymous desktop and 390px mobile
   - Expected: a public document with an existing attached discussion shows a
     clear `Open discussion` CTA.
   - Actual: browser rehearsal did not render `Open discussion` even though
     `/documents/:id/discussion` returned an attached thread.
   - Implementation hint: inspect the public document discussion load path and
     anonymous API/client state. Do not widen document visibility or expose
     private source material.

2. Tier-aware category creation affordance

   - Route: `/forums/documents-and-codexes`
   - Role/viewport: below-tier signed user, desktop/mobile
   - Expected: below-tier users see read/community context and a calm eligibility
     explanation, not a live creation control.
   - Actual: category page sets `canPost` for any authenticated session; the API
     tier rejection happens later.
   - Implementation hint: use existing entitlement/tier state or a small safe
     affordance check to hide/disable `+ New thread` for below-tier users. Keep
     API enforcement intact.

3. Linked persona/Space field clarity

   - Route: `/forums/documents-and-codexes/new`
   - Role/viewport: eligible member, desktop/mobile
   - Expected: optional linked persona/Space fields explain purpose and
     visibility boundary before the user posts.
   - Actual: selects only show `No linked persona` and `No linked Space`.
   - Implementation hint: add short helper copy near the optional fields. This
     is copy/layout only; do not add new linking semantics.

4. Own-thread report action

   - Route: `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`
   - Role/viewport: eligible member owner, desktop/mobile
   - Expected: owners do not see a report action for their own thread.
   - Actual: thread detail shows both `Own post` and `Report`.
   - Implementation hint: condition the thread-level report button on
     `session.user.id !== thread.author_user_id`, matching the comment action
     pattern.

## Validation

Passed before the ad hoc runner was removed from the worktree:

```bash
node --check scripts/tmp-pr83-community-forum-ux-rehearsal.mjs
```

Completed with the expected failing UX verdict above before runner removal:

```bash
node scripts/tmp-pr83-community-forum-ux-rehearsal.mjs
```

No secrets, bearer tokens, hosted checkout URLs, raw archive text, or private
payloads were recorded in this note.
