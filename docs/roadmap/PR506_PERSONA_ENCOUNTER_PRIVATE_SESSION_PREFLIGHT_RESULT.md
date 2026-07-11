# PR506 - Persona Encounter Private Session Preflight Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Decision

ARGUS accepts the next implementation lane as:

```text
ACCEPT_PR506A_OWNER_ENCOUNTER_PRIVATE_SESSION_ARTIFACT
```

DAEDALUS may implement the smallest owner-only private encounter session
artifact. This is not approval for cross-owner encounters, public/shareable
encounter output, autonomous/background runs, scheduled encounters, multi-turn
loops, Memory/Archive/Canon/Continuity/Integrity retrieval, source buckets,
public pages, social publishing, billing, queues, workers, Redis, Cloudflare,
storage buckets, broad provider policy, voice/avatar, Salon/live-event work, or
hosted runtime expansion.

ARGUS does not choose `ACCEPT_PR506A_OWNER_ENCOUNTER_SAVE_CONTRACT_ONLY`
because hosted PR505D already proved the same-owner provider route can return a
nonblank disposable responder reply, and a private owner-only table-backed
artifact can be scoped without public/shareable rights. ARGUS does not choose a
blocker because transcript ownership, provenance, delete behavior, rate/token
accounting, and public/private boundaries can be handled inside the narrow
contract below.

One correction is mandatory: PR506A must not let the browser submit arbitrary
reply text and have the server certify it as a model-generated responder reply.
The saved artifact must be created by the server-owned encounter generation
path after an explicit owner create/save action. The existing preview remains
disposable by default and must continue to report `saved:false`.

## Accepted Product Shape

PR506A may add a private Studio-only saved encounter artifact:

- The authenticated owner selects two personas they own.
- The owner writes the setup.
- The owner clicks an explicit saved-artifact action, separate from the
  disposable preview action.
- The server verifies both personas belong to `req.user!.id` before provider
  resolution, quota/rate-limit checks, generation, or insert.
- The server makes at most one provider call and persists at most one
  nonblank responder reply from that call.
- The saved artifact is private to the owner and not public or shareable.
- The owner can read a bounded Studio list/detail and hard-delete/discard the
  artifact.

UI copy should say the saved action creates a private saved encounter artifact.
Do not claim it saves the exact visible disposable preview unless DAEDALUS first
adds a server-verifiable same-output receipt without trusting client-submitted
generated text; that receipt variant is not part of PR506A.

## Required Data Model

Use a dedicated table, not `conversations`, `conversation_messages`,
`archived_chat_transcripts`, `continuity_candidates`, `memory_items`,
`canon_items`, `export_packages`, or public seminar/social tables.

Allowed migration:

```text
infra/supabase/migrations/074_persona_encounter_private_sessions.sql
```

or the next available migration number if `074` is no longer free.

The table should be named:

```text
public.persona_encounter_private_sessions
```

Required columns:

- `id uuid primary key default gen_random_uuid()`;
- `owner_user_id uuid not null references public.profiles(id) on delete cascade`;
- `initiator_persona_id uuid not null references public.personas(id) on delete cascade`;
- `responder_persona_id uuid not null references public.personas(id) on delete cascade`;
- `owner_setup text not null` with a bounded length matching the preview setup
  limit;
- `responder_reply text not null` with a bounded length matching the preview
  reply bound;
- `initiator_name_snapshot text not null`;
- `responder_name_snapshot text not null`;
- `provenance_schema text not null default
  'station.persona_encounter.private_session.v1'`;
