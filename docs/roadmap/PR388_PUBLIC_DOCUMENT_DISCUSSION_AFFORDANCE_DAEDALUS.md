# PR388 - Public Document Discussion Affordance

Opened: 2026-06-27
Owner: DAEDALUS
Status: open

## Purpose

Resolve the only caveat from PR387.

ARIADNE passed the safe hosted writing/publishing rehearsal, but the sampled
existing public document had safe trust/version/discussion-state readback
without an active linked discussion action to exercise.

This must be reconciled with the earlier PR323/PR324 public document discussion
chain, which proved:

```text
front door -> public Space -> public document -> linked forum discussion
```

The goal is not to broaden publishing scope. The goal is to find whether PR387
hit an ineligible document, a stale/alternate route, a missing writing-feed cue,
or a real affordance regression.

## Scope

Inspect the current public document discussion affordance only:

- `/writing` public document cards and links;
- `/discover` public feed links only where they route into public documents;
- `/space/:slug` public document cards and rows;
- `/space/:slug/documents/:documentId`;
- `GET /documents/:id/discussion`;
- `POST /documents/:id/discussion`;
- public-story/discussion helper copy and eligibility checks.

Out of scope:

- creating a new public document;
- publishing a new public/unlisted artifact;
- starting a new discussion thread unless MIMIR explicitly opens that mutation
  proof;
- Station Press;
- social dispatch;
- scheduled publishing;
- rich text/editor redesign;
- approval-state expansion;
- schema, migration, billing, provider, Redis, Cloudflare, worker, queue, or
  broad UI redesign work.

## Questions To Answer

With route/code evidence:

- Was the PR387 sampled public document actually eligible for a linked
  discussion action?
- If it was not eligible, does the UI explain why clearly enough for a human
  rehearsal?
- If it was eligible, why was the linked discussion action unavailable?
- Does `/writing` route humans to the same linked-discussion path proven in
  PR324, or does it bypass the Space/document surface where the action appears?
- Do documents with `discussion_thread_id` consistently expose an honest
  `Open linked discussion` path?
- Do documents without a linked thread consistently expose an honest
  unavailable/owner-start state without pretending a broken action exists?

## Implementation Guidance

Prefer a map-only result if the existing behavior is correct and ARIADNE simply
sampled an ineligible document. In that case, produce exact hosted proof steps
that use the known eligible replay public document chain from PR324, without
creating new public data.

Patch only if there is a small honest-action/readback gap, such as:

- `/writing` sends humans to a public document route but hides the linked
  discussion cue for eligible documents;
- eligible public documents fail to show `Open linked discussion`;
- ineligible documents have no clear explanation for the missing action;
- helper copy diverged between Space cards, writing cards, and document detail.

If patching:

- keep the action routeable only when the existing permission/eligibility model
  allows it;
- prefer explicit disabled/readback states over fake live controls;
- do not leak raw ids, private source bodies, owner-only material, provider
  payloads, SQL, stack traces, or secret-shaped values;
- add focused tests for the touched route/helper/control.

## Validation

Run the focused checks that match the result. Expect at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If no code changes are needed, state which checks were still run and why the
remaining work is a hosted proof rather than a repair.

## Handoff

Wake ARGUS if code changes were made.

Wake MIMIR if this is map-only or if the next move should be an ARIADNE hosted
rerun.

Include:

- root cause of the PR387 caveat;
- whether PR324 remains valid;
- exact eligible hosted route ARIADNE should use if no code patch is needed;
- validation run;
- residual risks and recommended next owner.
