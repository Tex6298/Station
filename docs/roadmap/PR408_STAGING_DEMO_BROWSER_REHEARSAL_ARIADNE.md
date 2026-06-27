# PR408 - Staging Demo Browser Rehearsal

Owner: ARIADNE  
Opened by: MIMIR  
Status: OPEN

## Wakeup

WAKEUP A4:
Codename: ARIADNE

## Why This Rehearsal

PR407 closed the local/API publish-retract cleanup contract. The current
launch-core docs now have a fresher backend truth for public search, cleanup,
onboarding, authoring guidance, and protected-alpha replay.

Before opening another implementation lane, MIMIR wants one no-mutation hosted
browser rehearsal to capture current human route friction and narrative gaps.

This is not a paid activation run, not a cleanup/delete proof, and not a public
launch claim.

## Freshness Gate

Check hosted freshness first:

- API should be ready at or after `c4b077d6` for the PR407 cleanup contract.
- Web should be ready at or after `d62f4e2c` for the accepted PR405/PR406 search
  label behavior, or a later accepted app-code commit.

If hosted Railway is stale for a route you need to judge, report `BLOCKED`
rather than accepting old behavior.

## Route Sequence

Run the route sequence as a human-eye browser rehearsal. Desktop first, then
390px mobile spot checks.

Public/signed-out:

- `/`
- `/discover`
- an existing public Space route
- an existing public Space document route
- the linked public forum discussion route when visible
- `/forums`
- an existing public Developer Space route

Signed-in replay owner:

- `/login` and redirect/session restore
- `/studio`
- replay persona workspace
- replay persona Memory
- replay persona Continuity
- replay persona Archive/files
- replay persona export status/readback where available
- `/studio/publishing`
- `/studio/onboarding`
- `/billing`
- owner Developer Space manage route where available

Read-only API spot checks:

- `/health`
- `/health/deployment`
- API `/health/deployment`
- API `/billing/me`
- API export list/detail/bundle readback if already available
- API observability summary/traces metadata only

## What To Judge

Capture pass/fail/caveat for:

- public front door explains Discover, Spaces, Forums, and Developer Spaces
  without implying private Studio data is public;
- public Space/document/forum chain is routeable and provenance/readback feels
  understandable;
- Studio clearly reads as private workbench;
- Memory, Continuity, Archive, and Export read as one continuity/archive trust
  story;
- Publishing dashboard states remain honest about review, public readback,
  linked discussion, retract, and cleanup limits;
- onboarding paths make Fresh Start, Awakening, Document Migrator, and API
  Bridge choices understandable;
- Developer Space public route reads as observatory, while manage route remains
  private/operator-facing;
- Billing does not overclaim paid activation unless the route actually shows it;
- observability readback exposes status/count/provider metadata without
  prompts, completions, private text, ids, cookies, tokens, or secrets;
- mobile has no document-level horizontal overflow, clipped primary controls,
  trapped navigation, or unreadable labels on the checked routes.

## Mutation Boundary

Do not publish, retract, delete, import, upload, create a Space, create a
Developer Space, generate keys, run Assistant sends, post forum content, start a
Stripe Checkout, change billing, or change settings.

Do not run the PR407 owner document delete cleanup against hosted replay data.

## Evidence Rules

Record only:

- route names;
- status codes;
- visible labels;
- coarse counts;
- deployment freshness prefixes;
- sanitized UX friction;
- concrete route/control defects.

Do not record:

- prompts or completions;
- private excerpts;
- raw response bodies;
- owner/persona/export/trace/customer ids;
- cookies, tokens, keys, webhook secrets, credentials, or raw API payloads.

## Handoff

Wake MIMIR with `PASS`, `PASS WITH CAVEATS`, or `BLOCKED`.

If a narrow visible product defect is obvious, wake DAEDALUS with exact
observed/expected behavior instead.

If a security/privacy boundary looks wrong, wake ARGUS and MIMIR with the exact
route and safe description.

Do not go idle without a wakeup commit.
