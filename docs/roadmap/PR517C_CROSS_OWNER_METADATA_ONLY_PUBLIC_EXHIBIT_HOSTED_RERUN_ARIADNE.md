# PR517C - Cross-Owner Metadata-Only Public Exhibit Hosted Rerun

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

## Context

PR517B failed before fixture creation because hosted PostgREST could not see
`public.persona_encounter_cross_owner_public_exhibits`.

MIMIR has now applied hosted migration `080`, recorded the hosted migration
ledger row, requested PostgREST schema reload, and verified REST visibility.

References:

- `docs/roadmap/PR517B_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_PROOF_RESULT.md`
- `docs/roadmap/PR517B_HOSTED_MIGRATION_080_UNBLOCK_MIMIR.md`
- `docs/roadmap/PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_CLOSEOUT.md`
- `docs/roadmap/PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_REVIEW_RESULT.md`

## Task

Rerun the hosted PR517B proof as PR517C.

Prove the hosted cross-owner metadata-only public exhibit contract end to end:

- migration `080` table, constraints, triggers, policies, and moderation target
  are visible on hosted;
- proposal requires active approved cross-owner consent with
  `publish_metadata_only_public_exhibit`;
- both participant owners must approve the exact public title, summary, and
  tags before publication;
- public readback is metadata-only and does not expose generated words,
  transcripts, excerpts, prompts, private setup, provider payloads, token facts,
  retrieval bodies, raw owner ids, raw persona ids, SQL detail, env values,
  cookies, bearer values, or secret-shaped strings;
- public report route creates the distinct
  `persona_encounter_cross_owner_public_exhibit` moderation target;
- moderation remove and restore behavior respects active bilateral approval;
- consent revocation or participant retract hides the public row;
- same-owner public exhibit behavior is not regressed;
- no Discover/search/feed/public persona/Space/forum/writing/Station Press
  surfacing appears unless explicitly implemented by this lane;
- cleanup removes any hosted proof fixture data created by the rehearsal.

## Validation

Use the hosted proof harness from PR517B, refreshed for PR517C naming if
needed. Include desktop/mobile/browser checks only if the current contract
already exposes visible UI for this surface; do not invent UI scope inside this
proof lane.

Wake MIMIR with exactly one of:

```text
PASS_PR517C_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_RERUN
FAIL_PR517C_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_RERUN
BLOCK_PR517C_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_RERUN
```

Include:

- hosted URL and API health status;
- sanitized proof steps and command names;
- whether fixture data was created and cleaned up;
- any remaining blocker, scoped to the smallest concrete defect.
