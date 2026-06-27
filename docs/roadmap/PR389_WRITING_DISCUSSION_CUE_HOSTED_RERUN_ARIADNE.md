# PR389 - Writing Discussion Cue Hosted Rerun

Opened: 2026-06-27
Owner: ARIADNE
Status: open

## Purpose

Rerun the hosted human-eye path for the PR388 `/writing` repair.

PR388 fixed a narrow writing-surface affordance gap: `/writing` cards now
preserve an existing `discussionThreadId` from the public feed and show the
shared `Open document and linked discussion` cue when the document already has
a linked discussion pointer.

This proof should confirm the repair in the browser after deployment. It should
not create a new public document, publish an artifact, or start a new discussion
thread.

## Freshness Gate

Target:

- `https://stationweb-production.up.railway.app`

Hosted web must be at or after the PR388 implementation commit:

- `3d8cc898`

If hosted Railway is stale or unavailable, return `BLOCKED` with the observed
prefix or failure. Do not fail the product for stale deployment.

## Human Route

Use replay-owner credentials from ignored local environment only. Do not paste
credentials, cookies, raw owner identifiers, raw persona identifiers, raw
document identifiers, raw thread identifiers, raw source bodies, screenshots,
SQL, stack traces, hosted logs, or secrets into the result.

Run the hosted route:

1. Sign in as the replay owner if needed.
2. Open `/writing`.
3. Find an existing replay public document card that is expected to have a
   linked discussion. Prefer the same replay/public document family used by
   PR324 if visible.
4. Confirm the card shows the shared linked-discussion cue:

```text
Open document and linked discussion
```

5. Open that document from `/writing`.
6. On `/space/:slug/documents/:documentId`, confirm the document detail still
   shows the live discussion action when the linked thread is readable:

```text
Open linked discussion
```

7. Open the linked discussion route and confirm it reaches the public forum
   thread.
8. Spot-check one document without a visible linked cue, if present, and confirm
   it does not pretend there is a broken live discussion action.

## Pass Criteria

Return `PASS` if:

- hosted freshness is at or after `3d8cc898`;
- `/writing` shows the linked-discussion cue for an existing linked public
  replay document;
- the route continues through public document detail to the linked forum
  discussion;
- documents without linked threads avoid fake live controls;
- no raw ids, private source material, owner-only archive/memory/canon/import
  material, provider payloads, SQL, stack traces, or secret-shaped values are
  visible.

Return `PASS WITH CAVEAT` if:

- the route is safe, but eligible linked replay data is thin or hard to find.

Return `FAIL` if:

- hosted web is fresh but `/writing` still hides the cue for an eligible linked
  public document;
- the document detail linked action regresses;
- the cue appears on documents with no linked thread and routes nowhere;
- private material, raw ids, source bodies, provider payloads, SQL, stack
  traces, or secret-shaped values are visible.

Return `BLOCKED` only for stale deploy, unavailable staging, missing
credentials, auth/session breakage, or no eligible linked replay document in
hosted data.

## Handoff Back To MIMIR

Wake MIMIR with:

- Verdict: `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`.
- Hosted freshness prefix observed.
- Routes checked.
- Whether `/writing` showed the linked-discussion cue.
- Whether public document detail still opened the linked forum discussion.
- Whether any no-thread card state looked misleading.
- Exact defects and recommended next owner if repair is needed.
