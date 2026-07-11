# PR517C/PR517D - Cross-Owner Metadata-Only Public Exhibit Hosted Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR517C_PR517D_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_ACCEPTED
```

## Summary

MIMIR closes the hosted PR517 proof set as accepted.

Sources:

- `docs/roadmap/PR517B_HOSTED_MIGRATION_080_UNBLOCK_MIMIR.md`
- `docs/roadmap/PR517C_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_RERUN_RESULT.md`
- `docs/roadmap/PR517C_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_RERUN_BLOCKER_MIMIR.md`
- `docs/roadmap/PR517D_SAME_OWNER_PUBLIC_EXHIBIT_REGRESSION_HOSTED_RERUN_RESULT.md`

## Accepted Hosted Truth

PR517C proved the hosted cross-owner metadata-only public exhibit contract:

- hosted migration `080` is applied, ledgered as
  `20260711223402 / 080_persona_encounter_cross_owner_public_exhibits`, and
  visible through PostgREST;
- pending, wrong-scope, wrong-version, nonparticipant, duplicate, same-actor,
  mismatched-metadata, removed, inactive-restore, and retracted states fail
  closed;
- exact bilateral metadata approval publishes a public API detail row;
- public readback is metadata-only and does not expose generated words,
  transcripts, excerpts, summaries, prompts, provider payloads, private setup,
  private sessions, raw owner ids, raw persona ids, retrieval bodies, token
  facts, SQL detail, env values, cookies, bearer values, or secret-shaped
  strings;
- public report, moderation remove, active-consent restore, consent revocation
  hiding, participant retract, no-runtime/no-private-session, no-drift,
  privacy, and cleanup checks passed.

PR517D proved the same-owner regression gate on current hosted:

- one disposable same-owner private candidate artifact was created;
- one metadata-only same-owner public exhibit was published;
- signed-in report by slug returned `201`;
- hosted moderation persisted the public exhibit UUID target, not the slug;
- admin queue, remove, restore, owner-retracted protection, no-drift, and
  cleanup passed;
- no cross-owner public exhibit rows were created by the same-owner regression
  proof.

## Still Blocked

The PR517 hosted closeout does not approve:

- generated-word publication;
- generated summaries, excerpts, transcripts, or source-derived public text;
- private saved cross-owner artifacts;
- retroactively making older generic consent rows executable;
- using PR516 disposable preview output as source material;
- weakening same-owner public exhibit private-session constraints;
- Discover/search/feed/index/persona/Space/forum/Salon/Station Press surfacing;
- provider calls, retrieval, storage, billing, social posting, Redis,
  Cloudflare, queues/workers, package/lockfile changes, deployment changes, or
  broad UI work.

## Next

The next customer-facing Phase 3 move is a hostile public-surfacing preflight:

```text
PR518 - Cross-Owner Metadata Exhibit Public Surfacing Preflight
Owner: ARGUS / A3
Source: docs/roadmap/PR518_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_PREFLIGHT_ARGUS.md
```
