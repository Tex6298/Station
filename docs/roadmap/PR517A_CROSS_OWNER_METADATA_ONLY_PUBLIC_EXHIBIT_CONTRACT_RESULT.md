# PR517A - Cross-Owner Metadata-Only Public Exhibit Contract Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-11

State:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the smallest cross-owner public exhibit contract as
metadata-only public readback on top of active bilateral consent.

The implementation uses a dedicated table:

```text
public.persona_encounter_cross_owner_public_exhibits
```

It does not reuse the same-owner private-session-backed exhibit table, and it
does not add cross-owner rows to `/encounters`, Discover/search/feed, public
persona, Space, forum/community/Salon, Station Press, writing, or broad Studio
surfaces.

## Implementation

Added:

- migration `080_persona_encounter_cross_owner_public_exhibits.sql`;
- typed DB and moderation target surfaces;
- participant-authenticated proposal route:
  `POST /persona-encounters/cross-owner-consents/:consentId/public-exhibit`;
- participant-authenticated exact metadata approval route:
  `PATCH /persona-encounters/cross-owner-public-exhibits/:slug/approve`;
- participant-authenticated retract route:
  `PATCH /persona-encounters/cross-owner-public-exhibits/:slug/retract`;
- public API detail readback:
  `GET /persona-encounters/cross-owner-public-exhibits/:slug`;
- authenticated public report route:
  `POST /persona-encounters/cross-owner-public-exhibits/:slug/report`;
- report queue context and admin remove/restore for
  `persona_encounter_cross_owner_public_exhibit`;
- web helper path/payload/readback/error-copy coverage only.

## Boundary

The public contract requires:

- an approved cross-owner consent row;
- `requested_scope_version = 1`;
- `publish_metadata_only_public_exhibit` in the consent scopes;
- a dedicated public metadata row;
- exact title, summary, tags, and contract version approval from both
  participant owners before publication.

One-owner publish, duplicate proposal, metadata mutation by approval mismatch,
nonparticipant access, inactive consent, wrong scope, wrong version, retracted
row, removed row, and revoked consent all fail closed.

Public readback includes only slug, title, summary, tags, participant display
snapshots, status, contract version, timestamps, metadata-only provenance, and
report path. It does not expose raw owner/persona/session/consent/runtime ids,
private setup, PR516 disposable preview output, generated words, transcripts,
excerpts, summaries, prompts, provider payloads, retrieval bodies, token facts,
SQL details, env values, bearer values, cookies, or secret-shaped strings.

## Moderation

Cross-owner public exhibit reports use a distinct target type:

```text
persona_encounter_cross_owner_public_exhibit
```

Admin removal hides the public route. Admin restore is available only when the
underlying consent is still active, approved, version-matched, and scoped for
metadata-only public exhibit publication.

Consent revocation retracts linked proposed/published cross-owner public
exhibit rows, and public/report routes then return bounded `404`.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters  PASS - 73 tests
npm exec --yes pnpm@10.32.1 -- run test:reports             PASS - 8 tests
npm exec --yes pnpm@10.32.1 -- run test:studio-ui           PASS - 215 tests
npm exec --yes pnpm@10.32.1 -- run typecheck                PASS
git diff --check                                             PASS
git diff --cached --check                                    PASS
```

## Non-Scope Preserved

No generated-word publication, transcript/excerpt/summary publication, saved
cross-owner artifacts, provider calls, retrieval, token accounting, storage
bucket writes, queue/worker jobs, Redis/Cloudflare operations, billing/Stripe,
social posts, package/lockfile changes, deployment changes, Discover/search/
feed/index surfacing, public persona surfacing, Space/forum/Salon/writing/
Station Press surfacing, or broad UI feature work was added.

## Handoff

ARGUS should hostile-review:

- active-consent and exact bilateral metadata approval checks;
- public serializer and report serializer privacy;
- report remove/restore behavior, especially active-consent restore gating;
- revocation hiding/retraction;
- same-owner public exhibit regression safety;
- absence of cross-owner index/search/feed/public persona/Space/forum/writing
  surfacing;
- no PR516 disposable preview output or generated words entering public output.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
