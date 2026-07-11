# PR506A - Owner Encounter Private Session Artifact Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Verdict

```text
ACCEPT_PR506A_OWNER_ENCOUNTER_PRIVATE_SESSION_ARTIFACT
```

ARGUS accepts the PR506A implementation. The patch matches the accepted lane:
owner-only private encounter artifacts, dedicated schema, server-owned saved
generation, bounded owner readback, and delete/discard. Hosted ARIADNE proof is
still required before MIMIR closes the product lane.

## Review Findings

No blocking defects found.

Accepted schema/RLS:

- `infra/supabase/migrations/074_persona_encounter_private_sessions.sql` adds a
  dedicated `public.persona_encounter_private_sessions` table instead of
  reusing conversations, archived chats, memory, canon, continuity, exports,
  public seminar, or social tables.
- Constraints keep the artifact private, not shareable, no-source-retrieval,
  same-owner-persona-shaped, and bounded to the accepted setup/reply lengths.
- RLS is enabled with owner select/insert/update/delete policies, and
  insert/update policies require both referenced personas to belong to
  `auth.uid()`.

Accepted API behavior:

- `POST /persona-encounters/private-sessions` uses strict request parsing and
  rejects client-submitted reply/provenance keys.
- Create loads both personas by `owner_user_id = req.user!.id` before provider
  resolution, quota, rate-limit, provider call, token usage, or insert.
- Saved artifacts are created only from the server-owned generation path after
  one nonblank bounded provider response.
- List/detail/delete scope by `owner_user_id` and return bounded owner-safe
  readback. The API returns only an opaque session handle, safe names, setup,
  reply, timestamps, and private provenance.
- Delete hard-deletes the owner row and does not echo deleted setup or reply.
- `/persona-encounters/preview` remains disposable by default and still inserts
  no private session rows.

Accepted UI/helper behavior:

- Studio adds an explicit `Save private artifact` action and readback that says
  it creates a new private saved artifact from a server-generated reply.
- The UI does not claim it saves the exact visible disposable preview.
- Saved artifact helper copy is honest that the artifact is private, saved,
  owner-only, not public, not shareable, and no-source-retrieval.

Boundary confirmation:

- No public/shareable encounter pages or controls.
- No cross-owner encounter access.
- No autonomous/background/scheduled encounters or multi-turn loops.
- No Memory, Archive, Canon, Continuity, Integrity, vector, embedding, archived
  chat, source bucket, source body, conversation, export, Station Press, social,
  billing, Stripe, Redis, Cloudflare, queue, worker, webhook, storage bucket,
  voice/avatar, Salon, live-event, package, lockfile, provider adapter/router,
  or broad provider-policy drift.
- No provider payloads, prompt internals, private context bodies, token values,
  env values, provider keys, base URLs, model config, SQL details, stack
  traces, cookies, auth tokens, `reasoning_content`, or secret-shaped values
  are exposed in API/UI readback.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 26 encounter API/runtime tests passed, including private-session auth, create/list/detail/delete, cross-owner, quota, rate-limit, provider, empty-output, disposable-preview, and no client-certified reply coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 198 Studio helper tests passed, including private-session runtime helper copy. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging the ARGUS review docs/status/index patch. |
| Changed-path/source scan | Pass | Matches were the accepted table/FK columns, owner filters, no-durable-write tests, private provenance fields, and negative-scope guardrail language only. No secret-shaped values or unrelated implementation drift found. |

## Hosted Proof Required

MIMIR should route ARIADNE for hosted proof before closing PR506A. The hosted
proof should verify:

- migration `074_persona_encounter_private_sessions.sql` is applied;
- signed-in owner can create exactly one saved private same-owner encounter
  artifact;
- saved readback shows owner-authored setup, same-owner safe names, one
  model-generated responder reply, private owner-only artifact, no source
  retrieval, not public, and not shareable;
- owner can list/detail and delete/discard the artifact;
- after delete, owner readback no longer returns the artifact;
- signed-out create/list/detail/delete fail closed;
- cross-owner create/detail/delete fail closed without revealing row existence;
- desktop and 390px mobile owner Studio surfaces fit without overlap and do not
  render raw ids or unsupported controls;
- sampled public Space and public persona routes show no saved encounter output,
  owner-private controls, public/shareable encounter pages, cross-owner
  controls, anonymous controls, or availability claims;
- sanitized proof output records no provider key, env value, raw base URL, raw
  model config, raw owner id, raw persona id, prompt body, private profile body,
  generated reply text beyond bounded visible UI proof, source body, token,
  cookie, SQL detail, stack trace, provider payload, `reasoning_content`, or
  secret-shaped value.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR506A owner-only private encounter session artifacts.
- The implementation uses a dedicated persona_encounter_private_sessions table, owner API create/list/detail/delete, server-owned saved generation, strict no client-certified reply provenance, bounded Studio readback, and delete/discard.
- /persona-encounters/preview remains disposable by default.
- No public/shareable, cross-owner, source retrieval, provider payload, token value, raw-id readback, conversation/archive/memory/canon/continuity/export, billing, social, queue/worker, Redis, Cloudflare, storage, Station Press, voice/avatar, Salon, or live-event drift was found.
Task:
- Close PR506A local review and route ARIADNE for hosted proof using the hosted proof checklist in docs/roadmap/PR506A_OWNER_ENCOUNTER_PRIVATE_SESSION_ARTIFACT_REVIEW_RESULT.md.
```
