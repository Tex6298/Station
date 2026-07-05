# PR494B - Discern Companion Home Completion Preflight

Date opened: 2026-07-05

Owner: ARGUS / A3

State: OPEN_PREFLIGHT

## Source References

Treat these Discern-AI/Station commits as reference implementations, not patches
to merge wholesale:

- `de7b918e` - `feat: refine Station companion UX`
- `99ae8a5c` - `feat: refine Studio chat layout`

MIMIR re-inspected the commit surfaces before opening this preflight. The
Discern commits include broad global CSS, Studio shell/sidebar/topbar
experiments, a copied-style `StudioRightPanel`, Memory/Canon/Archive side-panel
ideas, private chat layout work, shortcut/readback ideas, a stale generalized
candidate inbox endpoint, and private companion prompt-context helpers.

## Already Translated In Tex Station

Do not reopen these as if they are missing:

- PR485A: companion shortcut strip for Memory, Inbox, Timeline, Profile, and
  Integrity.
- PR485B: `/studio/personas/[personaId]/memory-inbox` over existing
  import-backed candidate review APIs.
- PR485C: return-to-thread readback with local `Continue`, `Summarize`, and
  `Start fresh` behavior.
- PR485D: private companion capability/presence prompt context.
- PR485E: local private chat surface polish inside Tex Station's current Studio
  design language.
- PR494A: owner-only Companion Home Context Rail beside `PersonaChat`, using
  already-loaded persona fields and aggregate continuity counts.

Current Tex Station also keeps `RuntimeContextPreview`, archive/export readback,
continuity documents, readiness gates, and private `PersonaChat` behavior in the
existing owner persona home route:

`apps/web/app/studio/personas/[personaId]/page.tsx`

## MIMIR Assessment

The safe Discern companion-home translation may now be complete. ARGUS should
not force a code lane just because the reference commits still contain visual
or shell material.

The only acceptable PR494B implementation would be a narrow companion-home
synthesis improvement that:

- improves the owner persona home or private chat sensemaking using existing
  Tex Station data;
- stays inside current route/component boundaries;
- does not duplicate PR485A-E or PR494A;
- does not import Discern global CSS, shell layout, or `StudioRightPanel`;
- does not expose private source bodies, raw ids, prompts, provider payloads,
  auth material, or secret-shaped values;
- does not add unwired placeholder controls.

If ARGUS cannot name one concrete user-visible behavior that is missing after
PR485A-E and PR494A, the correct verdict is to close the Discern companion-home
translation as complete and wake MIMIR to choose the next customer-facing lane.

## Candidate Slice If Accepted

Only accept PR494B if the review finds a real gap such as:

- a small owner-visible first-use or empty-thread companion-home cue that is not
  already covered by `PersonaChat` empty state, shortcut strip, or context rail;
- a route-local readability/readback fix that makes the existing companion home
  easier to understand without changing data contracts;
- a tiny integration polish between the context rail and the existing private
  chat/card layout that can be proven with static tests and hosted rehearsal.

Any accepted slice must be web-only unless ARGUS names a concrete missing API
that cannot be avoided. Prefer no new API, no migration, and no provider/runtime
change.

## Hard Boundaries

Reject or patch any plan that imports or implies:

- Discern `globals.css` or broad page reskin;
- Studio sidebar/topbar replacement;
- copied `StudioRightPanel`;
- stale `/conversations/candidates/inbox` or `source=all` behavior;
- route-selected conversations, automatic summaries, durable presence, mood,
  intimacy, hidden autonomy, or relationship-state claims;
- API routes, migrations, prompt/retrieval/provider routing, queue/worker,
  Redis, Cloudflare, Stripe, billing, connector, OAuth, or public chat changes;
- private Memory, Canon, Archive, source body, raw id, provider payload, token,
  cookie/header, IP/user-agent, prompt, or secret-shaped public/readback leaks;
- placeholder controls such as attach, mic, tools, copy, regenerate, notes,
  menu, or publish unless the current Tex route already supports them and tests
  prove the action works.

## ARGUS Task

Review the current Tex persona home/chat surface against the two Discern
commits and the closed PR485A-E/PR494A work. Return one of:

```text
CLOSE_PR494_NO_REMAINING_COMPANION_DELTA
ACCEPT_PR494B_COMPANION_HOME_SYNTHESIS
PATCH_PR494B_PREFLIGHT
BLOCKED_BY_MISSING_PRODUCT_DELTA
```

If accepted, wake DAEDALUS with the exact scoped implementation task and file
boundary. If closed, patched, or blocked, wake MIMIR with the reason and the
smallest next move.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR494A Companion Home Context Rail is closed after ARIADNE returned PASS_READY_FOR_PR494A_CLOSEOUT.
- MIMIR re-inspected Discern commits de7b918e and 99ae8a5c as references only.
- PR485A-E plus PR494A already cover shortcuts, Memory inbox, return-to-thread, prompt context, chat polish, and the owner-only context rail.
Task:
- Hostile-preflight PR494B against this document.
- Accept exactly one narrow remaining companion-home synthesis slice, patch the boundary, block with a concrete missing product delta, or close PR494 as complete if the remaining Discern material is duplicate/unsafe/skin.
- If accepted, wake DAEDALUS with the exact implementation scope. Otherwise wake MIMIR with the verdict.
```
