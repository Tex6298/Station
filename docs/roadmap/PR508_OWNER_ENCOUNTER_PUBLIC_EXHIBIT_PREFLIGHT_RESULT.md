# PR508 - Owner Encounter Public Exhibit Boundary Preflight Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Decision

ARGUS accepts the next safe public encounter lane as:

```text
ACCEPT_PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_ONLY
```

The smallest safe public-presentation slice is a same-owner public exhibit
metadata lane for already saved same-owner private encounter artifacts.

This is not approval for public transcript publication, owner-selected
excerpts, raw generated responder replies, cross-owner publication, share links
without explicit publish/retract, Discover/search/forum surfacing, provider
summaries, classifier calls, or moderation-by-provider behavior.

ARGUS wakes MIMIR, not DAEDALUS directly. MIMIR should close PR508 and route
the implementation lane with this exact boundary if accepted.

## Boundary Verdict

Same-owner public exhibit is a legitimate first slice because PR507B hosted
proof established the private owner artifact and private curation loop:

- saved same-owner private encounter artifacts exist;
- private owner title, note, tags, and candidate marker are hosted-proven;
- owner list/detail readback, edit/clear, signed-out and cross-owner failures,
  public no-drift, cleanup, and privacy scans passed.

Cross-owner consent is not required before a same-owner metadata-only public
exhibit because one creator owns both participating personas. Cross-owner
publication remains blocked. The product vision says each creator owns their
persona's contributions and one creator cannot publish another creator's
persona's words without permission, so any cross-owner exhibit, transcript,
excerpt, Salon variant, or archived dialogue needs a separate consent,
revocation, audit, deletion, and readback preflight before implementation.

## Accepted PR508A Shape

PR508A may add an explicit owner publish/retract flow for a dedicated public
exhibit record derived from an existing same-owner saved private session.

The public exhibit may show only owner-authored public metadata:

- public exhibit title;
- public summary or context note;
- optional public tags;
- safe display names or snapshots for the two same-owner personas;
- provenance labels that say the exhibit is owner-curated, public, and derived
  from a private same-owner saved artifact;
- clear copy that no transcript, private setup, source retrieval, raw responder
  reply, or private curation note is published;
- published/retracted/removed status, `publishedAt`, and a public slug;
- owner retract and public report availability.

Public metadata must be newly owner-authored public fields. PR507A private
curation fields must not be automatically copied into public output. The
private candidate marker may only make an artifact eligible for an owner publish
control; it is not publication approval.

PR508A must not include owner-selected excerpts. Excerpts need their own later
preflight because excerpts can expose generated persona words, private setup
context, misattribution risk, or cross-owner consent ambiguity.

## Required Data Boundary

Use a dedicated public exhibit table instead of loosening the private-session
table's private constraints. Recommended shape:

```text
public.persona_encounter_public_exhibits
```

Required properties:

- owner-scoped row with `owner_user_id` and FK to
  `persona_encounter_private_sessions`;
- immutable derivation from a same-owner private session whose owner matches
  `owner_user_id`;
- public slug that is not a raw session/persona/owner id;
- owner-authored public title, summary, and tags with strict length and array
  bounds;
- safe same-owner persona display-name snapshots only;
- status such as `published`, `retracted`, and `removed`;
- `published_at`, `retracted_at`, and moderation/report fields as needed;
- provenance schema such as
  `station.persona_encounter.public_exhibit.v1`;
- RLS that lets only the owner write and lets public reads see only published,
  non-removed records.

The private source row must preserve:

- `shareable = false`;
- `public_visibility = 'private'`;
- `source_retrieval_used = false`;
- owner-only private-session RLS;
- private curation schema and private curation readback semantics.

Do not publicize raw owner ids, persona ids, session ids, provider payloads,
model config, prompt bodies, private context, source bodies, SQL details, stack
traces, cookies, tokens, env values, or secret-shaped strings.

## Required API Boundary

PR508A may add a narrow authenticated owner publish route:

```text
POST /persona-encounters/private-sessions/:sessionId/public-exhibit
```

Required behavior:

- require auth;
- scope by both private session `id` and `owner_user_id`;
- require same-owner personas;
- require an explicit confirmation field such as `confirmPublicExhibit: true`;
- accept only bounded public title, summary, and tags;
- reject extra keys, excerpt fields, setup/reply fields, raw ids, provider
  fields, private curation fields, and share-link fields;
