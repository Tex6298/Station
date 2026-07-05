# PR485B - Memory And Continuity Candidate Inbox Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-07-05

Status: Pass - ready for MIMIR closeout

## Verdict

```text
PASS_READY_TO_CLOSE
```

ARIADNE completed the hosted desktop and mobile rehearsal for the PR485B
five-shortcut companion strip and import-backed Memory inbox route.

## Environment

- Hosted web health: ready at app commit `a5fade6a`.
- Hosted API health: ready at app commit `a5fade6a`.
- Routes checked:
  - `/studio/personas/[personaId]`
  - `/studio/personas/[personaId]/memory-inbox`
  - `/studio/personas/[personaId]/memory`
  - `/studio/personas/[personaId]/files`
- Replay-owner sign-in, `/auth/me`, and persona readback passed.
- Deployment ids, replay credentials, tokens, cookies, raw owner ids, raw
  persona ids, conversation ids, candidate ids, source labels, source bodies,
  and private candidate text were not recorded.

## Candidate Readback

The inbox used the accepted import-backed owner query:

```text
GET /conversations/persona/[personaId]/candidates?source=import&status=all
```

Hosted data was populated:

| Readback | Count |
| --- | ---: |
| Total candidates | 8 |
| Pending | 2 |
| Reviewed | 6 |
| Memory candidates | 4 |
| Canon candidates | 4 |

All summarized candidate source classes came from private persona-file imports.
No accept/reject write was rehearsed because no explicitly disposable
candidate was provided; this was a no-write rehearsal.

## Companion Home

The owner persona home shortcut strip rendered five links:

| Shortcut | Target |
| --- | --- |
| Memory | `/studio/personas/[personaId]/memory` |
| Inbox | `/studio/personas/[personaId]/memory-inbox` |
| Timeline | `/studio/personas/[personaId]/continuity` |
| Profile | `/studio/personas/[personaId]/edit` |
| Integrity | `/studio/personas/[personaId]/calibration` |

Desktop and mobile checks passed:

| Viewport | Result | Notes |
| --- | --- | --- |
| Desktop `1440px` | Pass | Five compact shortcut cards rendered without overflow. |
| Mobile `375px` | Pass | Shortcut cards stacked cleanly with no clipping. |
| Mobile `390px` | Pass | Shortcut cards stacked cleanly with no clipping. |

Private chat still rendered with the existing composer, and Continuity Brief,
Runtime Context, and Published Continuity remained present.

## Memory Inbox Route

`/studio/personas/[personaId]/memory-inbox` loaded as an owner workspace route
on all three viewports.

Passed:

- breadcrumb and `Owner Review` heading rendered;
- `Memory inbox` and `Import-backed Memory and Canon candidates` copy rendered;
- summary counters rendered for Pending, Reviewed, Memory, and Canon;
- populated candidate-card state rendered for the hosted data;
- Home, Memory, Timeline, and Integrity route links fit without clipping;
- no horizontal overflow appeared on desktop, `375px`, or `390px`.

The route used the existing import-backed candidate read API only. No
`source=all` query, stale `/conversations/candidates/inbox` endpoint, or
mutating review request fired during the rehearsal.

## Existing Surface Checks

Passed:

- `/memory` still loaded as the saved Memory owner workspace.
- `/files` still loaded with the existing Archive/files import review copy;
  the Memory Inbox copy did not replace the Archive tab defaults.
- Existing owner route targets for Timeline, Profile, and Integrity still
  loaded.

## Privacy And Scope

Passed:

- No token, cookie, raw owner id, raw persona id, candidate id, conversation id,
  storage path, secret-shaped value, SQL detail, stack trace, hosted log,
  compiled prompt, or provider payload rendered in visible text.
- No `source=all` inbox behavior, archived-chat inbox generalization, stale
  Discern candidate endpoint, return-to-thread behavior, prompt/presence
  context, API change, migration, infra change, Archive Connector behavior,
  billing, public write, broad shell work, or Discern CSS drift appeared.
- No chat message, candidate review write, import write, Memory write, or Canon
  write was triggered.

## Recommendation

MIMIR can close PR485B as `PASS_READY_TO_CLOSE`.
