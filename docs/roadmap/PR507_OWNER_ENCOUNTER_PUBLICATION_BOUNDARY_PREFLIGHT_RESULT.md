# PR507 - Owner Encounter Publication Boundary Preflight Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Decision

ARGUS accepts the next safe encounter lane as:

```text
ACCEPT_PR507A_OWNER_ENCOUNTER_CURATION_METADATA
```

This chooses candidate 1 from the PR507 preflight. The smallest safe
customer-facing next step is private, owner-only curation metadata on already
saved same-owner encounter artifacts.

This is not approval for candidate 2 public encounter exhibits, candidate 3
cross-owner saved encounters, or any deferred public/shareable/autonomous
encounter surface. Public exhibits and cross-owner encounters still need their
own hostile preflights before DAEDALUS touches implementation.

## Why Candidate 1 Is Safe

PR506D proved the private artifact loop:

- a same-owner owner can create one saved private encounter artifact;
- owner list/detail/delete readback works on desktop and `390px`;
- signed-out and cross-owner probes fail closed;
- public Space/persona samples do not expose private encounter material while
  an artifact exists;
- the stored artifact is owner-only, private, not public, not shareable, not a
  transcript, and uses no source retrieval.

The current implementation and schema enforce that posture through
`persona_encounter_private_sessions`, owner-scoped API queries, private
provenance readback, `shareable = false`, and `public_visibility = 'private'`.
Adding bounded owner-authored metadata can improve the private owner workflow
without changing publication, consent, or public-route semantics.

## Rejected Candidate Boundaries

Candidate 2, owner-curated public encounter exhibit, is not safe as the next
implementation lane. It would require a separate publication contract for:

- explicit publish/retract owner action;
- public schema and public route boundaries;
- safe public summary/excerpt shape;
- moderation, reporting, and takedown behavior;
- visibility tests proving private setup, raw responder output, raw ids,
  provider payloads, private context, and secrets never reach public routes.

Candidate 3, cross-owner private encounter consent, is not safe to combine with
PR507A. It requires bilateral consent, revocation, audit, ownership, readback,
and deletion semantics before any two-owner saved artifact can exist.

Candidate 4, defer encounter expansion, is not necessary. The private artifact
loop is now hosted-proven, and owner-only curation metadata is a narrower,
useful lane that preserves every PR506/PR506D boundary.

## Accepted PR507A Product Shape

PR507A may add owner-only curation metadata to private encounter artifacts:

- owner-authored title;
- owner-authored summary or note;
- owner-authored tags;
- private candidate marker for later public-presentation consideration;
- owner list/detail readback and edit/delete behavior for that metadata.

All curation metadata remains private and owner-only. The candidate marker is
only an internal owner planning flag. It must not create a public route, share
link, public preview, public index entry, public exhibit, or publishable
artifact.

PR507A should not use provider/model calls to title, summarize, tag, classify,
moderate, or transform the encounter. Keep this lane owner-authored and
metadata-only.

## Required Data Boundary

PR507A may extend `public.persona_encounter_private_sessions`, or use a
dedicated owner-only companion table if DAEDALUS can justify the narrower RLS
shape. Either way, the data boundary must stay private:

- preserve `shareable = false`;
- preserve `public_visibility = 'private'`;
- preserve `source_retrieval_used = false`;
- preserve owner-only RLS;
- keep raw owner/persona ids out of API/UI readback;
- keep existing setup and responder reply private;
- keep metadata bounded and owner-authored.

Suggested metadata fields:

```text
owner_title text
owner_summary text
owner_tags text[]
publication_candidate boolean not null default false
curation_schema text not null default
  'station.persona_encounter.private_session_curation.v1'
```

DAEDALUS may choose close local names, but visible API/UI copy must not imply
publication readiness.

## Required API Boundary

PR507A may add one authenticated owner metadata update route, or a narrow PATCH
on the existing private-session detail route:

```text
PATCH /persona-encounters/private-sessions/:sessionId/curation
```

The route must:

- require auth;
- validate a strict bounded body;
- scope by both `id` and `owner_user_id`;
- update only owner-authored curation metadata;
- return bounded owner readback without owner ids, persona ids, provider
  details, prompt internals, SQL detail, stack traces, cookies, tokens, or
  secret-shaped values;
