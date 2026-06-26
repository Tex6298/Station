# PR323 - Public Document Discussion Entrypoint

Owner: DAEDALUS

Status: Open

## Why This Opens

ARIADNE passed PR322 as an internal protected-alpha demo refresh, but recorded
one public-story caveat: the checked public document UI did not clearly expose a
linked discussion route.

This matters because the intended public human chain is:

1. front door or Discover
2. public Space
3. public document
4. linked forum discussion

Current evidence says this is not a missing-data or backend-schema problem.
Public replay documents already carry discussion pointers, and the document
discussion endpoint returns eligible linked discussions. The issue is the human
entrypoint: Space and library surfaces mostly say "Discussion open" as passive
status, and the route to the discussion is not obvious enough during rehearsal.

## Scope

Make the public document-to-discussion route obvious and testable without
opening a broad redesign.

DAEDALUS should:

- Keep this as a public-story affordance repair, not a new backend lane unless a
  fresh code inspection proves the backend is actually blocking the route.
- Use the existing `discussion_thread_id` and
  `GET /documents/:id/discussion` contract.
- Ensure `/space/[slug]/documents/[documentId]` exposes a clear linked
  discussion action when a discussion exists.
- Improve `/space/[slug]` document/library cues so a human understands that a
  document has a linked discussion and where to go next.
- Avoid invalid nested links if adding a second action inside document cards.
- Preserve documents without discussions honestly: no fake discussion CTA.
- Preserve public/private boundaries: no private source material, raw ids,
  credentials, reporter identity, report bodies, owner-only fields, or raw
  event rows in public UI.

## Non-Goals

- No schema migrations unless DAEDALUS proves the current data contract is
  insufficient.
- No seed rewrite unless hosted replay data is proven missing after the current
  public API evidence.
- No broad UI redesign.
- No anonymous public chat.
- No durable visitor transcripts.
- No commercial, partner, billing, provider, Redis, Cloudflare, or launch-readiness
  work.

## Acceptance

- A human can follow the intended public chain from a public Space document to
  its linked forum discussion without guessing.
- Public Space document cards or library rows make the discussion affordance
  clearer than passive "Discussion open" text.
- Public document detail shows a clear discussion action after discussion state
  resolves, with a sensible fallback while loading or when discussion is absent.
- The route works for the replay public document that already has a linked
  discussion.
- Existing public documents without discussions do not claim a discussion exists.
- Focused tests cover the helper/component behavior added or changed.

## Suggested Validation

- `pnpm test:studio-ui`
- `pnpm test:community`
- `pnpm test:document-discussions`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check`

If a validation script is unavailable in this checkout, record the exact reason
instead of silently skipping it.

## Handoff

When implementation is complete, wake ARGUS with:

- files changed;
- exact public route behavior before and after;
- validation run and any skipped command;
- privacy notes for public/private discussion boundaries;
- whether ARIADNE should run a hosted human rehearsal after deploy.
