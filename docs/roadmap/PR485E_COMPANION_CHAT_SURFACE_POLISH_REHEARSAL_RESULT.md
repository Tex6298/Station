# PR485E - Companion Chat Surface Polish Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-07-05

Status: Pass - ready for MIMIR closeout

## Verdict

```text
PASS_READY_TO_CLOSE
```

ARIADNE completed the hosted desktop and mobile rehearsal for the PR485E
private `PersonaChat` polish.

## Environment

- Hosted web health: ready at app commit `a0dc474f`.
- Hosted API health: ready at app commit `a0dc474f`.
- Primary route checked:
  - `/studio/personas/[personaId]`
- Existing-surface routes checked:
  - `/studio/personas/[personaId]/memory`
  - `/studio/personas/[personaId]/memory-inbox`
- Public no-drift route checked:
  - `/personas/[publicSlug]`
- Replay-owner sign-in and `/auth/me` passed.
- Deployment ids, replay credentials, tokens, cookies, raw owner ids, raw
  persona ids, conversation ids, source ids, source bodies, prompt payloads,
  provider payloads, and private chat text were not recorded.

## Hosted Data

Hosted replay data used for this rehearsal:

| Readback | Count |
| --- | ---: |
| Owner personas | 3 |
| Owner conversations | 29 |
| Active latest visible messages | 2 |
| Archived candidate cards available | 2 |

The active latest thread had visible owner messages but no assistant action row
in that active route. The archived hosted conversation used for read-only proof
included an assistant message, the existing `Save to memory` / `Promote to
canon` action row, and a continuity-candidate archive panel.

## Active Route

`/studio/personas/[personaId]` passed on desktop, `375px`, and `390px`.

Passed:

- polished private chat header rendered;
- `Active` state and message count rendered;
- active message rows rendered;
- PR485C return card rendered;
- PR485A/PR485B shortcuts remained present and routeable: Memory, Inbox,
  Timeline, Profile, and Integrity;
- composer and `Send` control fit the current Studio surface;
- no horizontal overflow, clipped labels, overlapping controls, unreadable
  wrapping, unstable button layout, or broken touch targets appeared;
- no fake placeholder controls appeared: no Attach, mic, tools, copy,
  regenerate, notes, menu, or similar unwired controls;
- no secret-shaped values rendered.

Local return-card actions passed:

- `Continue` focused the composer only and issued no network request;
- `Summarize` pre-filled an owner-editable recap request only, focused the
  composer, and issued no network request;
- `Start fresh` locally cleared the active thread state, showed the honest
  empty/new state, and issued no network request;
- the owner still had to press `Send` for any LLM call.

## Archived Route And Candidate Panel

Because the latest hosted route was active, ARIADNE used an existing archived
owner conversation with a no-write test-only list interception so the existing
hosted archived record was the one loaded by the page. This did not add query
params, route-selected conversation loading, product code, API behavior, or
hosted data writes.

Desktop, `375px`, and `390px` passed:

- `Archived` state rendered;
- no return card rendered;
- `New chat` recovery rendered and locally produced a New empty state;
- composer remained disabled until `New chat`;
- send control remained in the `Archived` state;
- active `Archive` control was not exposed;
- existing archive/candidate panel rendered;
- two continuity-candidate cards rendered;
- existing assistant action row rendered with the wired `Save to memory` and
  `Promote to canon` actions;
- no horizontal overflow, clipped controls, placeholder controls, or
  secret-shaped values appeared.

## Safe Send And Error State

ARIADNE performed one explicit synthetic owner `Send` on the active route to
exercise the existing streaming/status/error path. This was a deliberate
rehearsal action, not an automatic return-card action.

Passed:

- the request used the existing `/conversations/persona/[personaId]/chat/stream`
  path;
- pending status UI appeared;
- provider setup/error guidance rendered honestly;
- failed-send input was restored;
- the return card remained available after the failed send;
- no provider payload, token, cookie, raw id, prompt, stack trace, SQL detail,
  hosted log, or secret-shaped value rendered.

## Existing Surfaces

Passed:

- `/memory` still loaded as the saved Memory owner workspace;
- `/memory-inbox` still loaded as the separate import-backed Memory inbox;
- Memory and Memory inbox remained distinct routes.

## Public Chat No-Drift

The public persona route loaded on mobile. It did not render the private
`.studio-persona-chat` surface, private `PersonaChat` copy, return-card copy,
or private assistant actions. No secret-shaped values rendered.

## Privacy And Scope

Passed:

- No token, cookie, raw owner id, raw persona id, conversation id, source id,
  storage path, secret-shaped value, SQL detail, stack trace, hosted log,
  compiled prompt, provider payload, private source body, or private chat body
  rendered in visible text.
- No API change, migration, prompt/retrieval/provider/runtime change,
  token-accounting change, route-query behavior, route-selected conversation
  loading, automatic LLM call, automatic summary, durable storage, Memory inbox
  behavior change, Archive connector behavior change, public chat behavior
  change, infra, broad shell work, Discern global CSS, or placeholder/unwired
  control drift appeared.

## Validation

Passed:

```text
npm exec --yes --package=@playwright/test -- playwright test pr485e-chat-polish-rehearsal.spec.js --reporter=line --workers=1 --output=.codex-tmp\pw-pr485e-output
```

Result:

```text
1 passed
```

The temporary harness and Playwright output were removed before commit.

## Recommendation

MIMIR can close PR485E as `PASS_READY_TO_CLOSE`.