- return bounded `404` for missing or cross-owner session ids;
- perform no provider call, source retrieval, token accounting, queue/worker
  job, storage write, public route write, or publication side effect.

Existing owner list/detail routes may include the private curation readback.
Existing create/delete behavior must remain private and delete/discard-safe.

## Allowed File Scope

Allowed PR507A files:

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

Do not touch package/lockfile, provider adapters/router defaults, public Space
or public persona routes, conversation/chat routes, archive/import/retrieval
routes, Memory, Canon, Continuity, Integrity, Station Press/export routes,
social connectors, billing/Stripe, Redis, Cloudflare, queue/worker/webhook
code, storage buckets, deployment config, or broad Studio/public UI.

## Forbidden Scope

PR507A must not add:

- public/shareable encounter pages, links, feeds, exhibit routes, publish
  controls, or public previews;
- any public display of owner setup, raw generated responder reply, raw ids,
  provider payloads, prompt bodies, private context bodies, source bodies,
  tokens, env values, SQL details, stack traces, cookies, or credentials;
- cross-owner saved encounters or cross-owner curation;
- anonymous/visitor encounter persistence;
- autonomous/background/scheduled encounters;
- provider/model calls, automatic summaries, classifier calls, retries, or
  provider-policy changes;
- Archive, Memory, Canon, Continuity, Integrity, Station Press, social,
  billing, package/export, queue/worker, Redis, Cloudflare, storage, or hosted
  runtime drift.

## Required PR507A Tests

DAEDALUS should prove at minimum:

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

ARGUS review must also run changed-path/source scans for public encounter
drift, cross-owner drift, provider-policy drift, durable writes outside the
private curation boundary, source retrieval/vector/embedding drift,
package/lockfile drift, Cloudflare/Redis/queue/worker/storage/billing/social
drift, raw-id leakage, and secret-shaped values.

## Hosted Proof After ARGUS Review

If DAEDALUS implements PR507A and ARGUS accepts it, MIMIR should route ARIADNE
for hosted proof because PR507A changes visible owner Studio behavior and
private-session API readback.

Hosted proof should verify:

- owner can create or use one private saved encounter artifact;
- owner can add/edit/clear private curation metadata on desktop and `390px`;
- owner list/detail readback shows metadata without raw ids or unsupported
  public/share controls;
- signed-out and cross-owner metadata probes fail closed;
- public Space/persona samples show no private artifact or curation metadata;
- cleanup deletes the artifact;
- sanitized proof output records no raw ids, prompt/setup body, responder reply
  body, provider details, env values, tokens, cookies, SQL detail, stack trace,
  screenshots, traces, videos, or secret-shaped values.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 26 encounter API/runtime tests passed, including private-session auth, owner create/list/detail/delete, cross-owner boundaries, provider/quota/rate/empty-output failures, disposable-preview behavior, and no client-certified reply coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 198 Studio helper tests passed, including encounter readiness, contract, runtime, private-session path, and bounded copy coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Changed-path scan | Pass | Only this PR507 result plus `ACTIVE_STATUS.md` and `LANE_INDEX.md` changed. No code, schema, package, lockfile, public route, provider, storage, billing, queue/worker, Redis, Cloudflare, or social implementation files changed. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, OpenAI-style key, Google key, Slack token, or bearer-token-shaped values found in the touched roadmap files. |
| Scope scan | Pass | Public/shareable, cross-owner, provider, source retrieval, storage, billing, queue/worker, Redis, Cloudflare, and social matches are guardrail/forbidden-scope text only. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR507A as ACCEPT_PR507A_OWNER_ENCOUNTER_CURATION_METADATA.
- The next safe customer-facing encounter lane is private owner-only curation metadata on existing saved same-owner private encounter artifacts.
- Curation may include owner-authored title, summary/note, tags, and a private candidate marker for later public-presentation consideration.
- The candidate marker is not publication, sharing, public exhibit, public route, cross-owner consent, moderation, or provider-generated summary approval.
- Public exhibit and cross-owner encounter work remain blocked behind separate hostile preflights.
Task:
- Close PR507 if accepted and decide whether to wake DAEDALUS for PR507A.
```