- require `publication_candidate = true` unless DAEDALUS and MIMIR explicitly
  justify a narrower alternative in the implementation handoff;
- create or update only the dedicated public exhibit row;
- perform no provider call, source retrieval, token accounting, storage write,
  queue/worker job, Redis/Cloudflare operation, billing action, or social post.

PR508A must also add owner retract behavior, for example:

```text
PATCH /persona-encounters/public-exhibits/:exhibitId/retract
```

or a close equivalent. Retract must require the owner, hide the public route,
leave the private artifact private, and avoid deleting private source material
unless the owner separately deletes the private session through the existing
private-session flow.

Public read should use a dedicated route:

```text
GET /persona-encounters/public-exhibits/:slug
```

The public route must return only the accepted metadata shape for `published`
records, and must return bounded `404` for missing, retracted, removed, or
unpublished records.

## Moderation And Reporting Boundary

Public visibility is not safe without reporting and takedown support.

Before a public exhibit can be visible, PR508A must add a reportable target such
as:

```text
persona_encounter_public_exhibit
```

Required changes:

- extend the moderation report target-type database constraint;
- update `apps/api/src/routes/reports.ts` validation and report queue filters;
- update DB/types and reports tests;
- add safe admin target context for public encounter exhibits without raw ids,
  private setup, generated reply text, private curation, provider details, SQL,
  stack traces, or secret-shaped values;
- make the public exhibit page expose a report action for signed-in users, or
  a bounded signed-out "sign in to report" path if the existing report API
  remains auth-required;
- include an admin remove/restore path or, at minimum, a moderation-controlled
  `removed` status that hides the public route while keeping safe report queue
  readback.

Owner retract and moderation removal are separate controls. Owner retract is
required for creator control; moderation removal is required for platform
takedown.

## Public Route And UI Boundary

PR508A should use a dedicated web route, such as:

```text
/encounters/[slug]
```

or a close project-native equivalent. Do not add public encounter exhibits to
Discover, public Space pages, public persona pages, search, forums, feeds,
Salon, Station Press, billing, social, archive, Memory, Canon, Continuity, or
Integrity surfaces in the first lane.

Existing public Space/persona/Discover/search/forum routes may be touched only
for no-drift tests or import wiring that is strictly necessary for the dedicated
page. They must not surface private encounter artifacts or exhibit cards in
PR508A.

Studio owner UI may add an explicit publish/retract control only inside the
existing private encounter artifact area. Copy must distinguish:

- private candidate/planning marker;
- explicit public exhibit publication;
- metadata-only public output;
- no transcript/excerpt/raw reply publication;
- same-owner only;
- report/takedown availability.

## Allowed File Scope

Allowed PR508A files:

- next Supabase migration for the public exhibit table and moderation report
  target type;
