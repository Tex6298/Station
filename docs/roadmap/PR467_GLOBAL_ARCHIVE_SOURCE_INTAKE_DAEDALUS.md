# PR467 - Global Archive Source Intake

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-29

State: OPEN - DAEDALUS IMPLEMENTATION

## Why

PR466 passed the hosted post-UI import regression. Marty accepted PR467 as a
legitimate feature lane, with one important sequencing rule: after PR467 is
finished and reviewed, the next feature-expansion choice should be a numbered
Phase 3 or customer-facing expansion lane unless a concrete blocker is named.

PR467 is the smallest feature lane that turns current Archive capability into a
more useful product operation:

- the persona Archive route already has source intake;
- the Global Archive route already has owner-wide search/readback;
- the missing product capability is an obvious owner-wide way to start source
  intake from Global Archive and see the new private source land back in the
  owner library loop.

This is feature work, not another reassurance sweep.

## Goal

Make `/studio/archive` a working owner-wide source-intake entry point, not only
a search/readback surface.

The protected-alpha user should be able to:

1. open Global Archive;
2. choose a persona they own;
3. paste source material with a source name;
4. create a private import job through the existing archive import API;
5. see the Global Archive refresh with the new import/source status;
6. follow the source back to the correct persona Archive tab for deeper review,
   file upload, continuity publishing, export readback, and candidate review.

## Scope

Implementation should stay narrow and use existing architecture:

- add a signed-in Global Archive source-intake panel or modal on
  `/studio/archive`;
- load owner personas already available to the signed-in user, or add the
  smallest owner-scoped API read if an existing route cannot supply this safely;
- submit pasted source material through the existing `POST /imports/chat`
  contract;
- refresh Global Archive results after success;
- show import failure/status copy that keeps prior archive material safe and
  owner-only;
- keep file upload on the persona Archive route unless reusing the existing
  signed-upload flow is genuinely small and safe;
- add focused tests for the touched web helper/component/API behavior.

## Acceptance Gates

- A signed-in owner can create a pasted private archive source from
  `/studio/archive` for a selected owned persona.
- The new import appears in the owner-wide archive list/search without a page
  reload.
- The empty/thin Global Archive state has a real next action, not only a hint
  to go somewhere else.
- The source row links back to `/studio/personas/:personaId/files`.
- Failed imports leave existing archive material visible and explain the
  failure without leaking pasted private source text.
- Anonymous users and non-owners cannot create or view private archive sources.
- The UI makes clear that Global Archive intake is private owner material and
  does not publish the source.

## Non-Scope

Do not include:

- new database schema;
- new import parsers;
- live Reddit, Discord, Google, Dropbox, Notion, or other connector imports;
- OAuth, bots, webhooks, recurring pulls, or social posting;
- background workers or queue activation;
- Redis memory truth, Cloudflare retrieval, provider/model switching, embedding
  reindex, vector migration, billing, pricing, auth/session changes, public
  memory, public observability, or broad UI reskin;
- Archive search/ranking overhaul beyond refreshing the existing result set;
- automatic Memory/Canon promotion from pasted source material.

## Validation

Run the smallest useful set after implementation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If the implementation touches API route ownership beyond the existing
`POST /imports/chat` contract, add the focused API test command that covers the
touched route.

If the implementation changes file upload behavior, add:

```bash
npm exec --yes pnpm@10.32.1 -- run test:exports
```

## Handoff to ARGUS

When done, wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR467 Global Archive Source Intake.
- /studio/archive can create pasted private archive sources for an owned persona.
- The result refreshes into the owner-wide archive loop and links back to persona Archive review.
Risk:
- Review owner scoping, non-owner denial, failure copy, private source text redaction, and no scope drift into connectors/workers/providers/Cloudflare/Redis.
Validation:
- ...
Task:
- Review PR467, run or inspect focused validation, and wake MIMIR with accept/fix/block verdict.
```

If blocked before implementation, wake MIMIR instead with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS blocked PR467 before implementation.
Blocker:
- ...
Smallest unblock lane:
- ...
Task:
- Decide whether to unblock PR467 or pivot to the next numbered Phase 3/customer-facing lane.
```

## Next-Lane Rule

After PR467 is implemented and reviewed, MIMIR should choose a numbered Phase 3
or other customer-facing feature expansion lane unless a concrete blocker is
named.

If there is a blocker, MIMIR should name it and open the smallest lane that
removes that blocker without turning into another open-ended hardening sweep.
