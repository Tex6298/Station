# PR485B - Memory And Continuity Candidate Inbox Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted human-eye rehearsal

## Why This Rehearsal

ARGUS accepted DAEDALUS' PR485B implementation without a review patch:

`docs/roadmap/PR485B_MEMORY_CONTINUITY_INBOX_REVIEW_RESULT.md`

PR485B is a visible owner-workspace change:

- a new owner route exists at
  `/studio/personas/[personaId]/memory-inbox`;
- the companion home shortcut strip now has five links, adding `Inbox` while
  keeping `Memory` pointed at `/memory`;
- the inbox uses the existing import-backed candidate list/review APIs and does
  not add API behavior.

Because this changed visible hosted UI and added a fifth shortcut, MIMIR routes
ARIADNE for desktop and mobile human-eye proof before closeout.

## Hosted Target

Use hosted Railway Station:

```text
https://stationweb-production.up.railway.app
```

Use a signed-in staging owner persona route. Prefer the existing replay owner
persona if available, but any owner persona route is acceptable if it exercises
the same `/studio/personas/[personaId]` and `/memory-inbox` surfaces.

Freshness target:

```text
a5fade6a web: add memory candidate inbox
```

Hosted web/API should be at `a5fade6a` or later, or at a deploy-equivalent app
commit if later commits are docs/state only. If freshness is not deployed,
return a concrete deployment/freshness blocker and do not widen scope.

## Required Checks

ARIADNE should verify only the accepted PR485B visible boundary.

1. Companion home shortcut strip:
   - signed-in owner can open `/studio/personas/[personaId]`;
   - shortcut strip shows `Memory`, `Inbox`, `Timeline`, `Profile`, and
     `Integrity`;
   - `Memory` still routes to `/studio/personas/[personaId]/memory`;
   - `Inbox` routes to `/studio/personas/[personaId]/memory-inbox`;
   - `Timeline`, `Profile`, and `Integrity` still route to `/continuity`,
     `/edit`, and `/calibration`;
   - desktop, `375px`, and `390px` show no horizontal overflow, clipped labels,
     overlapping shortcut cards, broken touch targets, or unreadable wrapping.
2. Memory inbox route:
   - `/studio/personas/[personaId]/memory-inbox` loads as an owner workspace
     route on desktop, `375px`, and `390px`;
   - heading, copy, summary counters, empty/loading/error states, and candidate
     cards fit Tex's current Studio visual language;
   - it links back to the companion home surface and does not look like a copied
     Discern skin.
3. Candidate readback:
   - if no import-backed candidates exist, empty state is honest and does not
     imply broken behavior;
   - if import-backed candidates exist, visible rows show only accepted safe
     readback: title/content candidate text, rationale/status, safe source
     label/class, destination, and owner action copy;
   - accept/reject writes should be rehearsed only on an explicitly disposable
     persona/candidate. If no safe disposable candidate exists, perform a
     no-write rehearsal and say so.
4. Existing surfaces:
   - `/memory` still renders saved memory lifecycle/runtime explanation;
   - private chat still renders after the new fifth shortcut;
   - Archive/files import review defaults remain visibly unchanged if checked;
   - no unrelated public pages, billing, Developer Space, Archive connector,
     global shell, or theme drift appears.
5. Scope and privacy:
   - no `source=all` inbox behavior, archived-chat candidate generalization,
     stale `/conversations/candidates/inbox` endpoint, return-to-thread
     behavior, prompt/presence context, API changes, migrations, hosted runtime,
     Archive Connector behavior, billing, queues/workers, Redis, Cloudflare,
     social connectors, public writes, broad shell work, or Discern CSS drift
     appears;
   - no private ids, raw source ids/table names, storage paths, raw source
     bodies beyond candidate content, compiled prompts, provider payloads,
     tokens, cookies, SQL/table details, stack traces, hosted logs, or
     secret-shaped values render.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_SCOPE_FAIL
```

Use `PASS_READY_TO_CLOSE` only if the hosted desktop/mobile shortcut strip,
`/memory-inbox` route, safe readback/empty state, existing surface continuity,
and privacy/scope checks pass.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as missing `Inbox`,
wrong route target, broken five-shortcut wrapping, unusable mobile layout,
confusing empty/error copy, incorrect Archive/files copy regression, or visible
regression to private chat or existing persona pages.

Use `PRIVACY_OR_SCOPE_FAIL` if private material leaks or if PR485B visibly
drifts into forbidden `source=all`, stale Discern endpoint, return-to-thread,
prompt/presence, Archive connector, infra, public-write, broad reskin, or
Discern CSS behavior.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR485B Memory / continuity candidate inbox hosted rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_SCOPE_FAIL
Task:
- Close PR485B, wait for deploy, route the smallest DAEDALUS repair, or handle the privacy/scope failure.
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR485B Memory / continuity candidate inbox after DAEDALUS added the web-only import-backed owner `/memory-inbox` route and separate `Inbox` shortcut.
- This visible owner workspace change needs hosted desktop plus 375px/390px mobile rehearsal before MIMIR closes it.
Task:
- Rehearse hosted `/studio/personas/[personaId]` and `/studio/personas/[personaId]/memory-inbox` at app commit `a5fade6a` or later.
- Verify the five-shortcut strip fits and routes correctly, Memory still points to `/memory`, Inbox points to `/memory-inbox`, and the inbox route has honest empty/error/populated states.
- Confirm private chat, `/memory`, and existing owner surfaces still render, no Archive/files copy regression appears if checked, and no private/secret-shaped material leaks.
- Wake MIMIR with PASS_READY_TO_CLOSE, PRODUCT_DEFECT_NEEDS_DAEDALUS, DEPLOYMENT_WAITING, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Do not widen into `source=all`, archived-chat inbox generalization, stale Discern candidate endpoint, return-to-thread behavior, prompt/presence context, API changes, migrations, infra, Archive Connector, billing, public writes, broad shell work, or Discern CSS.
```