- `source_retrieval_used boolean not null default false`;
- `shareable boolean not null default false`;
- `public_visibility text not null default 'private'`;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()`.

Required constraints:

- initiator and responder persona ids differ;
- `provenance_schema` equals
  `station.persona_encounter.private_session.v1`;
- `source_retrieval_used = false`;
- `shareable = false`;
- `public_visibility = 'private'`;
- setup and reply are non-empty after application normalization;
- no provider route label, model name, provider payload, prompt body, private
  context body, token counts, source buckets, storage paths, or env/config
  values are stored in the artifact row.

Required indexes/RLS:

- index owner/private-session reads by `(owner_user_id, created_at desc)`;
- optional narrow indexes for owner/persona history if the UI needs them;
- enable RLS;
- owner policy for select/insert/delete/update only when
  `auth.uid() = owner_user_id`;
- insert/update policy must also require both referenced personas to be owned by
  `auth.uid()`.

The internal owner/persona foreign keys exist for authorization and joins only.
They must not be returned in API readback, rendered in UI, included in artifact
provenance, logged, or written into roadmap/test docs.

## Required API Boundary

Add authenticated owner routes under the existing encounter router:

```text
POST /persona-encounters/private-sessions
GET /persona-encounters/private-sessions
GET /persona-encounters/private-sessions/:sessionId
DELETE /persona-encounters/private-sessions/:sessionId
```

`POST /persona-encounters/private-sessions` must:

- require auth;
- accept a strict body shaped like the current preview input:

```ts
{
  initiatorPersonaId: string;
  responderPersonaId: string;
  setup: string;
  maxOutputTokens?: number;
}
```

- reject extra keys;
- trim and bound setup before prompts or persistence;
- load both personas as owner-scoped rows before provider resolution;
- fail cross-owner/missing personas with bounded `403` or `404` before provider
  calls, token rows, rate-limit increments, or durable writes;
- reuse the accepted route-specific provider resolution, NVIDIA opt-in, token
  estimate, fail-closed rate-limit, no-retry, and empty-output guard behavior;
- call the provider at most once;
- insert exactly one private session row only after the provider returns a
  nonblank bounded responder reply;
- record token usage with `chatId:null` and no prompt/output text in token
  metadata, following the preview route posture;
- return bounded saved-artifact provenance without owner ids, persona ids,
  provider settings, route labels, env values, raw prompts, private profile
  notes, token counts, stack traces, SQL detail, cookies, auth tokens, or
  secret-shaped values.

`GET /persona-encounters/private-sessions` must list only the signed-in owner's
sessions. It may include the private session id as an opaque handle for detail
and delete, but must not return owner ids or raw persona ids.

`GET /persona-encounters/private-sessions/:sessionId` must scope by both
`id` and `owner_user_id`. Cross-owner or missing rows must return bounded
`404`.

`DELETE /persona-encounters/private-sessions/:sessionId` must hard-delete only
the signed-in owner's row and return a bounded receipt. It must not echo the
deleted setup, reply, owner id, persona ids, provider details, stack traces, SQL
detail, or secret-shaped values. Repeated/cross-owner deletes should be bounded
`404` or idempotent owner-safe receipt, but must not reveal row existence across
owners.

Do not add update, publish, share, export, public page, anonymous, visitor,
background, scheduled, queue, worker, storage, webhook, billing, social,
Station Press, voice/avatar, Salon, or live-event routes in PR506A.

## Required Provenance

Saved artifact API/UI readback must label:

- owner-authored setup;
- selected same-owner personas by safe display names only;
- model-generated responder reply;
- private owner-only artifact;
- server-created saved artifact;
- no source retrieval;
- not public;
- not shareable.

Saved artifact readback must not claim:

- autonomous persona-to-persona conversation;
- bilateral cross-owner consent;
- public transcript;
- shareable output;
- Memory, Archive, Canon, Continuity, Integrity, vector, embedding, archived
  chat, or source-body grounding;
- provider/model configuration visibility;
- publication, social posting, Station Press packaging, billing, scheduling,
  live room, voice, avatar, or Salon behavior.

Because PR506A stores the owner setup and generated responder reply, copy must
be honest that a private artifact is stored. It should not reuse the preview's
`Not saved` or `Disposable preview only` labels for saved sessions.

## Allowed File Scope

DAEDALUS may touch only:

- `infra/supabase/migrations/074_persona_encounter_private_sessions.sql`, or
  the next free migration number;
- `packages/db/src/types.ts`;
- `packages/types/src/index.ts` or a close local type file if needed;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- `apps/web/components/studio/persona-workspace.tsx`;
- `apps/web/app/studio/personas/[personaId]/page.tsx` only for narrow owner
  surface wiring;
- `apps/web/app/globals.css` only for small scoped private-session styles if
  existing styles are insufficient;
- roadmap and validation docs.

Do not touch package/lockfile, provider adapters/router defaults,
conversation/chat routes, archive/import/retrieval routes, public persona or
public Space pages, social connector routes, Station Press/export routes,
billing/Stripe, Redis/Cloudflare/cache architecture, queues/workers/webhooks,
storage buckets, deployment config, or broad Studio/public UI.

## Required Tests

DAEDALUS should prove at minimum:

- migration creates the table, constraints, indexes, updated_at trigger, and
  owner/persona RLS without weakening existing policies;
- signed-out create/list/detail/delete returns `401`;
- same-owner create generates one nonblank responder reply and inserts exactly
  one private session row;
- same-owner list/detail returns only safe labels, setup, reply, created time,
  names, private provenance, and opaque session handle;
- cross-owner initiator/responder ids fail before provider resolution, provider
  call, token usage, rate-limit increments, or inserts;
- cross-owner list/detail/delete cannot read or reveal another owner session;
- disabled/failing rate-limit cache fails closed before provider call or insert;
- exhausted token quota fails before provider call or insert;
- provider config failure returns bounded error before provider call or insert;
- provider failure or empty reply returns bounded error and inserts no session;
- no automatic retry occurs;
- successful saved generation records token usage with `chatId:null` and no
  prompt/output text in token metadata;
- the route does not insert `conversations`, `conversation_messages`,
  `archived_chat_transcripts`, continuity candidates, memory, canon, archive
  chunks, export packages, public/shareable rows, or source retrieval rows;
- delete hard-deletes or otherwise removes owner readback for the session, with
  bounded receipt and no deleted content echo;
- preview route remains disposable with `saved:false`,
  `transcriptStored:false`, `shareable:false`, and `sourceRetrieval:false`;
- API/UI do not expose owner ids, raw persona ids, provider keys, base URLs,
  model config, env values, provider payloads, prompt internals, private profile
  notes, token values, SQL/table details, stack traces, storage paths, source
  bodies, cookies, bearer/JWT-shaped values, or secret-shaped material;
- public persona and public Space samples remain free of encounter controls,
  saved encounter output, shareable encounter pages, cross-owner controls,
  anonymous controls, and availability claims;
- Studio UI readback is owner-only, bounded, delete/discard-capable, and honest
  that saved artifacts are private stored artifacts.

Minimum validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

ARGUS review must also run changed-path/source scans for provider policy,
public encounter drift, durable persistence outside the accepted table, source
retrieval/vector/embedding drift, package/lockfile drift, Cloudflare/Redis/
queue/worker/storage/billing/social drift, raw-id leakage, and secret-shaped
values.

## Hosted Proof Required After ARGUS Review

ARIADNE hosted proof is required after ARGUS accepts a PR506A implementation
because PR506A changes schema/RLS, private owner API behavior, provider-backed
saved generation, and visible owner Studio behavior.

Hosted proof must verify:

- hosted migration for `persona_encounter_private_sessions` is applied;
- signed-in owner can create exactly one saved private same-owner encounter
  artifact;
- saved readback shows owner-authored setup, selected same-owner safe names,
  one model-generated responder reply, private owner-only artifact, no source
  retrieval, not public, and not shareable;
- signed-in owner can list/detail and delete/discard the artifact;
- after delete, owner readback no longer returns the artifact;
- signed-out create/list/detail/delete fail closed;
- cross-owner create/detail/delete fail closed without revealing row existence;
- desktop and 390px mobile owner Studio surfaces fit without overlap and do not
  render raw ids or unsupported controls;
- sampled public Space and public persona routes show no saved encounter
  output, owner-private controls, public/shareable encounter pages, cross-owner
  controls, anonymous controls, or availability claims;
- sanitized proof output records no provider key, env value, raw base URL, raw
  model config, raw owner id, raw persona id, prompt body, private profile body,
  generated reply text beyond bounded visible UI proof, source body, token,
  cookie, SQL detail, stack trace, provider payload, or secret-shaped value.

## ARGUS Baseline Validation

ARGUS reran the current encounter baseline before this wakeup:

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | Reviewed PR506 preflight, PR505D hosted proof/closeout, current encounter route/tests, current Studio encounter helpers, migration/RLS owner patterns, and prior ARGUS preflight-result patterns. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 20 encounter API/runtime tests passed; current preview remains disposable and no-durable. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 196 Studio helper tests passed, including current encounter readiness/contract/runtime copy. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck replayed from cache and passed. |
| Changed-path/source scan | Pass | PR506 result is docs/status/index only; scans found only accepted negative-scope guardrails and the intended DAEDALUS wakeup. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging the PR506 docs/status/index patch. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepts PR506A as ACCEPT_PR506A_OWNER_ENCOUNTER_PRIVATE_SESSION_ARTIFACT.
- Build only an authenticated owner-only private encounter session artifact in a new dedicated table.
- Keep /persona-encounters/preview disposable by default; saved artifacts must be created by the server-owned encounter generation path after an explicit owner action.
- Do not trust client-submitted reply text as model-generated provenance.
- Persist only owner setup, one bounded responder reply, safe persona name snapshots, and private provenance fields; do not persist prompts, provider payloads, private context bodies, source retrieval, raw ids in readback, provider settings, token values, env values, or public/shareable state.
Task:
- Implement the exact schema/API/web/type/test/doc scope in docs/roadmap/PR506_PERSONA_ENCOUNTER_PRIVATE_SESSION_PREFLIGHT_RESULT.md.
- Add POST/GET/GET-by-id/DELETE under /persona-encounters/private-sessions with owner-only access, hard delete/discard, bounded provenance, and no public route.
- Run test:persona-encounters, test:studio-ui, typecheck, git diff --check, and git diff --cached --check.
- Expect ARIADNE hosted proof after ARGUS review.
```
