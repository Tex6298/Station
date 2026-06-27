# PR386 - Writing Publishing Workflow Gate

Opened: 2026-06-27
Owner: DAEDALUS
Status: open

## Purpose

Move from private owner continuity/search closeout into the public author
journey.

Station already has accepted readback/trust work:

- PR362 mapped `/writing`, Studio publishing, Space-local document creation,
  public/owner document readback, document version APIs, and linked discussion
  affordances.
- PR367 added publishing trust/readback lines for document state, provenance,
  version, discussion rows, and owner dashboard context.
- PR373 through PR377 proved the public route chain through Discover, public
  Space, public document, and linked discussion.

PR386 should answer the next practical question: is the current
writing/publishing workflow ready for a bounded hosted authoring rehearsal, or
does DAEDALUS need to patch a small execution/readback gap first?

## Scope

Map and, only if needed, minimally patch current Station writing/publishing
workflow execution:

- `/writing`
- `/studio/publish`
- owner document/editor routes used by the publish flow
- Space-local document creation routes, if currently wired
- public and owner document readback
- linked document discussion affordances
- publishing dashboard/trust lines

Stay inside current product behavior. Do not implement:

- Station Press;
- social dispatch;
- scheduled publishing;
- rich-text/editor redesign;
- approval state machine expansion;
- new publication persistence;
- checkout/billing;
- provider/model work;
- Redis, Cloudflare, worker, queue, schema, migration, or broad public UI
  redesign.

## Questions To Answer

With route/code evidence:

- What is the current shortest owner path from private writing/draft work to a
  public-safe document?
- Which buttons or calls actually create, edit, publish, or link discussion?
- Which visible controls are intentionally preview/readback only?
- Can ARIADNE run a hosted bounded authoring rehearsal without creating messy
  long-lived data, or should the hosted proof use an existing replay document?
- Does the UI make the private-to-public boundary clear before mutation?
- Does published document readback show state/provenance/version/discussion
  context without raw ids, private source bodies, provider payloads, SQL, stack
  traces, or secret-shaped values?
- Are there any unwired action buttons that would make the authoring journey
  feel broken?

## Implementation Guidance

If no code patch is needed:

- Produce a result doc with exact hosted rehearsal steps for ARIADNE.
- Wake MIMIR or ARIADNE as appropriate with the bounded route and mutation
  guard.

If a small patch is needed:

- Patch only the missing execution/readback gap.
- Prefer honest disabled/preview-only states over fake live controls.
- Keep private-to-public copy explicit and non-magical.
- Add focused tests around the touched helper/route/control.
- Wake ARGUS with validation.

## Validation

Choose the focused subset based on touched files, but expect:

```bash
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If API publishing routes are touched, also run the relevant route tests and note
why scope expanded.

## Handoff

Wake ARGUS if code changes were made. Wake MIMIR or ARIADNE if this is a
map-only result with a ready hosted rehearsal.

Include:

- current route map;
- whether a bounded authoring rehearsal should mutate or use existing replay
  data;
- exact buttons/routes that are live versus preview-only;
- validation run;
- residual risks and recommended next owner.