- `packages/db/src/types.ts`;
- `packages/types/src/index.ts` or close local type files;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/api/src/routes/reports.ts`;
- `apps/api/src/routes/reports.test.ts`;
- public exhibit API helpers/tests if DAEDALUS splits the route;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- `apps/web/components/studio/persona-workspace.tsx`;
- a dedicated public exhibit page and focused page/helper tests;
- moderation-console/report helper files and tests if needed for safe target
  context;
- `apps/web/app/globals.css` only for scoped encounter exhibit layout;
- roadmap and validation docs.

Do not touch package/lockfile, provider adapters/router defaults, conversation
runtime, retrieval/vector/embedding code, public Discover/search/forum/feed
surfacing, Space/persona public serializers except no-drift tests, archive,
Memory, Canon, Continuity, Integrity, Station Press, social connectors,
billing/Stripe, Redis, Cloudflare, queue/worker/webhook code, storage buckets,
or deployment config.

## Required PR508A Tests

DAEDALUS should prove at minimum:

- migration creates the dedicated table, owner/public RLS, bounded constraints,
  public slug uniqueness, status constraints, and the new moderation report
  target type;
- owner publish requires auth, own private session, same-owner personas,
  explicit confirmation, and bounded public fields;
- publish rejects cross-owner sessions, missing sessions, non-candidate sessions
  if the candidate gate is used, extra keys, setup/reply/excerpt fields,
  private curation fields, provider fields, and raw id fields before writes;
- public GET returns only safe metadata for a published exhibit;
- public GET returns `404` for draft, retracted, removed, missing, or
  cross-owner-manipulated records;
- owner retract hides the public route and preserves the private artifact;
- moderation report create/readback supports
  `persona_encounter_public_exhibit` with safe target context;
- moderation removal hides the public route, or the accepted removed-status
  equivalent is fully tested;
- public route serialization never includes setup bodies, generated reply text,
  private curation title/note/tags, raw ids, provider payloads, model config,
  prompts, private context, source bodies, SQL details, stack traces, cookies,
  tokens, env values, or secret-shaped values;
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

ARGUS review must also run changed-path/source scans for public route drift,
cross-owner drift, private artifact leakage, provider/retrieval drift, reporting
coverage, package/lockfile drift, Cloudflare/Redis/queue/worker/storage drift,
billing/social drift, raw-id leakage, and secret-shaped values.

## Hosted Proof After ARGUS Review

If DAEDALUS implements PR508A and ARGUS accepts it, MIMIR should route ARIADNE
for hosted proof before closing the customer-facing public exhibit lane.

Hosted proof should verify:

- hosted migration is applied;
- owner can publish one metadata-only public exhibit from a same-owner private
  candidate artifact on desktop and `390px`;
- signed-out public route shows only safe metadata;
- signed-in user can report the public exhibit or sees the accepted bounded
  report path;
- owner can retract and the public route then returns `404`;
- moderation removal or removed-status hiding works if included;
- signed-out/cross-owner publish/retract attempts fail closed;
- public Space/persona/Discover/search/forum samples show no private encounter
  artifact drift;
- cleanup removes or retracts the public exhibit and deletes the proof artifact
  if one was created;
- sanitized proof output records no raw ids, prompt/setup bodies, generated
  reply text, private curation text, provider details, env values, token values,
  cookies, SQL detail, stack traces, screenshots, traces, videos, browser
  storage state, or secret-shaped values.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 30 encounter API/runtime tests passed, including private-session auth, owner create/list/detail/delete, private curation update/clear, malformed-body rejection, cross-owner boundaries, provider/quota/rate/empty-output failures, and runtime copy. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 reports route tests passed, covering report persistence, reporter scoping, admin queue/status updates, safe target contexts, and moderation review requests. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 199 Studio helper tests passed, including encounter contract/readiness/runtime copy, moderation report helpers, route context, publishing retract copy, and bounded owner-visible text helpers. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Changed-path scan | Pass | PR508 is a preflight-only docs/status update. No code, schema, package, lockfile, public route, provider, storage, billing, queue/worker, Redis, Cloudflare, or social implementation files changed. |
| Existing-surface scan | Pass | Current encounter code is private-session/curation only. Current reports validation accepts `user`, `space`, `document`, `thread`, `comment`, and `persona`, so PR508A must explicitly add a public encounter exhibit report target before visibility. |
| Product-boundary scan | Pass | Product vision allows public encounters only with structure, creator control, and permission for another creator's persona words; PR508A stays same-owner and metadata-only. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, OpenAI-style key, Google key, Slack token, or bearer-token-shaped values found in the touched roadmap/testing files. |
| Scope scan | Pass | Public/shareable, cross-owner, provider, source retrieval, storage, billing, queue/worker, Redis, Cloudflare, social, Archive, Memory, Canon, Continuity, Integrity, Station Press, package, and lockfile matches are guardrail or required-boundary text only. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR508A as ACCEPT_PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_ONLY.
- The next safe public encounter lane is same-owner, owner-authored public exhibit metadata for already saved same-owner private encounter artifacts.
- PR508A may add explicit owner publish/retract, a dedicated public exhibit table, a dedicated public route, and report/takedown support.
- PR508A must not publish transcripts, raw generated responder replies, owner-selected excerpts, private setup, private curation, raw ids, provider payloads, prompts, private context, source bodies, or cross-owner persona words.
- Cross-owner exhibits and excerpts remain blocked behind later hostile preflights with consent/revocation/audit semantics.
- Full PR508 preflight validation passed.
Task:
- Close PR508 if accepted and route the next implementation lane using the exact metadata-only public/private/consent boundary in this result.
```
