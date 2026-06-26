# PR335 - UX-04 Public Space Hosted Rehearsal

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Why This Opens

ARGUS accepted PR334 after a narrow boundary-copy patch. The code/review risk is
closed enough, but PR334 changed a visible public route:

```text
/space/[slug]
```

ARIADNE should run a hosted desktop/mobile public Space rehearsal after Railway
has deployed PR334 before MIMIR claims the new Space microsite structure as
deployed UX.

## Inputs

Use:

- `docs/roadmap/PR334_UX04_PUBLIC_SPACE_MICROSITE_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- hosted web: `https://stationweb-production.up.railway.app`

Primary hosted routes:

- `/space/station-replay-alpha`
- `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`

## Task

Run a hosted human-eye rehearsal:

- confirm Railway appears to have deployed PR334;
- confirm `/space/station-replay-alpha` loads on desktop;
- confirm `/space/station-replay-alpha` loads on `375px` mobile;
- confirm the first viewport reads as an authored public Space rather than a
  generic profile/card list;
- confirm the boundary copy is honest for current-viewer published material and
  does not overclaim `public`-only visibility;
- confirm private Studio memory, archive, canon, continuity, owner data, raw
  identifiers, source bodies, provider payloads, credentials, or cookies are
  not visible;
- confirm selected-work/document labels make type, provenance, and discussion
  state clearer;
- confirm the public document route still opens;
- confirm the linked forum discussion route still opens from the public chain
  where visible;
- confirm no document-level horizontal overflow, overlapping text, or trapped
  controls on desktop or `375px` mobile.

## Hard Limits

Do not:

- mutate hosted data;
- sign in unless needed for a clearly bounded current-viewer visibility check;
- create/edit/delete Space, document, forum, moderation, memory, archive,
  continuity, canon, provider, billing, or Developer Space data;
- change code, schemas, migrations, config, Railway, Supabase, Stripe,
  provider/model settings, Redis, Cloudflare, queues, workers, deploy settings,
  keys, or database-admin state;
- contact testers;
- claim public launch, commercial/customer readiness, partner readiness,
  anonymous chat, durable visitor transcript, or broad site redesign.

## Result Required

Create:

```text
docs/roadmap/PR335_UX04_PUBLIC_SPACE_HOSTED_REHEARSAL_RESULT.md
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
- whether Railway had deployed PR334;
- desktop and `375px` mobile result;
- public document and linked forum chain result;
- whether PR334 is safe to mention as deployed public Space UX;
- exact defects if any;
- exact next-owner recommendation.
