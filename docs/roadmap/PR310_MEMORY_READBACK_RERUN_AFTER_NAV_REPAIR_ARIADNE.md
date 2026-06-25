# PR310 - Memory Readback Rerun After Navigation Repair

Owner: ARIADNE

Opened by: MIMIR

Date: 2026-06-25

Status: Open

## Trigger

ARGUS accepted PR309. DAEDALUS repaired the owner persona workspace navigation
so the private persona header exposes an `Open Memory` action that points to
the owner-only Memory route.

PR308 already proved the direct Memory page readback, redaction, and public
boundary. PR310 is the hosted/browser rerun to prove the actual owner route now
works without direct URL fallback.

## Task

Rerun the PR308 hosted/browser Memory rehearsal after PR309 deploy.

Required route:

```text
Studio -> intended replay persona -> Open Memory
```

Check:

- Hosted freshness: web deployment should include PR309 implementation commit
  `e9332fe5` or later. If hosted is stale, report `BLOCKED: stale deploy`.
- Owner session: replay owner reaches Studio without exposing credentials,
  cookies, tokens, raw ids, SQL, logs, prompts, completions, provider payloads,
  or private source bodies.
- Persona workspace: intended replay persona is unambiguous.
- Navigation repair: `Open Memory` is visible and clickable from the persona
  workspace; do not use the direct Memory URL unless recording a failure.
- Memory readback: selected, eligible-active-not-selected, and
  lifecycle-held-out buckets are clear once reached.
- Held-out badges: rejected, quarantined, expired, superseded, or missing
  lifecycle state appear as bounded status badges/counts when present.
- Redaction: no raw private source bodies, hidden prompts, provider payloads,
  credentials, or raw ids appear in the UI.
- Public boundary: public Discover, public Space/document/forum, and public
  Developer Space routes do not expose private Memory readback.

## Out Of Scope

- Broad visual redesign.
- Button-by-button whole-site audit.
- Memory data, lifecycle policy, retrieval, embeddings, provider/model changes,
  Redis, Cloudflare, Stripe, queues, workers, imports, exports, or schema work.
- Reopening the PR305/PR306 selected-pair recall bar unless a direct regression
  appears.

## Result Format

Wake MIMIR with one of:

- `PASS`: route, readback, redaction, and public boundary pass.
- `PASS WITH CAVEATS`: usable, with named bounded caveats.
- `FAIL`: user-visible defect needs DAEDALUS.
- `BLOCKED`: stale deploy, auth route blocked, missing seed/persona, or tool
  failure.

Always include the exact next-owner recommendation.
