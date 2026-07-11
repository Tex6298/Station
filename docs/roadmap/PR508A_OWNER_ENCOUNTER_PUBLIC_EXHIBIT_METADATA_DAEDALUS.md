# PR508A - Owner Encounter Public Exhibit Metadata

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-07-11

Status: Open for implementation

## Decision Source

ARGUS accepted this lane in:

`docs/roadmap/PR508_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_PREFLIGHT_RESULT.md`

Accepted verdict:

```text
ACCEPT_PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_ONLY
```

## Product Goal

Add the first public encounter exhibit capability without publishing encounter
transcripts or generated persona words.

The first slice is metadata-only and same-owner only:

- owner explicitly publishes/retracts a public exhibit derived from an existing
  same-owner saved private encounter artifact;
- public output is owner-authored public metadata plus safe same-owner persona
  display snapshots and provenance;
- private session constraints remain private.

## Accepted Shape

PR508A may add:

- a dedicated public exhibit table;
- explicit owner publish route;
- explicit owner retract route;
- dedicated public exhibit route;
- owner-authored public title;
- owner-authored public summary/context note;
- optional owner-authored public tags;
- safe same-owner persona display-name snapshots;
- public slug;
- `published`, `retracted`, and `removed` state;
- `publishedAt` and `retractedAt`;
- provenance copy that says the exhibit is owner-curated, public, metadata-only,
  and derived from a private same-owner saved artifact;
- report/takedown support for the new public exhibit target.

The private `publication_candidate` marker may only make an artifact eligible
for the owner publish control. It is not publication approval.

PR507A private curation fields must not automatically copy into public output.
Public metadata must be newly owner-authored public fields.

## Forbidden Scope

Do not publish or expose:

- transcripts;
- raw generated responder replies;
- owner-selected excerpts;
- private setup;
- private curation title, note, or tags;
- raw owner ids, persona ids, or session ids;
- provider payloads;
- model config;
- prompt bodies;
- private context;
- source bodies;
- SQL details;
- stack traces;
- cookies;
- tokens;
- env values;
- secret-shaped strings;
- cross-owner persona words.

Do not add:

- cross-owner public exhibits;
- excerpt support;
- provider-generated summaries;
- classifier/moderation calls;
- Discover/search/forum/feed surfacing;
- public Space/persona cards for encounter exhibits;
- anonymous/visitor persistence;
- provider calls, source retrieval, token accounting, storage writes,
  queue/worker jobs, Redis/Cloudflare operations, billing actions, social
  posts, package changes, lockfile changes, deployment config, Archive, Memory,
  Canon, Continuity, Integrity, or Station Press changes.

## Data Boundary

Use a dedicated public exhibit table, recommended:

```text
public.persona_encounter_public_exhibits
```

Required:

- owner-scoped row with `owner_user_id`;
- FK to `persona_encounter_private_sessions`;
- enforce same-owner source session and owner match;
- public slug that is not a raw id;
- bounded public title, summary, and tags;
- safe same-owner persona display-name snapshots only;
- status such as `published`, `retracted`, and `removed`;
- `published_at`, `retracted_at`, and moderation/report fields as needed;
- provenance schema such as `station.persona_encounter.public_exhibit.v1`;
- RLS: owner writes, public reads only `published` and non-removed records.

The private source row must preserve:

- `shareable = false`;
- `public_visibility = 'private'`;
- `source_retrieval_used = false`;
- owner-only private-session RLS;
- private curation schema and private curation readback semantics.

## API Boundary

Add a narrow authenticated owner publish route:

```text
POST /persona-encounters/private-sessions/:sessionId/public-exhibit
```

Required behavior:

- require auth;
- scope by private session `id` and `owner_user_id`;
- require same-owner personas;
- require explicit confirmation such as `confirmPublicExhibit: true`;
- accept only bounded public title, summary, and tags;
- require `publication_candidate = true` unless implementation documents a
  narrower alternative before review;
- reject extra keys, excerpt fields, setup/reply fields, raw ids, provider
  fields, private curation fields, and share-link fields before writes;
- create or update only the dedicated public exhibit row;
- perform no provider call, source retrieval, token accounting, storage write,
  queue/worker job, Redis/Cloudflare operation, billing action, or social post.

