# PR206 Public Persona Public Context Sources - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: closed by MIMIR after ARGUS acceptance

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

## DAEDALUS Implementation

Implemented on 2026-06-24.

What changed:

- Expanded
  `GET /personas/public/:publicSlug/context-preview?query=<short visitor query>`
  from profile-only to public source catalog readback.
- Public document sources are included only when they are directly linked to the
  public persona through `documents.persona_id` or
  `documents.source_persona_id`, `status = published`, `visibility = public`,
  and a public Space route exists.
- Public discussion sources are included only when a routeable public document
  has `discussion_thread_id`, the linked thread is active, public, non-hidden,
  and its forum category has a slug.
- The response includes source labels, counts, hrefs, short public excerpts,
  match flags, and the PR205 excluded private buckets.
- The response does not emit separate owner ids, persona ids, document ids,
  thread ids, category ids, provider settings, private prompts/style fields, or
  private source columns. Current public document/forum hrefs do include
  document/thread ids because those are the existing public routes; PR206 treats
  them as route hints and does not create a new public slug scheme.
- The PR205 public page panel already renders richer source rows generically, so
  no new visible controls or chat affordances were added.
- `document-discussions.test.ts` gained `maybeSingle()` in its in-memory
  Supabase fixture so the required discussion gate can exercise `spacesRouter`
  after the public-persona eligibility helper.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:personas` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:spaces` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:writing` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in the public Space page and Discover front door.

Non-scope confirmation:

- No visitor chat, model/provider call, embeddings/vector retrieval,
  Redis/Cloudflare/cache/queue architecture, analytics, moderation/reporting UI,
  owner controls, public route redesign, Roulette, Salons, voice/avatar, public
  persona events, or persona-to-persona encounters were added.

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

## ARGUS Review Result

Reviewed on 2026-06-24.

Verdict: accept PR206.

Findings:

- Public document sources are limited to rows linked through
  `persona_id`/`source_persona_id` for the public persona, with
  `status = published`, `visibility = public`, and a public Space route.
- Public discussion sources are limited to routeable documents with a linked
  active, public, non-hidden thread and a category slug.
- Private, community-only, unpublished, private-Space, unrelated, hidden, and
  non-public discussion sources were covered by tests and omitted from the
  anonymous payload.
- The payload emits source labels, counts, hrefs, bounded public excerpts, match
  flags, and explicit private exclusions. It does not emit separate owner ids,
  persona ids, document ids, thread ids, category ids, provider settings,
  prompt/style fields, private source columns, memory/archive/canon/continuity/
  integrity content, or secret-shaped strings.
- Existing public document/forum hrefs still contain document/thread route ids.
  ARGUS accepts that as the current public route contract for PR206 because
  they appear only inside route hints for already-public rows; PR206 does not
  introduce a new public slug scheme or expose those ids as standalone fields.
- Query behavior remains deterministic text matching. No provider/model call,
  embeddings/vector retrieval, visitor transcript, private runtime context,
  Redis/Cloudflare/cache/queue architecture, analytics, moderation/reporting UI,
  owner controls, public route redesign, or chat affordance was added.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:personas` - pass, 8 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:spaces` - pass.
- `npm exec --yes pnpm@10.32.1 -- run test:writing` - pass, 10 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` - pass, 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` - pass.
- `npm exec --yes pnpm@10.32.1 -- run lint` - pass with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `git diff --check HEAD^ HEAD`, `git diff --check`, and
  `git diff --cached --check` - pass.
- Secret/raw-id-shaped scan over the PR206 diff - pass, no hits.

ARGUS wakes MIMIR to close PR206 and decide the next Phase 3 bridge move.

## MIMIR Closeout

Closed on 2026-06-24.

Decision:

- Accept PR206 as the final pre-chat source catalog slice.
- Open PR207 as a design gate before bounded public persona visitor chat, so
  owner opt-in, rate limits, provider request shape, transcript/reporting
  posture, and UI states are settled before a provider-call implementation.
