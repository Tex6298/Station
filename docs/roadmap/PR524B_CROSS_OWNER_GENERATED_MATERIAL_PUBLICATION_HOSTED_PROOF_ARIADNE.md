# PR524B - Cross-Owner Generated Material Publication Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-12

Status:

```text
READY_FOR_HOSTED_PROOF
```

## Source

- `docs/roadmap/PR524A_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT_ARGUS_RESULT.md`
- `docs/roadmap/PR524A_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT_RESULT.md`
- `docs/roadmap/PR524A_POST_CLOSEOUT_PAUSE_DIRECTIVE_MIMIR.md`

## Objective

Prove the PR524A generated-material publication contract on hosted Railway /
Supabase before MIMIR closes the slice.

This is a human/browser and hosted API proof. It must verify the accepted
detail-only public generated-material path without opening any new product
surface.

## Proof Target

Hosted must include PR524A implementation commit `ea6cb13d` and ARGUS review
patch commit `b6e1429e`, or prove freshness behaviorally.

If hosted schema or deployment freshness is missing, stop and name the exact
blocker. Do not implement a workaround in this lane.

## Required Human/API Flow

ARIADNE should prove, as practically as hosted test data allows:

- hosted web and API are healthy enough to run the proof;
- two participant personas and an approved cross-owner consent exist or can be
  created with both private generated artifact scope and
  `publish_exact_generated_revision`;
- a private generated artifact is explicitly saved;
- exact final public text is proposed from the private artifact path;
- both participants approve the same exact revision digest;
- participant publish creates a public generated-material detail row;
- public API detail and public web route
  `/encounters/cross-owner/generated/:slug` show only the allowed public fields;
- desktop and `390px` mobile public detail rendering fit without text overlap,
  clipped controls, or horizontal overflow;
- signed-out public read works only for a current published row;
- public JSON does not expose full `revisionDigest`, `sourceArtifactDigest`,
  `reportedCount`, lifecycle/internal statuses, raw owner ids, raw persona ids,
  consent ids, artifact ids, revision ids, approval ids, report/admin internals,
  SQL details, stack traces, bearer/cookie/env values, or secret-shaped strings;
- public read/report fail closed for missing/invalid slug and at least the
  feasible hosted stale-state controls;
- report, moderation remove/restore, participant retract, participant delete,
  and cleanup make the proof row unreadable when appropriate;
- metadata-only cross-owner exhibits remain metadata-only;
- Discover, public persona linkbacks, public persona chat/context-preview,
  Space, forum/community, writing/public documents, homepage, same-owner
  `/encounters`, runtime-attempt readback, Studio private buckets, and owner
  private search do not surface generated body text outside the accepted detail
  route.

## Guardrails

Do not broaden into:

- generated public list/index/search/feed;
- Discover placement;
- public persona linkbacks;
- Space/forum/writing/homepage placement;
- public persona chat/context-preview source expansion;
- generated summaries, abstracts, transcript excerpts, source body exposure, or
  PR516 disposable preview direct publication;
- provider/model, retrieval/vector, storage/export, billing, Redis, Cloudflare,
  queue/worker, deployment, package, or broad UI work.

## Expected Output

Create one result:

```text
docs/roadmap/PR524B_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_HOSTED_PROOF_RESULT.md
```

Include:

- pass/block verdict;
- hosted freshness evidence;
- exact proof steps completed;
- API/public JSON privacy findings;
- desktop/mobile notes;
- public no-drift findings;
- cleanup result;
- any concrete blocker.

## Wakeup

Wake MIMIR with exactly one of:

```text
PASS_PR524B_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_HOSTED_PROOF
BLOCK_PR524B_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_HOSTED_PROOF
```

