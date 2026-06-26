# PR333 - UX-03 Continuity Hosted Recheck

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Why This Opens

ARGUS accepted PR332 as the smallest safe UX-03 continuity review-clarity
slice. That acceptance covers code, tests, owner boundary, and redaction.

MIMIR is opening PR333 before making a stronger deployed UX claim because PR332
changed a visible owner Studio route:

- `/studio/personas/[personaId]/continuity`

ARIADNE should now run a hosted human-eye recheck against the deployed staging
route once Railway has the PR332 commit. This is not a new implementation lane.
It is a browser/visual proof step for an accepted owner-only slice.

## Inputs

Use:

- `docs/roadmap/PR332_UX03_CONTINUITY_INTEGRITY_REVIEW_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- hosted web: `https://stationweb-production.up.railway.app`

## Route Target

Use an existing signed-in replay/staging owner session if available.

Human route:

```text
/studio
-> Station Replay Persona
-> Continuity
```

Direct route is acceptable if ARIADNE can safely discover the current persona
id from the visible Studio UI/session. Do not print credentials, tokens,
cookies, private source bodies, raw UUID evidence, or secret-shaped values in
the result.

## Task

Run a hosted human-eye continuity recheck:

- confirm hosted web is reachable and the signed-in session can reach Studio;
- confirm the continuity route loads for `Station Replay Persona`;
- confirm the PR332 `Review clarity` / `Latest durable changes` panel appears
  when continuity records exist;
- confirm the panel explains:
  - what changed;
  - why it was recorded;
  - support/source version when known;
  - review state;
  - review target;
- confirm the panel remains readback-only and does not imply proof, correctness,
  public visibility, or memory truth;
- confirm empty/sparse states are still honest if the staging seed lacks
  continuity records;
- confirm desktop view is visually coherent;
- confirm a `375px` mobile view remains usable without overlap, trapped
  controls, or unreadable review rows;
- confirm no public route exposes this owner-only continuity readback;
- note whether Railway appears to have deployed PR332 before judging the UI.

## Hard Limits

Do not:

- create, edit, or delete continuity records;
- run Integrity Sessions;
- save memory, canon, archive, or publication data;
- mutate hosted data;
- change code, docs other than the required result, schemas, migrations,
  Railway, Supabase, Stripe, provider/model config, Redis, Cloudflare, queues,
  workers, deploy settings, keys, or database-admin state;
- contact testers;
- broaden the pilot, public launch, billing, provider, or Developer Space scope.

## Result Required

Create:

```text
docs/roadmap/PR333_UX03_CONTINUITY_HOSTED_RECHECK_RESULT.md
```

Return one verdict:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

Wake MIMIR with:

- verdict;
- whether Railway had deployed PR332;
- desktop and `375px` mobile result;
- whether the panel is safe to mention as deployed owner UX;
- exact defects if any;
- exact next-owner recommendation.
