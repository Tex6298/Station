# PR517B - Cross-Owner Metadata-Only Public Exhibit Hosted Proof

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_ARIADNE_HOSTED_PROOF
```

## Goal

Prove PR517A on hosted Railway staging before Station claims the cross-owner
metadata-only public exhibit contract is deployed-ready.

This is mostly a hosted migration/API proof with browser/auth checks where they
help. PR517A did not add broad visible UI or public surfacing.

## Source

PR517A closeout:

`docs/roadmap/PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_CLOSEOUT.md`

PR517A review:

`docs/roadmap/PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_REVIEW_RESULT.md`

Implementation floor:

```text
60071b42 - review: accept PR517A cross-owner public exhibit contract
```

## Proof Scope

Use hosted Railway staging. Prove:

- hosted web/API are fresh enough to include commit `60071b42`;
- hosted migration `080_persona_encounter_cross_owner_public_exhibits.sql` is
  present and the dedicated table/trigger/report target shape exists;
- owner A and owner B can operate only as participants on an approved
  cross-owner consent scoped for `publish_metadata_only_public_exhibit`;
- owner A can propose a metadata-only public exhibit through
  `POST /persona-encounters/cross-owner-consents/:consentId/public-exhibit`;
- owner B must approve the exact title, summary, tags, and contract version via
  `PATCH /persona-encounters/cross-owner-public-exhibits/:slug/approve`;
- one-owner publish, mismatched metadata approval, nonparticipant access,
  inactive consent, wrong scope, wrong version, retracted row, removed row, and
  revoked consent fail closed;
- public detail readback at
  `GET /persona-encounters/cross-owner-public-exhibits/:slug` returns only safe
  metadata, safe display snapshots, provenance, status/timestamps, contract
  version, and report path;
- authenticated reporting through
  `POST /persona-encounters/cross-owner-public-exhibits/:slug/report` works and
  uses target type `persona_encounter_cross_owner_public_exhibit`;
- moderation remove hides the public detail route;
- moderation restore requires active bilateral public metadata approval;
- consent revocation or participant retract hides the public detail route and
  leaves safe tombstone/audit behavior;
- same-owner public exhibit report/remove/restore behavior still works and does
  not query cross-owner-only columns from the same-owner table;
- PR516 disposable preview output remains private, unsaved, not public,
  no-retrieval, and counterparty-hidden.

## No-Drift Checks

PR517B must prove the hosted lane does not create or expose:

- generated-word publication;
- transcripts, excerpts, or summaries;
- private saved cross-owner artifacts;
- PR516 disposable preview output;
- private setup, prompts, source retrieval bodies, provider payloads, token
  facts, Memory, Archive, Canon, Continuity, Integrity, private notes, raw
  owner/persona/session/consent/runtime ids, SQL details, stack traces, env
  values, bearer values, cookies, or secret-shaped strings;
- `/encounters` index rows;
- `/discover/search`, `/discover/feed`, public persona, Space, forum/community/
  Salon, writing, or Station Press surfacing;
- provider calls, retrieval, token accounting, storage writes, queue/worker
  jobs, Redis/Cloudflare operations, billing/Stripe actions, social posts,
  package/lockfile drift, deployment config drift, or broad UI changes.

## Cleanup

Cleanup should leave no PR517B proof row publicly readable and no active proof
consent usable for publication. If cleanup leaves safe tombstones or audit rows,
record their bounded statuses.

## Result Format

Wake MIMIR with one of:

```text
PASS_PR517B_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_PROOF
```

or:

```text
FAIL_PR517B_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_PROOF
```

If failing, name the exact hosted step, observed behavior, likely owner, and
whether the fix belongs to DAEDALUS or needs a smaller preflight.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR517A locally after a narrow review patch.
- PR517A adds a dedicated cross-owner metadata-only public exhibit contract, but hosted migration/API proof is still unclaimed.
- This is API-heavy hosted proof, not a broad UI rehearsal.
Task:
- Run PR517B on Railway staging.
- Prove hosted migration 080 and API behavior for propose, exact bilateral approve, public metadata-only readback, report, moderation remove/restore, revocation/retract hiding, same-owner regression safety, no public surfacing drift, and cleanup.
- Preserve the no-generated-words/no-private-preview/no-retrieval/no-Discover-search/feed/index boundary.
- Wake MIMIR with PASS_PR517B_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_PROOF or FAIL_PR517B_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_PROOF and exact defects.
```
