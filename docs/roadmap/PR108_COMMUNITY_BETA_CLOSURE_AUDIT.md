# PR108 - Community Beta Closure Audit

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS audits or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: open for DAEDALUS

## Why This Lane

PR79 through PR107 have filled the major Community Beta loops: forums,
discussion attachment, moderation, reporter readback, review requests,
notifications, subcommunities, delegated moderation, witness controls, and
private recognition readback.

Before opening another feature lane, Station needs a closure audit: what is
actually required for protected Community Beta, what remains a future expansion,
and whether docs/tests still say outdated work is open.

## Goal

Produce a concrete Community Beta closure-readiness packet.

This PR should be documentation/test-evidence first. Do not invent a new feature
unless the audit finds a narrow blocker that must be fixed before Community Beta
can be considered protected-beta complete.

## Scope

DAEDALUS should:

- reconcile `docs/roadmap/community-beta.md` with PR79-PR107;
- classify remaining open items as:
  - required before protected-beta closure;
  - future expansion after protected-beta closure;
  - already satisfied and stale;
- update `docs/roadmap/community-beta.md` so the landed/open sections match the
  actual code and accepted PR docs;
- add a short closure-readiness note or checklist if the existing document is
  not enough;
- run the narrow Community Beta validation set;
- identify any true blockers precisely, with file/route/test evidence;
- wake ARGUS with a closure recommendation or a precise blocker list.

## Required Audit Areas

Check at least:

- public/forum category and thread read/create/comment flows;
- document-linked discussion visibility;
- reporter-owned report status readback and review requests;
- admin moderation queue/status/target context;
- notifications and thread watching;
- subcommunity directory, creation, category context, moderators, delegated
  actions, delegated queue, delegated report status, delegated target actions;
- witness controls and private author recognition readback;
- tier gating for public/community/private actions;
- known non-goals: public leaderboards, badges, rankings, public user scores,
  public moderator directory, trusted AI/persona/imported authorship, and broad
  forum redesign.

## Non-Scope

Do not add:

- new product surfaces unless a closure blocker is proven;
- public recognition/reputation surfaces;
- new moderation powers;
- billing/provider/cache work;
- Redis/Upstash, Cloudflare, Developer Space, auth/session, or broad styling
  work;
- staging deployment changes.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If the audit touches visible routes, add web build validation and wake ARIADNE
after ARGUS technical review.
