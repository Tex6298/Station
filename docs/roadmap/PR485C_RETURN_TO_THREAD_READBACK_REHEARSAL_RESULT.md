# PR485C - Return-To-Thread Readback Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-07-05

Status: Pass - ready for MIMIR closeout

## Verdict

```text
PASS_READY_TO_CLOSE
```

ARIADNE completed the hosted desktop and mobile rehearsal for the PR485C
return-to-thread card on the owner persona route.

## Environment

- Hosted web health: ready at app commit `72dc8833`.
- Hosted API health: ok at app commit `72dc8833`.
- Route checked:
  - `/studio/personas/[personaId]`
- Existing-surface routes checked:
  - `/studio/personas/[personaId]/memory`
  - `/studio/personas/[personaId]/memory-inbox`
  - `/studio/personas/[personaId]/continuity`
  - `/studio/personas/[personaId]/edit`
  - `/studio/personas/[personaId]/calibration`
- Replay-owner sign-in and `/auth/me` passed.
- Deployment ids, replay credentials, tokens, cookies, raw owner ids, raw
  persona ids, conversation ids, source ids, source bodies, prompt payloads,
  provider payloads, and private chat text were not recorded.

## Hosted Data Note

The replay owner did not initially expose an active non-empty latest
conversation for the route-level return-card proof. ARIADNE performed one
synthetic owner-send setup through the existing UI `Send` control so the hosted
route had an active latest thread. This was an explicit rehearsal setup action,
not an automatic return-card action.

After setup, hosted readback found:

| Readback | Count |
| --- | ---: |
| Owner personas | 3 |
| Owner conversations | 29 |
| Active latest route available | 1 |
| Existing archived conversations available | yes |

No raw identifiers or private message bodies were recorded.

## Active Thread Route

`/studio/personas/[personaId]` rendered the compact
`Return to this thread` card on desktop, `375px`, and `390px`.

Passed:

- the return card appeared only on the active existing thread with visible
  non-system messages;
- the five PR485A/PR485B companion shortcuts remained present and routeable:
  Memory, Inbox, Timeline, Profile, and Integrity;
- desktop, `375px`, and `390px` showed no horizontal overflow, clipped labels,
  overlapping controls, unreadable wrapping, or broken button layout;
- `Continue` focused the existing composer only;
- `Continue` did not mutate composer text and did not issue a network request;
- `Summarize` pre-filled an owner-editable recap request only;
- `Summarize` focused the composer and did not issue a network request;
- `Start fresh` locally cleared the active thread state, hid the return card,
  showed the empty chat state, and did not issue a network request;
- the owner still had to press `Send` for any LLM call.

## Archived Thread Route

After the synthetic setup, no persona had an archived conversation as the latest
conversation. To verify the archived read-only surface without mutating hosted
data or adding route/query behavior, ARIADNE used an existing archived owner
conversation with a test-only list interception so the existing hosted archived
record was the one loaded by the page.

Desktop, `375px`, and `390px` passed:

- no return card rendered for the archived conversation;
- the existing `Archived` state rendered;
- the existing `New chat` recovery action rendered;
- the chat composer remained disabled;
- the send button remained in the `Archived` state;
- the active `Archive` control was not exposed;
- no horizontal overflow or visible secret-shaped values appeared.

The interception was part of the temporary browser harness only. It did not add
query params, route-selected conversation loading, product code, API behavior,
or hosted data writes.

## Existing Surface Checks

Passed:

- `/memory` still loaded as the saved Memory owner workspace;
- `/memory-inbox` still loaded as the separate import-backed Memory inbox;
- Memory and Memory inbox remained distinct routes;
- Timeline, Profile, and Integrity owner routes still loaded.

## Privacy And Scope

Passed:

- No token, cookie, raw owner id, raw persona id, conversation id, source id,
  storage path, secret-shaped value, SQL detail, stack trace, hosted log,
  compiled prompt, provider payload, or private source body rendered in visible
  text.
- The return-card actions did not use query-param route selection,
  route-selected conversation loading, automatic summary or LLM calls, durable
  summary storage, API changes, prompt or retrieval changes, provider/runtime
  changes, token-accounting changes, Archive connector behavior, Memory inbox
  behavior, billing, queues/workers, Redis, Cloudflare, social connectors,
  public writes, broad shell work, or Discern CSS.

## Validation

Passed:

```text
npm exec --yes --package=@playwright/test -- playwright test pr485c-return-thread-rehearsal.spec.js --reporter=line --workers=1 --output=.codex-tmp\pw-pr485c-output
```

Result:

```text
1 passed
```

The temporary harness and Playwright output were removed before commit.

## Recommendation

MIMIR can close PR485C as `PASS_READY_TO_CLOSE`.
