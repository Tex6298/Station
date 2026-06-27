# PR381 - Owner Continuity Search Rehearsal Result

Date: 2026-06-27
Owner: A4 / ARIADNE
Verdict: FAIL

## Hosted Freshness

Hosted Railway web and API were both ready at deployment prefix `87613170`.
That prefix is at or after the PR379 implementation prefix `ad1704d9`, so the
freshness gate was open.

The rehearsal used the replay-owner credentials from the local ignored
environment only. No credential, cookie, authorization-token value, raw owner
identifier, raw persona identifier, raw API body, private source body,
screenshot, hosted log, SQL, or stack trace was copied into this result.

## Human Route Followed

The rehearsal used the hosted UI path:

1. Signed in through `/login?redirect=/studio`.
2. Opened `/studio`.
3. Navigated from Studio to the replay persona workspace.
4. Checked the persona Memory stop.
5. Checked the persona Archive/File stop.
6. Checked the persona Continuity stop.
7. Checked `/studio/archive` with a replay/private search.
8. Sent the single bounded staging chat prompt allowed by PR381.
9. Opened `/settings` for AI Activity readback.

No upload, import retry, export creation, publish action, settings change,
billing action, or destructive action was attempted. The only mutation was the
one bounded staging chat prompt explicitly allowed by PR381.

## What Passed

The main owner route is reachable and mostly coherent:

- Studio sign-in worked through the UI.
- Studio showed a replay persona entry and linked into the owner persona
  workspace.
- The persona Archive/File stop showed `Archive Trust`, `Import Pipeline`, and
  `Supported owner imports`.
- The persona Continuity stop showed `Continuity Trust`, `Runtime provenance`,
  and the copy that source bodies and compiled prompts stay hidden there.
- Global Archive search remained owner-only and safe after PR379. The search
  route loaded, grouped source/status/persona readback remained visible, and
  the prior raw JSON archive-preview defect did not return.
- The bounded chat prompt returned safely; no secret-shaped value, raw
  identifier, raw network location, SQL, stack trace, provider payload, vector
  payload, or raw JSON was visible in the checked chat surface.
- AI Activity was visible in Settings and exposed operational readback rather
  than prompt/body dumps.

## Blocking Defect

The persona Memory stop still rendered raw JSON-shaped source material in
visible owner text. I am intentionally not quoting the line into this document,
but the defect is specific to:

```text
/studio/personas/[replay persona]/memory
```

The Memory page appears to fall back from safe summary/title text into raw
memory/source content for at least one structured replay item. That means PR379
fixed Global Archive preview serialization, but the owner-visible Memory route
still needs a matching redaction/summarization boundary for JSON-shaped source
material.

This fails PR381 because the owner continuity/search route is not yet safe and
coherent across Memory, Archive, Continuity, and Global Archive. The user can
understand the stops, but one stop still dumps structured source shape instead
of presenting a safe owner-facing summary.

## Additional UX Caveats

The bounded chat response was safe, but it did not give a clearly legible
source-category readback tying the answer to Memory, Archive, Continuity, or
runtime context. That is not the primary failure while the Memory redaction
defect remains open, but it weakens the "continuity/search coherence" story.

AI Activity loaded and showed operational readback, but no trace detail row was
available to open during this pass. That should be rerun after the Memory route
is repaired, because PR381 asked for a trace detail spot-check if the chat
produced one.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web/API deployment readback | PASS | Both ready at prefix `87613170`, at or after `ad1704d9`. |
| UI sign-in and Studio navigation | PASS | Replay-owner sign-in and Studio-to-persona navigation worked. |
| Memory stop | FAIL | Raw JSON-shaped source material was visible. |
| Archive/File stop | PASS | Import/source readback remained visible and safe. |
| Continuity stop | PASS | Runtime provenance and hidden-source-body copy were visible and safe. |
| Global Archive search | PASS | Owner-only search remained redacted after PR379. |
| Bounded chat prompt | PASS WITH CAVEAT | Safe, but weak source-category readback. |
| AI Activity | PASS WITH CAVEAT | Activity visible; no detail row was available to open. |
| Mutation guard | PASS | Only the one PR381-allowed bounded chat prompt was sent. |
| `git diff --check` | PASS | CRLF normalization warning on the local A4 state receipt only. |

## Recommended Next Owner

DAEDALUS should patch the Memory owner-visible text path so JSON-shaped memory
or source content is summarized/redacted before it renders on the Memory stop.
The likely repair area is the Memory page/card summary fallback path, not
Global Archive search.

After DAEDALUS patches and ARGUS validates the redaction boundary, ARIADNE
should rerun PR381 and re-check the bounded chat plus AI Activity detail path.
