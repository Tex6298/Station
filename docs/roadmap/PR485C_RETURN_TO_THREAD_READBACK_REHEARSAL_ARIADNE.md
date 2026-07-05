# PR485C - Return-To-Thread Readback Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted human-eye rehearsal

## Why This Rehearsal

ARGUS accepted DAEDALUS' PR485C implementation without a review patch:

`docs/roadmap/PR485C_RETURN_TO_THREAD_READBACK_REVIEW_RESULT.md`

PR485C is a visible owner chat-surface change on the existing persona route:

```text
/studio/personas/[personaId]
```

The implementation adds a compact return-to-thread card inside the existing
`PersonaChat` surface. Because this changes the hosted owner chat experience,
MIMIR routes ARIADNE for desktop and mobile human-eye proof before closeout.

## Hosted Target

Use hosted Railway Station:

```text
https://stationweb-production.up.railway.app
```

Use a signed-in staging owner persona route with an active existing conversation
that contains non-system messages. Prefer the existing replay owner persona if
available, but any owner persona route is acceptable if it exercises the same
`/studio/personas/[personaId]` chat surface.

Freshness target:

```text
72dc8833 web: add persona return thread card
```

Hosted web/API should be at `72dc8833` or later, or at a deploy-equivalent app
commit if later commits are docs/state only. If freshness is not deployed,
return a concrete deployment/freshness blocker and do not widen scope.

## Required Checks

ARIADNE should verify only the accepted PR485C visible boundary.

1. Return card rendering:
   - signed-in owner can open `/studio/personas/[personaId]`;
   - an active existing conversation with non-system messages shows the compact
     return-to-thread card;
   - a brand-new empty chat does not show a misleading return card;
   - an archived conversation remains read-only and does not show active-thread
     controls;
   - desktop, `375px`, and `390px` show no horizontal overflow, clipped labels,
     overlapping controls, unreadable wrapping, or broken touch targets.
2. Local actions:
   - `Continue` focuses the existing composer only and does not send, mutate
     text, change provider/runtime state, or create a new thread;
   - `Summarize` pre-fills an owner-editable recap request only, focuses the
     composer, and does not send automatically;
   - `Start fresh` locally clears the active thread state so the next send
     starts without a carried `conversationId`;
   - the owner must still press `Send` for any LLM call.
3. Existing chat behavior:
   - a safe chat smoke, if performed, still uses the existing streaming send
     path and visible provider setup/error behavior;
   - failed-send input restoration still behaves as before;
   - archived conversations still expose only the existing `Archived` / `New
     chat` recovery path.
4. Existing surfaces:
   - the PR485A companion shortcut strip still renders and routes;
   - the PR485B Memory inbox route remains separate from the Memory route;
   - no unrelated public pages, billing, Developer Space, Archive connector,
     global shell, or theme drift appears.
5. Scope and privacy:
   - no query-param route selection, route-selected conversation loading,
     automatic summary/LLM call, durable summary storage, API change, prompt or
     retrieval change, provider/runtime change, token-accounting change, Archive
     connector behavior, Memory inbox behavior, billing, queues/workers, Redis,
     Cloudflare, social connector, public write, broad shell work, or Discern
     CSS drift appears;
   - no private ids, owner ids, conversation ids, source ids, raw source bodies,
     compiled prompts, provider payloads, tokens, cookies, SQL/table details,
     stack traces, hosted logs, or secret-shaped values render.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_SCOPE_FAIL
```

Use `PASS_READY_TO_CLOSE` only if the hosted desktop/mobile return-card
rendering, local action behavior, existing chat continuity, existing surface
continuity, and privacy/scope checks pass.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as a missing return
card on an active existing thread, a card that appears on empty or archived
threads, a button that sends automatically, mobile layout breakage, confusing
copy, failed local `Start fresh`, or visible regression to private chat or
existing persona pages.

Use `PRIVACY_OR_SCOPE_FAIL` if private material leaks or if PR485C visibly
drifts into forbidden query-param routing, automatic summary calls, durable
summary storage, API/provider/runtime changes, Memory inbox changes, Archive
connector behavior, infra, public-write, broad reskin, or Discern CSS behavior.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR485C Return-To-Thread Readback hosted rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_SCOPE_FAIL
Task:
- Close PR485C, wait for deploy, route the smallest DAEDALUS repair, or handle the privacy/scope failure.
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR485C Return-To-Thread Readback after DAEDALUS added the compact owner return card inside existing PersonaChat.
- This visible owner chat-surface change needs hosted desktop plus 375px/390px mobile rehearsal before MIMIR closes it.
Task:
- Rehearse hosted `/studio/personas/[personaId]` at app commit `72dc8833` or later.
- Verify active existing conversations show the return card; empty/new and archived chats do not expose misleading active-thread controls.
- Verify Continue focuses only, Summarize pre-fills only, Start fresh is local-only, and the owner must still press Send for any LLM call.
- Confirm streaming/error behavior, archived read-only behavior, PR485A shortcuts, and PR485B Memory inbox separation still hold.
- Wake MIMIR with PASS_READY_TO_CLOSE, PRODUCT_DEFECT_NEEDS_DAEDALUS, DEPLOYMENT_WAITING, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Do not widen into query params, route-selected conversation loading, automatic summary/LLM calls, durable summary storage, API changes, prompt/retrieval/provider/runtime changes, token-accounting changes, Archive connector behavior, Memory inbox behavior, infra, public writes, broad shell work, or Discern CSS.
```
