# PR206 Public Persona Public Context Sources - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: open

## Frame

PR205 proved the anonymous public persona context-preview route and page panel,
but it intentionally returned only the public persona profile source. That was
the right first safety slice. It is not enough context shape for bounded public
visitor chat.

PR206 keeps the product pre-chat. The task is to expand the read-only preview
so it can include already-public, already-routeable Station sources: published
documents and linked public discussion context. This should prove the public
source catalog before any provider call, visitor transcript, or live chat
composer appears.

## Target

Expand:

```text
GET /personas/public/:publicSlug/context-preview?query=<short visitor query>
```

so an eligible public persona can return public-safe source categories beyond
the profile:

- `public_profile`
- `published_document`
- `public_discussion`

The exact type names can change if local naming reads better, but tests must
prove the same boundary.

## Allowed Sources

The preview may include only sources that are already public and routeable to an
anonymous visitor:

- the public persona profile fields already exposed by
  `/personas/public/:publicSlug`;
- published documents whose visibility is public and whose public document
  route is already valid;
- linked public document discussion threads and public-visible comments when
  existing serializers prove they are safe for anonymous readback;
- source labels, counts, public route hints, and short public excerpts from
  those already-public rows.

If a candidate source cannot be linked to a public route, leave it out of
`sources`. It can be counted only if the count itself is already safe and does
not imply private material exists.

## Hard Exclusions

Do not use or expose:

- private memory, archive imports, archive files, archived chats, or transcript
  chunks;
- canon, continuity records/candidates, integrity session notes, lifecycle
  review state, owner memory blocks, preference profiles, handoffs, setup
  prompts, style notes, or private runtime context;
- unpublished, private, community-only, hidden, removed, or otherwise
  non-public documents, threads, or comments;
- owner user ids, raw persona ids, raw document ids, raw thread/comment ids,
  provider/model/BYOK settings, billing, storage paths, cookies, tokens,
  trace bodies, prompt text, or secret-shaped strings.

## Implementation Notes

- Reuse the PR205 public-slug guard, owner public-persona exposure eligibility,
  query normalization, and 120-character query bound.
- Treat `query` as deterministic text matching/ranking, not as a prompt.
- Do not call providers, use embeddings, perform vector retrieval, create
  visitor conversations, or assemble private runtime context.
- Prefer existing public serializers and route helpers over new ad hoc payloads.
- Keep the preview honest when no public documents or discussions exist:
  profile-only is an acceptable result, but counts and empty copy must not imply
  chat is ready.
- Keep output small. Short excerpts should be bounded and should come only from
  fields already visible on public routes.
- If the schema relationship between public persona, public Space, published
  documents, and linked discussions is not direct enough for this PR, wake
  MIMIR with the exact options rather than guessing a broad data model.

## Web Expectations

Update the public persona page preview panel so it can display:

- public profile source;
- published document source rows with route links;
- linked public discussion source rows with route links;
- real source counts for the categories that were queried;
- explicit private bucket exclusions.

Do not add a chat composer, message input, live response copy, provider picker,
visitor transcript, owner controls, analytics, moderation UI, or broad public
site redesign.

## Required Tests

Add focused API and web/helper coverage proving:

- anonymous preview succeeds for an eligible public persona with a safe public
  slug;
- eligible public profile, published public document, and linked public
  discussion sources can appear in the response;
- private, unlisted/community-only, unpublished, hidden, removed, or unrelated
  sources do not appear;
- private personas, unsafe/UUID-shaped slugs, and ineligible public-persona
  owners return `404`;
- overlong query returns `400`;
- payloads do not include owner ids, raw persona/document/thread/comment ids,
  provider settings, private prompt/style fields, private memory/archive/canon/
  continuity/integrity content, or secret-shaped strings;
- the public persona page renders the richer source list without dead controls
  or chat promises.

Run at minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

Adjust validation if the final implementation touches a narrower or broader
route family, but do not skip the public/persona/discussion boundary checks.

## Wakeup

When implemented, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS expanded PR206 public persona context preview to public documents
  and linked public discussion sources.
Risk:
- This source catalog is the final pre-chat context boundary before bounded
  visitor interaction can be considered.
Task:
- Hostile-review source eligibility, anonymous payload shape, raw-id/private
  leakage, query behavior, web copy, and tests. Wake MIMIR with verdict.
```

## Non-Scope

Do not add:

- visitor chat;
- model/provider calls;
- embeddings/vector retrieval;
- Redis/Cloudflare/cache/queue architecture;
- analytics;
- moderation/reporting UI;
- owner controls;
- Roulette, Salons, voice/avatar, public persona events, or persona-to-persona
  encounters.
