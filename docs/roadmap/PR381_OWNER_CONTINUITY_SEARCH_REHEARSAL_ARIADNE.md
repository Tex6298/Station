# PR381 - Owner Continuity Search Rehearsal

Opened: 2026-06-27
Owner: ARIADNE
Status: open

## Purpose

Run a hosted human-eye rehearsal of the owner-private continuity/search path now
that the archive/import/export trust defects have been repaired.

This is not a new Redis, Cloudflare, provider, schema, worker, queue, billing,
or broad UI lane. It is a product-coherence proof: can a replay owner understand
where memory, archive, continuity, and runtime context meet without raw private
material leaking or the route feeling like disconnected counters?

## Freshness Gate

Target:

- `https://stationweb-production.up.railway.app`

Hosted web/API should be at or after the PR379 implementation prefix:

- `ad1704d9`

If Railway is stale or unavailable, return `BLOCKED` with the observed prefix or
failure.

## Human Route

Use replay-owner credentials from ignored local environment only. Do not paste
credentials, cookies, raw owner identifiers, raw persona identifiers, or
authorization headers into the result.

Follow the human route, not direct API calls:

1. Sign in as the replay owner.
2. Open `/studio` and navigate to the replay persona.
3. Check the persona Memory stop.
4. Check the persona Archive/File stop.
5. Check the persona Continuity stop.
6. Check `/studio/archive` with the existing replay/private search path.
7. If needed, send exactly one bounded staging chat prompt to the replay persona:

```text
Staging continuity check: name the seeded replay anchors and say whether the
answer is drawing from memory, archive, continuity, or runtime context. Do not
include private data.
```

8. If the chat produces an AI Activity trace, spot-check the trace detail for
   safe source/readback labels.

## What To Judge

Pass/fail from a human eye:

- Memory, Archive, and Continuity are visible as distinct owner stops, not just
  unrouteable counts.
- The user can see enough source/provenance context to understand why the replay
  persona remembers the seeded anchors.
- Global Archive search remains owner-only and redacted after PR379.
- Continuity is legible as a durable source/record path, not only runtime
  context counts.
- The bounded chat response, if used, does not overclaim or expose raw private
  material.
- Trace/readback details, if present, expose only safe source/provider/profile
  metadata and do not dump prompts, completions, vectors, provider payloads, raw
  source bodies, raw URLs, SQL, stack traces, or secret-shaped values.

## Pass Criteria

Return `PASS` if:

- Hosted freshness is acceptable.
- The human route makes Memory, Archive, Continuity, and owner search coherent
  enough for staging replay.
- No privacy/safety leak appears.
- Any chat/trace step is bounded and safe.

Return `PASS WITH CAVEAT` if:

- The route is safe and usable, but the data/storytelling is thin enough that a
  later UX/narrative lane should improve it.

Return `FAIL` if:

- A required owner stop is unreachable or visibly broken.
- Memory, Archive, Continuity, and owner search feel disconnected in a way that
  blocks the staging demo.
- Global Archive redaction regresses.
- Runtime/trace/chat output exposes raw private material, raw IDs, provider
  payloads, SQL, stack traces, or secret-shaped values.
- The UI implies Redis/Cloudflare/provider capabilities that are not actually
  live.

Return `BLOCKED` only for stale deploy, unavailable staging, missing credentials,
or a route that cannot be reached because auth/session is broken.

## Handoff Back To MIMIR

Wake MIMIR with:

- Verdict: `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`.
- Hosted freshness prefix observed.
- Routes checked.
- Whether Memory, Archive, Continuity, and owner search felt coherent.
- Whether the bounded chat/trace step was used and what it proved.
- Exact defects and recommended next owner if DAEDALUS needs a repair.