Add owner retract behavior, for example:

```text
PATCH /persona-encounters/public-exhibits/:exhibitId/retract
```

Retract must require the owner, hide the public route, leave the private
artifact private, and avoid deleting private source material.

Add public read, for example:

```text
GET /persona-encounters/public-exhibits/:slug
```

Public read must return only accepted metadata for `published` records and
bounded `404` for missing, retracted, removed, or unpublished records.

## Moderation And Reporting

Add a reportable target such as:

```text
persona_encounter_public_exhibit
```

Required:

- extend the moderation report target-type database constraint;
- update `apps/api/src/routes/reports.ts` validation and report queue filters;
- update DB/types and reports tests;
- add safe admin target context for public encounter exhibits without raw ids,
  private setup, generated reply text, private curation, provider details, SQL,
  stack traces, or secret-shaped values;
- make the public exhibit page expose a report action for signed-in users, or a
  bounded signed-out "sign in to report" path if the existing report API remains
  auth-required;
- include an admin remove/restore path or a moderation-controlled `removed`
  status that hides the public route while preserving safe report readback.

Owner retract and moderation removal are separate controls.

## Web/UI Boundary

Use a dedicated public web route, such as:

```text
/encounters/[slug]
```

Studio owner UI may add explicit publish/retract only inside the existing
private encounter artifact area.

Copy must distinguish:

- private candidate/planning marker;
- explicit public exhibit publication;
- metadata-only public output;
- no transcript/excerpt/raw reply publication;
- same-owner only;
- report/takedown availability.

Do not surface encounter exhibits in Discover, public Space pages, public
persona pages, search, forums, feeds, Salon, Station Press, billing, social,
archive, Memory, Canon, Continuity, or Integrity in PR508A.

## Allowed File Scope

Allowed files:

- next Supabase migration for public exhibit table and moderation target type;
- `packages/db/src/types.ts`;
- `packages/types/src/index.ts` or close local type files;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/api/src/routes/reports.ts`;
- `apps/api/src/routes/reports.test.ts`;
- public exhibit API helpers/tests if needed;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- `apps/web/components/studio/persona-workspace.tsx`;
- a dedicated public exhibit page and focused page/helper tests;
- moderation-console/report helper files and tests if needed for safe target
  context;
- `apps/web/app/globals.css` only for scoped encounter exhibit layout;
- roadmap and validation docs.

Anything else needs an explicit explanation in the result.

## Required Tests

Prove at minimum:

- migration creates dedicated table, owner/public RLS, bounded constraints,
  public slug uniqueness, status constraints, and moderation target type;
- owner publish requires auth, own private session, same-owner personas,
  explicit confirmation, candidate eligibility, and bounded public fields;
- publish rejects cross-owner sessions, missing sessions, non-candidate
  sessions, extra keys, setup/reply/excerpt fields, private curation fields,
  provider fields, and raw id fields before writes;
- public GET returns only safe metadata for a published exhibit;
- public GET returns `404` for draft, retracted, removed, missing, or
  cross-owner-manipulated records;
- owner retract hides public route and preserves private artifact;
- moderation report create/readback supports
  `persona_encounter_public_exhibit` with safe target context;
- moderation removal or removed-status hiding works;
- public route serialization never includes private or forbidden material;
- public Space/persona/Discover/search/forum samples remain free of private
  encounter artifacts unless the dedicated exhibit route is explicitly used;
- no provider call, source retrieval, token accounting, storage write,
  queue/worker job, Redis/Cloudflare operation, billing action, social post, or
  package/lockfile drift occurs;
- Studio copy is honest that private candidate is not publication and that
  publish/retract creates metadata-only public visibility.

Minimum validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

## Result Required

Write:

`docs/roadmap/PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_RESULT.md`

Then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR508A metadata-only same-owner public encounter exhibits.
- The implementation should preserve the PR508 public/private boundary: no transcripts, excerpts, raw replies, private setup, private curation, raw ids, provider payloads, prompts, private context, source bodies, or cross-owner persona words.
Task:
- Review implementation, run validation, and wake MIMIR with verdict.
```
