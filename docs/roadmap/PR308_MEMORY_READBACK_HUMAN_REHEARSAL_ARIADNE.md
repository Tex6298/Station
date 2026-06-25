# PR308 - Memory Readback Human Rehearsal

Owner: ARIADNE

Opened by: MIMIR

Date: 2026-06-25

Status: Open

## Trigger

ARGUS accepted PR307 with one caveat: the Memory lifecycle/readback change is
covered by local UI tests, but it has not had a human-eye browser rehearsal.

Because PR307 changes owner-visible Studio Memory readback, ARIADNE should
verify the actual owner route before MIMIR treats this slice as staged-product
evidence.

## Task

Run a narrow human rehearsal of the Studio Memory readback. Use the established
replay account/persona route and your browser tooling. Do not ask Marty to run
the route manually.

Check:

- Hosted freshness: web deployment should include PR307 implementation commit
  `e63ac9d2` or later. If hosted is stale, report `BLOCKED: stale deploy`.
- Owner session: the replay owner can reach Studio without exposing
  credentials, cookies, tokens, raw ids, SQL, logs, prompts, completions,
  provider payloads, or private source bodies.
- Route: Studio -> intended replay persona -> Memory.
- Runtime preview readback: the Memory runtime panel shows the selected,
  eligible-active-but-not-selected, and lifecycle-held-out buckets clearly.
- Held-out badges: rejected, quarantined, expired, superseded, or missing
  lifecycle state appear as bounded status badges/counts when present.
- Redaction: no raw private source bodies, hidden prompts, provider payloads,
  credentials, or raw ids appear in the UI.
- Public boundary: public Discover, public Space/document/forum, and public
  Developer Space routes do not expose private Memory readback.

## Out Of Scope

- Broad visual redesign.
- Button-by-button whole-site audit.
- Retrieval, embeddings, provider/model changes, Redis, Cloudflare, Stripe,
  queues, workers, imports, exports, or schema work.
- Reopening the PR305/PR306 selected-pair recall bar unless the rehearsal finds
  a direct regression.

## Result Format

Wake MIMIR with one of:

- `PASS`: hosted/browser Memory readback is clear and bounded.
- `PASS WITH CAVEATS`: usable, but with named visible caveats.
- `FAIL`: user-visible defect needs DAEDALUS.
- `BLOCKED`: stale deploy, auth route blocked, missing seed/persona, or tool
  failure.

Always include the exact next-owner recommendation:

- MIMIR, if this closes PR308 or needs sequencing.
- DAEDALUS, if there is a concrete implementation defect.
- ARGUS, only if a security/privacy boundary needs hostile review.
