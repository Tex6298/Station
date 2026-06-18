# PR26 - Replay Memory/Retrieval Quality Pass

Date: 2026-06-18
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE only rehearses if visible
Studio/context-preview behavior changes.

## Purpose

Make the next protected-alpha replay feel meaningfully smarter, not just green.

This lane follows `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md` PR 1 after
the PR24 launch-core closeout and PR25 onboarding route-map acceptance.

## Scope

- Improve retrieval ranking over existing evidence, memory, archive, and
  continuity chunks.
- Reduce stale, noisy, superseded, rejected, quarantined, expired, or
  context-leaking recalls.
- Add or improve retrieval trace output for:
  - selected memories or archive chunks;
  - rejected candidates;
  - stale, superseded, quarantined, expired, or rejected counts;
  - the reason each selected item was used.
- Add a focused replay fixture proving the answer improves because the right
  continuity, memory, or archive evidence was recalled.
- Keep the current Gemini free `1536` staging profile as the intended staging
  path.
- Preserve OpenAI-compatible rollback/paid profiles.

## Explicit Non-Scope

- Do not introduce Redis memory truth.
- Do not introduce Cloudflare retrieval as a primary path.
- Do not request Cloudflare config for this lane.
- Do not rewrite the retrieval architecture.
- Do not change vector dimensions.
- Do not add provider marketplace or billing work.
- Do not add production worker infrastructure.

## Cloudflare Timing Answer

Cloudflare config is not needed for PR26.

The current repo already has a disabled-safe Cloudflare adapter contract, but
runtime retrieval is still Station/Supabase plus the active Gemini `1536`
profile. Cloudflare should stay deferred until one of these happens:

- a borrowed repo pattern proves a Cloudflare-only runtime need;
- current Supabase/Gemini retrieval hits a specific replay limitation that an
  ID-only Cloudflare index mirror would solve;
- MIMIR opens a Cloudflare-specific lane with ARGUS privacy gates.

On the current backend/product sequence, Cloudflare is not before the memory
quality pass, archive/import robustness, Stripe proof, Redis boundary, and
provider-policy lanes unless live replay evidence forces a reorder.

## Suggested Implementation Shape

DAEDALUS should inspect the existing retrieval/context-builder code before
patching. Prefer small changes such as:

- normalizing rank inputs;
- filtering lifecycle states earlier;
- adding deterministic tie-breaks;
- improving source-type caps or recency weighting;
- adding structured trace metadata that is safe for operator/replay use;
- adding one synthetic replay fixture with a positive and negative control.

Do not make private snippets public. Trace output must stay owner/operator safe
and must not leak another owner, persona, or private source.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If a focused retrieval/context test family exists, add the replay fixture there
and name it in the handoff.

## ARGUS Review Ask

ARGUS should hostile-review:

- owner/persona scoping;
- lifecycle filters for rejected, expired, quarantined, and superseded memory;
- trace output for private-data leaks;
- mixed-provider/vector-dimension assumptions;
- whether the replay fixture actually proves better recall rather than only
  snapshotting a new behavior.

## Wake Discipline

DAEDALUS should wake ARGUS when done with:

- files changed;
- ranking/filtering behavior changed;
- replay fixture name and what it proves;
- validation commands/results;
- any remaining retrieval caveat.

If DAEDALUS finds Cloudflare is genuinely required earlier than expected, wake
MIMIR with the exact evidence instead of adding config or live calls.
