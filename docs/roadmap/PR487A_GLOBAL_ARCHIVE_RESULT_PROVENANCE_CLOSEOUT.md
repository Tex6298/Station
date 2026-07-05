# PR487A - Global Archive Result Provenance Closeout

Owner: MIMIR / A1

Date closed: 2026-07-05

Status: Closed - hosted rehearsal passed

## Result

PR487A is closed as:

```text
PASS_READY_TO_CLOSE
```

DAEDALUS implemented compact Global Archive result provenance readback:

`docs/roadmap/PR487A_GLOBAL_ARCHIVE_RESULT_PROVENANCE_RESULT.md`

ARGUS accepted the implementation with a narrow evidence-route gating patch:

`docs/roadmap/PR487A_GLOBAL_ARCHIVE_RESULT_PROVENANCE_REVIEW_RESULT.md`

ARIADNE passed the hosted desktop, `375px`, and `390px` rehearsal:

`docs/roadmap/PR487A_GLOBAL_ARCHIVE_RESULT_PROVENANCE_REHEARSAL_RESULT.md`

## Accepted Product Truth

The owner Global Archive now gives safer, more useful provenance readback for
private archive/search results without changing backend search contracts.

Accepted behavior:

- `/studio/archive` result cards show compact source class, owner/private
  visibility, status, persona association when available, match/readback reason
  when available, and evidence-route label when a safe route exists;
- evidence links route only to owner-safe `/studio` or `/settings` surfaces;
- public, Discover, forum, and Space-looking evidence routes are not linked;
- empty/no-match and partial/degraded warning copy remain honest;
- Global Archive intake remains owner-only pasted source intake through the
  existing archive pipeline;
- Import Review remains separate from Global Archive search readback;
- private Studio search remains separate from public Discover/search.

## Hosted Proof

ARIADNE verified hosted web/API freshness at app commit `30163b2f`, which
includes the PR487A app-code target `c2d0a61e` plus ARGUS' review patch.

Passed:

- `/studio/archive` overview on desktop, `375px`, and `390px`;
- private search and filter interaction;
- no-match state;
- no-write degraded warning exercise;
- owner-safe evidence links;
- Global Archive intake no-drift;
- Import Review separation;
- mobile fit;
- no visible raw ids, storage/signed URLs, secret-shaped values, private source
  bodies, provider payloads, parser internals, SQL details, public behavior,
  backend/API/parser/storage/auth/deploy scope, broad redesign, or placeholder
  controls.

## Not In PR487A

No backend/API route, migration, schema, import execution, parser, storage
behavior, archive connector, OAuth/live provider, embedding, retrieval ranking,
prompt/model/provider, auth/session, deployment/config, package, queue/worker,
Redis, Cloudflare, billing, public search, Discover, public chat behavior,
broad Studio shell design, CSS, or placeholder control entered this lane.

## Next Lane

MIMIR is opening PR488 as the next backend/product capability preflight:

`docs/roadmap/PR488_BACKGROUND_JOB_ACTIVATION_PREFLIGHT_ARGUS.md`

This is an ARGUS decision gate before any worker/queue implementation. The
question is whether current replay/import/export evidence and available
Railway/Redis/Upstash posture justify activating a narrow background-job lane
now, or whether PR488 should name the concrete blocker and smallest unblock.
