# PR383 - Owner Continuity Search Rerun Result

Date: 2026-06-27
Owner: A4 / ARIADNE
Verdict: PASS WITH CAVEAT

## Hosted Freshness

Hosted Railway web and API were both ready at deployment prefix `d45aca72`,
which satisfies the PR383 freshness gate.

The rerun used replay-owner credentials from the local ignored environment only.
No credential, cookie, authorization-token value, raw owner identifier, raw
persona identifier, raw source body, raw API body, screenshot, hosted log, SQL,
or stack trace was copied into this result.

## Human Route Followed

The rehearsal used the hosted UI path:

1. Signed in through `/login?redirect=/studio`.
2. Opened `/studio`.
3. Navigated from Studio to the replay persona workspace.
4. Checked the persona Memory stop.
5. Checked the persona Archive/File stop.
6. Checked the persona Continuity stop.
7. Checked `/studio/archive` with a replay/private search.
8. Opened `/settings` for AI Activity readback.

I did not send another bounded staging chat prompt. PR383 made that step
conditional, and the Memory/runtime redaction repair could be proven without
another conversation mutation.

No upload, import retry, export creation, publish action, settings change,
billing action, chat prompt, or destructive action was attempted.

## Result

PR381's blocking Memory defect is gone.

The Memory stop loaded and showed:

- `Memory Briefing`;
- `Runtime context`;
- `Memory explanation`;
- `Observability handoff`;
- `Lifecycle review`;
- the structured-source redaction message from PR382;
- normal Memory page prose/readback still visible.

The visible Memory route no longer rendered raw JSON-shaped source material, and
it did not expose raw identifiers, raw network locations, provider payloads,
vector payloads, SQL, stack traces, or secret-shaped values.

## Runtime And Route Readback

The surrounding continuity/search route also remained safe:

- The replay persona workspace loaded from Studio navigation.
- The Archive/File stop still showed `Archive Trust`, `Import Pipeline`, and
  `Supported owner imports`.
- The Continuity stop still showed `Continuity Trust`, `Runtime provenance`,
  and copy that source bodies and compiled prompts stay hidden.
- Runtime-context readback did not dump raw structured source content.
- Global Archive search still showed owner-only grouped source/status/persona
  readback and did not regress the PR379 redaction.

## Caveat

AI Activity was visible in Settings and showed operational readback, but no
trace detail row was available to open during this pass. That is a trace
availability/storytelling caveat, not a privacy or route-safety failure.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web/API deployment readback | PASS | Both ready at prefix `d45aca72`. |
| UI sign-in and Studio navigation | PASS | Replay-owner sign-in and Studio-to-persona navigation worked. |
| Memory stop | PASS | Structured-source redaction visible; raw JSON-shaped source material no longer visible. |
| Runtime context readback | PASS | No raw structured source content was visible. |
| Archive/File stop | PASS | Import/source readback remained visible and safe. |
| Continuity stop | PASS | Runtime provenance and hidden-source-body copy were visible and safe. |
| Global Archive search | PASS | Owner-only search remained redacted after PR379. |
| Bounded chat prompt | Not used | Not needed for this redaction/runtime proof. |
| AI Activity | PASS WITH CAVEAT | Activity visible; no trace detail row was available to open. |
| Mutation guard | PASS | No mutation was attempted. |
| `git diff --check` | PASS | CRLF normalization warning on the local A4 state receipt only. |

## Handoff

MIMIR can close PR383 as accepted with the trace-detail availability caveat.
The PR382 Memory owner-visible redaction repair is live on hosted Railway, and
the PR381 Memory raw JSON defect is no longer present.
