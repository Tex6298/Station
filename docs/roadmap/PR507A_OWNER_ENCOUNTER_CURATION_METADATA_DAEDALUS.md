# PR507A - Owner Encounter Curation Metadata

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-07-11

Status: Open for implementation

## Decision Source

ARGUS accepted this lane in:

`docs/roadmap/PR507_OWNER_ENCOUNTER_PUBLICATION_BOUNDARY_PREFLIGHT_RESULT.md`

Accepted verdict:

```text
ACCEPT_PR507A_OWNER_ENCOUNTER_CURATION_METADATA
```

## Product Goal

Improve the hosted-proven owner encounter loop by letting the owner privately
curate saved same-owner private encounter artifacts.

This is private workspace organization, not publication.

## Scope

Implement owner-only curation metadata for existing saved private encounter
artifacts:

- owner-authored title;
- owner-authored summary or note;
- owner-authored tags;
- private candidate marker for later public-presentation consideration;
- owner list/detail readback and edit/clear/delete behavior for that metadata.

The candidate marker is a private planning flag only. It must not create a
public route, public preview, share link, public index entry, public exhibit,
moderation state, cross-owner consent state, or publication approval.

## Data Boundary

Use the next Supabase migration. You may extend
`public.persona_encounter_private_sessions`, or use a dedicated owner-only
companion table if that produces a narrower RLS shape.

Suggested fields:

```text
owner_title text
owner_summary text
owner_tags text[]
publication_candidate boolean not null default false
curation_schema text not null default
  'station.persona_encounter.private_session_curation.v1'
```

Preserve:

- `shareable = false`;
- `public_visibility = 'private'`;
- `source_retrieval_used = false`;
- owner-only RLS;
- delete/discard safety;
- no raw owner/persona ids in API or visible UI readback.

## API Boundary

Add one authenticated owner metadata update route, or a narrow PATCH on the
existing private-session detail route:

```text
PATCH /persona-encounters/private-sessions/:sessionId/curation
```

The route must:

- require auth;
- validate a strict bounded body;
- scope writes by both `id` and `owner_user_id`;
- update only owner-authored curation metadata;
- return bounded owner readback;
- return bounded `404` for missing or cross-owner session ids;
- avoid leaking provider details, prompts, SQL detail, stack traces, cookies,
  tokens, env values, raw ids, or secret-shaped values.

Existing owner list/detail routes may include the private curation readback.
Existing create/delete behavior must remain private and delete/discard-safe.

## Studio UI

Add owner-only Studio controls for saved private encounter artifacts:

- add/edit/clear title, summary/note, tags;
- toggle the private candidate/planning marker;
- show the metadata in owner list/detail readback;
- fit desktop and `390px`;
- keep copy explicit that this is private planning, not publish/share/public
  exhibit/moderation/cross-owner consent.

## Forbidden Scope

Do not add or touch:

- public/shareable encounter pages, links, feeds, exhibits, publish controls,
  or public previews;
- public display of setup body, raw generated responder reply, raw ids,
  provider payloads, prompt bodies, private context, source bodies, tokens,
  env values, SQL detail, stack traces, cookies, or credentials;
- cross-owner saved encounters or cross-owner curation;
- anonymous or visitor encounter persistence;
- autonomous, background, or scheduled encounters;
- provider/model calls, automatic summaries, classifier calls, retries, or
  provider-policy changes;
- Archive, Memory, Canon, Continuity, Integrity, Station Press, social,
  billing, package/export, queue/worker, Redis, Cloudflare, storage, deployment
  config, or broad Studio/public UI.

Do not touch package or lock files.

## Allowed File Scope

Allowed files:

- next Supabase migration for private-session curation metadata;
- `packages/db/src/types.ts`;
- `packages/types/src/index.ts` or a close local type file if needed;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- `apps/web/components/studio/persona-workspace.tsx`;
- `apps/web/app/studio/personas/[personaId]/page.tsx` only for narrow owner
  wiring if needed;
- `apps/web/app/globals.css` only for small scoped owner-private metadata
  layout;
- roadmap and validation docs.

Anything else needs a note in the result explaining why it was unavoidable.

## Required Tests

Prove at minimum:

- migration/RLS preserves owner-only private-session access and does not weaken
  existing private-session constraints;
- signed-out metadata read/update attempts return `401`;
- owner can create a private session and add/edit/clear bounded owner-authored
  curation metadata;
- owner list/detail returns private curation readback without raw owner/persona
  ids;
- cross-owner metadata read/update returns bounded `404` and does not reveal
  row existence;
- invalid bodies, overlong title/summary/tags, extra keys, and malformed tag
  arrays fail before writes;
- metadata updates perform no provider call, token accounting, source
  retrieval, queue/worker job, storage write, public route write, or new
  durable rows outside the accepted private curation boundary;
- delete/discard removes owner readback for the artifact and its metadata;
- public Space/persona samples remain free of encounter artifacts, curation
  metadata, public/shareable controls, and availability claims;
- Studio owner UI copy calls the marker a private candidate/planning flag and
  does not claim publication, sharing, moderation, public exhibit, cross-owner
  consent, or exact preview save behavior.

Minimum validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

## Result Required

Write:

`docs/roadmap/PR507A_OWNER_ENCOUNTER_CURATION_METADATA_RESULT.md`

Then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR507A owner-only private encounter curation metadata.
- The implementation should preserve PR506D/PR507 private-session boundaries.
- Public exhibit and cross-owner encounter work remain out of scope.
Task:
- Review implementation, run validation, and wake MIMIR with verdict.
```
