# PR311 Protected-Alpha Demo Refresh After Memory Proof Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: PASS

## Summary

PR311 reran the hosted protected-alpha demo journey after PR310 closed the
Memory readback route caveat. Hosted web and API are healthy and deployment
ready at commit prefix `d59be4ee8efa`, and local ancestry confirms that runtime
includes the required PR309 implementation commit `e9332fe5`.

The protected-alpha journey is coherent enough for current staging. The owner
can move from Studio to the intended replay persona, open Memory through the
repaired `Open Memory` action, review Continuity/provenance, read archive and
export trust surfaces, and check Billing/Settings as readback only. Public
Discover, Space/document, Forum, and Developer Space routes remain public-safe
and did not expose private Memory readback.

No Marty config/input is needed for this pass. The local replay-owner keys were
available in `.env` and were loaded without printing values.

## Hosted Freshness

Pass.

- Web `/health`: HTTP `200`, healthy.
- Web `/health/deployment`: HTTP `200`, `ready:true`, branch `main`.
- Web commit prefix: `d59be4ee8efa`.
- Web contains required PR309 implementation commit `e9332fe5`: yes.
- API `/health`: HTTP `200`, healthy.
- API `/health/deployment`: HTTP `200`, `ready:true`, branch `main`.
- API commit prefix: `d59be4ee8efa`.
- API contains required PR309 implementation commit `e9332fe5`: yes.

## Owner Journey

Pass.

Checked owner routes:

- Studio.
- Intended replay persona workspace.
- Memory via `Open Memory`.
- Continuity.
- Persona Archive.
- Export Workspace.
- Billing.
- Settings.

Replay-owner auth returned HTTP `200`, `/auth/me` returned HTTP `200`, and the
intended private platform replay persona matched exactly once among `3` owned
personas.

## Memory

Pass.

- Memory items counted: `16`.
- Selected for runtime preview: `3`.
- Eligible active memory not selected: `7`.
- Lifecycle-held-out memory: `6`.
- Held-out badges/counts visible:
  - `Quarantined 5`
  - `Rejected 1`
- The owner UI showed the selected, eligible-not-selected, and lifecycle-held-out
  buckets and the runtime/action-state readback.

## Continuity And Provenance

Pass.

- Continuity records counted: `5`.
- Runtime provenance readback showed selected source grouping without compiled
  prompts or raw source bodies.
- Runtime source groups present: archive, canon, continuity, integrity, memory.

## Archive And Export Trust

Pass.

- Persona archive file count: `3`.
- Import job count: `7`.
- Persona export package count: `5`.
- Persona Archive showed Archive Trust plus Storage and Quota readback.
- Export Workspace clearly framed global export as preview/planning and did not
  imply a live global export worker or download job.

## Public Chain

Pass.

Anonymous routes checked:

- Public front door.
- Discover.
- Public replay Space.
- Public document opened from the replay Space.
- Forums.
- Public replay Developer Space.

The public chain did not expose private Memory readback labels, raw private
source markers, secret-shaped values, or the selected/eligible/held-out owner
Memory explanation. The public Developer Space still frames the route as public
observatory/readback and names private/credential boundaries.

## Billing And Account

Pass.

- Billing status was readable as server-authoritative account readback.
- Current tier readback: `canon`.
- Subscription status readback: `active`.
- Plan limit keys were present for personas, Spaces, Developer Spaces, public
  personas, pages per Space, storage, comments, threads, and publishing.
- No Checkout, Portal, webhook, billing, export, import, key-rotation, provider,
  queue, worker, or other mutation was run.

## Redaction

Pass.

The checked owner and public visible text did not expose credentials, cookies,
tokens, raw ids, SQL, logs, prompts, completions, provider payload markers, or
known raw private source markers.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr311-protected-alpha-demo.spec.js --reporter=line --workers=1`:
  pass, one hosted browser test.
- `git merge-base --is-ancestor e9332fe5 d59be4ee8efa`: pass for hosted web
  and API deployment commits.
- `git diff --check`: pass.

## Recommendation

MIMIR can treat the protected-alpha demo refresh as current hosted product
evidence after PR310. No DAEDALUS patch, ARGUS review, or Marty input is
recommended from this pass. The next owner is MIMIR: either close PR311 and run
the prepared demo, or pause until a fresh hosted product defect appears.
