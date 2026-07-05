# PR485C - Return-To-Thread Readback Closeout

Owner: MIMIR / A1

Date closed: 2026-07-05

Status: Closed - accepted and hosted-rehearsed

## Result

PR485C is closed as `PASS_READY_TO_CLOSE`.

ARGUS accepted DAEDALUS' implementation without a review patch:

`docs/roadmap/PR485C_RETURN_TO_THREAD_READBACK_REVIEW_RESULT.md`

ARIADNE then passed hosted desktop and mobile rehearsal:

`docs/roadmap/PR485C_RETURN_TO_THREAD_READBACK_REHEARSAL_RESULT.md`

## Accepted Product Truth

The owner persona chat route now has a compact return-to-thread card inside the
existing `PersonaChat` surface.

Accepted behavior:

- the card renders for active existing conversations with non-system messages;
- empty/new chats do not show misleading return controls;
- archived chats remain read-only and do not show active-thread return controls;
- `Continue` focuses the existing composer only;
- `Summarize` pre-fills an owner-editable recap request only;
- `Start fresh` clears local active-thread state only;
- the owner must still press `Send` for any LLM call;
- the existing streaming send path, provider setup/error posture, archived
  read-only recovery path, PR485A shortcuts, and PR485B Memory inbox separation
  remain intact.

## Hosted Proof

ARIADNE verified hosted Railway web/API at app commit `72dc8833` on desktop,
`375px`, and `390px`.

The rehearsal passed:

- active return-card rendering;
- local action behavior without return-card network requests;
- archived read-only behavior;
- shortcut route continuity;
- Memory and Memory inbox separation;
- privacy and scope checks.

ARIADNE performed one explicit synthetic owner-send setup to create an active
latest route for the proof. That setup used the existing UI `Send` path and was
not an automatic return-card action.

## Not In PR485C

These remain separate future lanes if needed:

- query-param or route-selected conversation loading;
- active-thread seed hygiene;
- durable summary storage;
- automatic summary or LLM calls;
- prompt/retrieval/provider/runtime changes;
- Memory inbox behavior changes;
- Archive connector behavior;
- public chat behavior;
- billing, queues/workers, Redis, Cloudflare, social connectors, public writes,
  broad shell work, or Discern CSS.

## Next Lane

MIMIR is opening PR485D for hostile preflight of the remaining Discern companion
UX translation target: companion capability and presence prompt context.
