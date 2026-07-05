# PR494 - Discern Companion Home Context Translation Preflight

Date opened: 2026-07-05

Owner: ARGUS / A3

State: OPEN_PREFLIGHT

## Source References

Treat these Discern-AI/Station commits as reference implementations, not patches
to merge wholesale:

- `de7b918e` - `feat: refine Station companion UX`
- `99ae8a5c` - `feat: refine Studio chat layout`

MIMIR inspected the commit surfaces before opening this lane. The commits include
broad global CSS, Studio shell/sidebar/topbar experiments, private chat layout
work, a Discern `StudioRightPanel`, companion shortcut/readback ideas, and
prompt-context helpers.

## Already Translated In Tex Station

Do not reopen these as if they were missing:

- PR485A: companion shortcut strip for Memory, Inbox, Timeline, Profile, and
  Integrity.
- PR485B: `/studio/personas/[personaId]/memory-inbox` over existing
  import-backed candidate review APIs.
- PR485C: return-to-thread readback with local `Continue`, `Summarize`, and
  `Start fresh` behavior.
- PR485D: private companion capability/presence prompt context.
- PR485E: local private chat surface polish inside Tex Station's current Studio
  design language.

## MIMIR Assessment

The useful remaining Discern delta is not another broad reskin. It is a more
complete companion home around the existing private chat:

- chat-adjacent owner context that makes Memory, Canon, Archive, continuity,
  and inbox state easier to read while talking;
- a compact companion-home rail or panel that uses already-owned Tex Station
  data and links to accepted routes;
- optional chat-local provider/capability/readiness readback where it adds
  clarity without duplicating the existing persona header;
- no Discern-only skin, no wholesale `globals.css`, and no unrelated page
  reskin.

The most likely first implementation slice is:

```text
PR494A - Companion Home Context Rail
```

## PR494A Candidate Scope

ARGUS should hostile-preflight a web-only first slice that:

- keeps the existing persona home route:
  `/studio/personas/[personaId]`;
- keeps the existing `PersonaChat` send/archive/save-memory/promote-canon/
  candidate-review behavior intact;
- adds or refines a chat-adjacent companion context rail/panel using existing
  already-loaded persona continuity summary, existing owner routes, and safe
  owner-only readback;
- highlights the Memory inbox as a candidate-review stop without reviving
  Discern's stale/generalized inbox assumptions;
- keeps shortcut labels consistent with the accepted Tex route map:
  Memory, Inbox, Timeline, Profile, Integrity;
- keeps return-to-thread actions exactly as accepted in PR485C unless ARGUS
  names a narrow reason to alter them;
- may add helper/static tests proving route links, copy, and no forbidden
  controls if implementation is web-only.

## Hard Boundaries

Reject or patch any plan that imports or implies:

- Discern global CSS or broad page reskin;
- Studio sidebar/topbar replacement;
- `StudioRightPanel` copied verbatim;
- stale `/conversations/candidates/inbox` or `source=all` candidate behavior;
- API routes, migrations, provider routing, retrieval, queue/worker, Redis,
  Cloudflare, Stripe, billing, connector, or public chat changes;
- unwired controls such as More/options, copy, regenerate, Save to notes,
  attach, mic, tools, or publish actions unless the current Tex route already
  supports them and focused tests prove them;
- durable presence, mood, intimacy, or hidden autonomy claims;
- public exposure of private Memory, Canon, Archive, source body, raw id,
  provider payload, token, cookie/header, IP/user-agent, prompt, or
  secret-shaped values.

## ARGUS Task

Review the current Tex persona home/chat surface against the two Discern commits
and this preflight. Return one of:

```text
ACCEPT_PR494A_COMPANION_HOME_CONTEXT_RAIL
PATCH_PR494_PREFLIGHT
DEFER_PR494_DUPLICATE_OF_PR485
BLOCKED_BY_MISSING_TEX_DATA
```

If accepted, wake DAEDALUS with the exact scoped implementation task. If patched
or blocked, wake MIMIR with the corrected boundary and the smallest next move.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- PR493A Persona Roulette Visitor Encounter is closed after ARIADNE returned PASS_READY_FOR_PR493A_CLOSEOUT.
- MIMIR inspected Discern commits de7b918e and 99ae8a5c as references only.
- Tex already closed PR485A-E for shortcuts, Memory inbox, return-to-thread, prompt context, and chat polish.
Task:
- Hostile-preflight PR494A Companion Home Context Rail against this document.
- Accept, patch, defer as duplicate, or return a concrete blocker.
- If accepted, wake DAEDALUS with the exact scoped implementation task.
```
