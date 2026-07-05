# PR485E - Companion Chat Surface Polish Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted human-eye rehearsal

## Why This Rehearsal

ARGUS accepted DAEDALUS' PR485E implementation without a review patch:

`docs/roadmap/PR485E_COMPANION_CHAT_SURFACE_POLISH_REVIEW_RESULT.md`

PR485E is a visible owner chat-surface polish on the existing persona route:

```text
/studio/personas/[personaId]
```

The implementation replaced inline `PersonaChat` visual styling with scoped
`.studio-persona-chat-*` CSS and polished the existing private chat header,
return card, message rows, live assistant actions, status/error states, archived
read-only state, candidate/archive panel, and composer fit.

Because this changes hosted owner-visible UI, MIMIR routes ARIADNE for desktop
and mobile human-eye proof before closeout.

## Hosted Target

Use hosted Railway Station:

```text
https://stationweb-production.up.railway.app
```

Use a signed-in staging owner persona route. Prefer the existing replay owner
persona if available, but any owner persona route is acceptable if it exercises
the same `/studio/personas/[personaId]` private `PersonaChat` surface.

Freshness target:

```text
a0dc474f web: polish persona chat surface
```

Hosted web/API should be at `a0dc474f` or later, or at a deploy-equivalent app
commit if later commits are docs/state only. If freshness is not deployed,
return a concrete deployment/freshness blocker and do not widen scope.

## Required Checks

ARIADNE should verify only the accepted PR485E visible boundary.

1. Private chat surface fit:
   - signed-in owner can open `/studio/personas/[personaId]`;
   - the polished private chat header, message count/state readback, message
     rows, assistant action row, composer, status/error copy, and existing
     archive/candidate panel fit Tex Station's current Studio visual language;
   - desktop, `375px`, and `390px` show no horizontal overflow, clipped labels,
     overlapping controls, unreadable wrapping, unstable button layout, or
     broken touch targets.
2. Active existing thread:
   - an active existing conversation with non-system messages still shows the
     PR485C return card;
   - `Continue` remains focus-only;
   - `Summarize` remains prefill-only;
   - `Start fresh` remains local-only;
   - no action sends automatically or creates a durable summary.
3. Empty, archived, and recovery states:
   - a brand-new or empty chat has an honest empty/new-chat state;
   - an archived conversation remains read-only;
   - `New chat` recovery is visible and usable from an archived thread;
   - provider setup/error states remain honest if safely triggerable without
     exposing secrets or faking provider behavior.
4. Sending and live actions:
   - a safe chat smoke, if performed, still uses the existing streaming send
     path and visible status/error behavior;
   - live assistant actions remain the existing wired actions only, such as
     `Save to memory`, `Promote to canon`, candidate accept/reject, archive,
     new chat, and send;
   - no Attach, mic, tools, copy, regenerate, notes, menu, or similar
     placeholder/unwired controls appear.
5. Existing surfaces:
   - PR485A companion shortcuts still render and route correctly;
   - Memory and Memory inbox remain separate routes;
   - public persona chat is unaffected;
   - Archive connector, source inventory, import behavior, Developer Space,
     billing, global shell, and unrelated public pages show no visible drift if
     encountered.
6. Scope and privacy:
   - no API change, migration, prompt/retrieval/provider/runtime change,
     token-accounting change, route-query behavior, route-selected
     conversation loading, automatic LLM call, automatic summary, durable
     summary/presence storage, Memory inbox behavior change, Archive connector
     behavior change, infra, public write, broad shell work, or Discern global
     CSS behavior appears;
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

Use `PASS_READY_TO_CLOSE` only if hosted desktop/mobile visual fit, active
thread behavior, empty/archived/recovery states, live action honesty, existing
surface continuity, and privacy/scope checks pass.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as mobile layout
breakage, clipped controls, misleading placeholder actions, broken return-card
behavior, broken archived read-only recovery, confusing provider/error copy, or
visible regression to private chat or existing persona pages.

Use `PRIVACY_OR_SCOPE_FAIL` if private material leaks or if PR485E visibly
drifts into forbidden API, prompt/runtime, route-query, Memory inbox, Archive
connector, infra, public-write, broad reskin, Discern CSS, or public chat
behavior.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR485E Companion Chat Surface Polish hosted rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_SCOPE_FAIL
Task:
- Close PR485E, wait for deploy, route the smallest DAEDALUS repair, or handle the privacy/scope failure.
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR485E Companion Chat Surface Polish after DAEDALUS polished the private PersonaChat surface with scoped .studio-persona-chat-* CSS.
- This visible owner chat-surface change needs hosted desktop plus 375px/390px mobile human-eye rehearsal before MIMIR closes it.
Task:
- Rehearse hosted /studio/personas/[personaId] at app commit a0dc474f or later.
- Verify active thread with return card, empty/new chat, archived read-only with New chat recovery, safe sending/status and provider setup/error states if triggerable, existing archive/candidate panel if present, shortcut route continuity, Memory/Memory inbox separation, public chat no-drift, visual fit, honesty, and no secret-shaped visible readback.
- Confirm there are no fake placeholder controls such as Attach, mic, tools, copy, regenerate, notes, or menus.
- Wake MIMIR with PASS_READY_TO_CLOSE, PRODUCT_DEFECT_NEEDS_DAEDALUS, DEPLOYMENT_WAITING, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Do not widen into API changes, migrations, prompt/retrieval/provider/runtime changes, route-query behavior, automatic LLM calls, durable storage, Memory inbox changes, Archive connector behavior, public chat behavior, infra, broad shell work, Discern global CSS, or placeholder/unwired controls.
```
