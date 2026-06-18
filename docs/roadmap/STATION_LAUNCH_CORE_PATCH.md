# Station launch-core patch

Date: 2026-06-16
Status: launch-core sufficient for protected-alpha replay as of 2026-06-18;
see `STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
Owner lane: MIMIR to sequence, DAEDALUS to implement, ARGUS to validate, ARIADNE to polish UX

## Purpose

This patch turns the current protected-alpha Station build into a clear launch-core execution lane.

The codebase already contains real Station foundations: Persona Studio records, runtime persona context, Memory, Canon, Integrity Sessions, Public Spaces, forums, Developer Spaces, exports, token/storage/billing primitives, and local AI trace logging. The next work is not to import more systems. The next work is to finish the launch core on top of the existing Supabase/API/Next structure.

Launch-core means the Phase 1 product promise from the Station documents is coherent in use:

- private Studio with active chats, archive flow, persona libraries, Memory, Canon, Integrity Sessions, and Station Assistant;
- public Spaces and document publishing;
- forum/community beta;
- Discover as a public front door;
- four onboarding paths;
- Reddit/conversation import;
- export/backup trust.

## What this patch changes immediately

### 1. Persona chat history now uses the latest turns

`apps/api/src/routes/conversations.ts` now loads the newest 20 prior conversation messages and normalises them back into chronological order before prompt assembly. The previous query could send the oldest 20 messages instead of the current working context.

### 2. Runtime debug payloads are production-gated

Persona chat responses can expose `_debug` context counts in test/dev when explicitly requested, but production never receives those counts. This keeps operator diagnostics available outside production while preventing accidental public leakage of runtime-context internals.

### 3. Station Assistant MVP is now wired

The API exposes `/assistant/summary`, `/assistant/context`, and `/assistant/message`. The Studio has `/studio/assistant` and sidebar/mobile navigation. The Assistant is operational only: archive, publishing, continuity, and export guidance, not a persona with Canon.

### 4. Global archive summary is live-backed

`/imports/archive` now returns an owner-scoped private archive summary across memory, persona files, import jobs, archived chats, Integrity Sessions, and documents. The Studio Global Archive panel now loads this live data instead of static preview cards.

### 5. Document types now match Station vocabulary

The shared document type union, API validation, web labels, seeds, tests, and Supabase constraints now use `essay`, `codex`, `manifesto`, `field_log`, `research`, `archive_note`, and `transcript`, with a migration that maps old `post`, `constitution`, `update`, and `other` rows into the new taxonomy.

### 6. `.env.example` documents the debug switch

`STATION_EXPOSE_AI_DEBUG=false` is now listed as an explicit diagnostics flag.

## Required direction

Build the current Station architecture forward. Do not replace it.

The existing code should remain the base for:

- persona runtime context;
- Memory/Canon/archive chunks;
- Integrity Sessions;
- Public Spaces;
- native forums;
- Developer Spaces;
- exports;
- token/storage/billing primitives;
- AI trace logging.

The upstream repositories remain references for specific missing behavior, not skeletons to import.

## Implementation lanes

### Lane 1 — Chat/runtime hardening

Existing files to extend:

- `apps/api/src/routes/conversations.ts`
- `packages/ai/src/retrieval/context-builder.ts`
- `packages/ai/src/retrieval/semantic-search.ts`
- `packages/ai/src/providers/*`
- `packages/ai/src/prompts/persona-chat.ts`

Do:

- keep latest-turn retrieval fixed;
- add an explicit context/token budget report before provider calls;
- add SSE response streaming for chat;
- keep production runtime diagnostics gated;
- make topology weighting affect retrieval order and/or prompt framing in measurable ways;
- add focused tests that prove latest-turn ordering, archived-chat read-only behavior, quota failure behavior, and context-count trace metadata.

Checks:

```bash
pnpm typecheck
pnpm test:persona-context
pnpm test:conversation-archive
pnpm test:token-credits
```

Finish instructions:

- chat payloads should contain only conversation ID and saved reply in production;
- operator context counts should remain visible in dev/test only when explicitly requested, and absent from production responses even if `STATION_EXPOSE_AI_DEBUG=true` is set;
- latest-message tests must fail if the query ever returns the oldest messages again;
- trace events must still record context counts internally.

Polish instructions:

- chat error messages should tell the user whether the issue is quota, provider configuration, archived conversation state, or unknown provider failure;
- Studio chat loading states should distinguish “assembling continuity” from “waiting for model response.”

### Lane 2 — Global archive and private search

Existing files to extend:

- `apps/api/src/routes/imports.ts`
- `apps/api/src/routes/persona-files.ts`
- `apps/api/src/routes/discover.ts`
- `apps/api/src/services/archive.service.ts`
- `apps/api/src/services/export.service.ts`
- `apps/web/components/studio/archive-library.tsx`
- `apps/web/app/studio/personas/[personaId]/files/page.tsx`

Do:

- implement a real global private library surface, not a preview/static panel;
- search documents, archive items, memory items, canon items, persona files, import jobs, and archived transcripts under owner-only visibility;
- display source/evidence links for every result that was generated from imported or archived material;
- show import/export health states in the same archive trust language already used on persona Archive tabs.

Checks:

```bash
pnpm typecheck
pnpm test:storage
pnpm test:conversation-archive
pnpm test:exports
pnpm test:community
```

Finish instructions:

- anonymous visitors must receive no private buckets;
- authenticated non-owners must not see another user's private archive, memory, canon, files, imports, transcripts, or export rows;
- failed imports must leave already stored archive material intact and visible;
- private search should degrade to full-text/metadata results when embeddings are unavailable.

Polish instructions:

- every empty state should answer “is my material safe?”, “what can I add next?”, and “who can see this?”;
- source names should never be blank in the UI; use a fallback such as `Uploaded file`, `Chat import`, or `Archived conversation`.

### Lane 3 — Import pipeline

Existing files to extend or add:

- `apps/api/src/routes/imports.ts`
- `apps/api/src/services/archive.service.ts`
- `apps/api/src/services/imports/parsers/chatgpt.ts`
- `apps/api/src/services/imports/parsers/claude.ts`
- `apps/api/src/services/imports/parsers/discord.ts`
- `apps/api/src/services/imports/parsers/reddit.ts`
- `apps/web/components/studio/archive-library.tsx`

Do:

- split parser logic by source;
- add ChatGPT and Claude parser tests before Reddit;
- add Discord parser only after the first two are stable;
- add Reddit OAuth/import after the background job layer is available;
- feed imported material into the continuity-candidate review flow.

Checks:

```bash
pnpm typecheck
pnpm test:conversation-archive
pnpm test:storage
pnpm test:integrity
```

Finish instructions:

- import jobs must transition through requested/processing/completed/failed with owner-visible error text;
- parsed conversations must preserve original source timestamps when available;
- memory/canon candidates must stay pending until the owner accepts, edits, or rejects them;
- duplicate import registration must be idempotent.

Polish instructions:

- the import UI should name the source format in plain English;
- failure cards should include the next safe action: retry, upload a different export, or download current archive/export.

### Lane 4 — Station Assistant MVP

New files to add:

- `apps/api/src/routes/assistant.ts`
- `apps/api/src/services/station-assistant.service.ts`
- `packages/ai/src/prompts/station-assistant.ts`
- `apps/web/app/studio/assistant/page.tsx`
- `apps/web/components/studio/station-assistant-panel.tsx`

Do:

- implement the Station Assistant as an operational helper, not as a persona;
- give it tools for archive summary, private search, memory/canon suggestion, document draft prep, Space editing help, Integrity Session start, export start, and quota explanation;
- keep it out of persona Canon and persona Memory.

Checks:

```bash
pnpm typecheck
pnpm test:persona-context
pnpm test:integrity
pnpm test:exports
```

Finish instructions:

- Assistant responses must not imply the Assistant is a persistent persona;
- tool calls must enforce owner visibility at the route/service layer;
- Assistant-generated Memory/Canon suggestions must land in candidate review, never directly into canonical records;
- Assistant document drafts must default to private.

Polish instructions:

- Studio should show the Assistant as “platform help / archive / publishing support,” not as another companion;
- first-run Assistant copy should offer three concrete actions: organise archive, prepare a document, start an Integrity Session.

### Lane 5 — Publishing approval workflow

Existing files to extend:

- `apps/api/src/routes/documents.ts`
- `apps/api/src/services/document.service.ts`
- `apps/web/components/studio/publish-flow.tsx`
- `apps/web/app/space/[slug]/docs/*`

New files/tables to add when ready:

- `apps/api/src/services/publishing-approval.service.ts`
- `approval_queue_items`
- `document_versions`
- `document_provenance_events`

Do:

- align document types to Station's product vocabulary: `essay`, `codex`, `manifesto`, `field_log`, `research`, `archive_note`, `transcript`;
- wire the current Publish Flow UI to the real document API;
- add an approval queue state machine inspired by Amanuensis: draft, grounding check, human review, approved/regenerate/cancelled, scheduled/published, archived;
- add provenance labels for user-authored, AI-assisted, imported transcript, persona output, and speculative interpretation.

Checks:

```bash
pnpm typecheck
pnpm test:continuity-publication
pnpm test:document-discussions
pnpm test:community
```

Finish instructions:

- public documents must be explicit opt-in;
- publishing from private material must create a linked public copy rather than exposing the private original;
- Codex documents must support version history before they are marketed as living canonical documents;
- discussion threads must respect document visibility.

Polish instructions:

- the publish button should describe what changes visibility;
- provenance labels should read as trust infrastructure, not legal disclaimers.

### Lane 6 — Background jobs

New files to add:

- `apps/api/src/jobs/*`
- `apps/api/src/workers/*`
- `packages/jobs/*` if shared job contracts are needed

Do:

- introduce BullMQ/Redis or the accepted project queue provider behind a narrow adapter;
- move export generation, import processing, file parsing, memory extraction, memory consolidation, and Reddit archiving onto jobs;
- keep synchronous protected-alpha paths only where job infrastructure is not needed.

Checks:

```bash
pnpm typecheck
pnpm test:conversation-archive
pnpm test:exports
pnpm test:storage
pnpm test:health
```

Finish instructions:

- every job must have owner ID, target type, target ID, status, started/completed timestamps, and owner-visible error message;
- failed jobs must not delete successful prior archive/export data;
- jobs must be idempotent or have explicit duplicate guards;
- readiness endpoints must report queue configuration without exposing secrets.

Polish instructions:

- user-facing job status should use Station language: preserving, indexing, packaging, ready, failed safely;
- do not surface queue jargon in the product UI.

### Lane 7 — Community beta

Existing files to extend:

- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/services/community.service.ts`
- `apps/web/app/forums/*`

Do:

- add sub-community creation and owner moderation for Canon/Developer tiers;
- add moderation queue and appeals;
- add notifications for replies/reports/moderation actions;
- add persona-post provenance labels;
- keep native Station forums as the implementation path.

Checks:

```bash
pnpm typecheck
pnpm test:community
pnpm test:document-discussions
```

Finish instructions:

- sub-community moderators can remove posts inside their space but cannot ban users platform-wide;
- platform moderation actions must be logged;
- persona-authored or AI-assisted posts must be labelled;
- anonymous visitors must not see community-only content.

Polish instructions:

- forum copy should feel serious, moderated, and human;
- mobile thread pages should keep voting/reporting/moderation controls reachable without crowding the post body.

### Lane 8 — Developer Space partner readiness

Existing files to extend:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/services/developer-space-live.service.ts`
- `apps/api/src/services/developer-space-usage.service.ts`
- `packages/developer-space-client/*`
- `apps/web/app/developer-spaces/*`

Do:

- add ingestion-key rate limits;
- add collaborator/project ownership or prepare the schema for it;
- add researcher diagnostics;
- add public/private field controls for event and metric data;
- add partner-ready docs for node updates, events, snapshots, and batch import.

Checks:

```bash
pnpm typecheck
pnpm test:developer-spaces
pnpm test:developer-space-client
pnpm test:health
```

Finish instructions:

- owner console must show raw operational detail;
- public observatory must show only configured public/community-safe fields;
- ingestion docs must include curl and TypeScript examples;
- quota/rate-limit errors must be explicit and machine-readable.

Polish instructions:

- public observatories should explain what the visitor is seeing before showing charts;
- mobile observatory should collapse to a readable summary before canvas-heavy views.

## Upstream reference mapping for this patch

Use each upstream repo only where it strengthens the lane:

| Station lane | Use these references for |
| --- | --- |
| Persona schema | OpenPersona vocabulary only. Existing Station persona-layer tables stay canonical. |
| Memory/archive | Memora for graph/source-backed memory; YesMem for continuity briefings; JKRiver for confidence/decay/contradiction algorithms. |
| Developer Spaces | Mission Control for owner console; AI Observer for event schema; Agents Observe for replay/timeline UX. |
| Publishing | Amanuensis for human approval and grounding state machine. |
| Forums | Flarum/next_discussion_platform for native forum UX. Discourse is only a benchmark/fallback. |
| Deployment | Coolify for readiness/self-hosting UX, not PaaS scope. |
| Cloudflare | NESTstack only as a future edge-memory lane. |

## Definition of sufficient

Station is launch-core sufficient when a test user can do this without developer intervention:

1. choose an onboarding path;
2. create or import a persona;
3. chat with context assembled from Canon, Memory, recent turns, and Integrity output;
4. archive a chat;
5. review and accept/edit/reject Memory and Canon candidates;
6. search their private archive;
7. export their data;
8. publish a private draft as a labelled public document;
9. display that document on a public Space;
10. discuss it in the forum under correct visibility rules;
11. use Station Assistant to understand and operate the above.

## Human polish pass

Run after each lane, not only at the end:

- 375px mobile Studio pass;
- desktop Studio pass;
- archive failure-state pass;
- public Space visitor pass;
- forum anonymous/member/owner pass;
- production-mode response-shape pass;
- empty-state copy pass;
- privacy copy pass.

## Minimum validation before merge

```bash
git diff --check
pnpm typecheck
pnpm test:health
pnpm test:storage
pnpm test:integrity
pnpm test:persona-context
pnpm test:conversation-archive
pnpm test:exports
pnpm test:community
pnpm test:developer-spaces
```

If a lane touches billing, add:

```bash
pnpm test:billing
pnpm test:token-credits
```

If a lane touches publishing discussions, add:

```bash
pnpm test:continuity-publication
pnpm test:document-discussions
```

## Finish rule

A lane is not finished because the happy path works. A lane is finished when:

- owner-only/private boundaries have hostile tests;
- failed states leave previous safe data intact;
- export/import/archive records explain what happened;
- production response shapes do not expose internal debug data;
- mobile UI is usable at 375px;
- the docs name what is complete, what remains alpha, and what is deliberately deferred.

## ARGUS review result - 2026-06-17

ARGUS reviewed `d1d0eaf feat: apply Station launch core patch` and does not
recommend Railway deploy until DAEDALUS lands a narrow follow-up.

Accepted parts:

- `/assistant` and `/imports/archive` use authenticated, owner-scoped reads.
- Persona chat runtime `_debug` is code-gated out of production.
- Document type normalization accepts legacy alpha inputs and stores the new
  launch taxonomy.
- Focused validation passed for typecheck, Assistant, conversation archive,
  continuity publication, document discussions, Developer Spaces, community,
  Spaces, exports, writing, Studio UI, and whitespace.

Required follow-up:

- Add a forward Supabase migration that merges or renames any existing
  `documents-and-constitutions` forum category into `documents-and-codexes`, so
  live document discussion threads do not fork into two categories.
- Make the new signed-in Studio Assistant and live Global Archive layouts usable
  at mobile width; remove newly touched viewport-scaled title type and nonzero
  eyebrow letter-spacing.
- Correct `docs/ops/station-launch-core-patch-checks.md` so it matches the
  implementation: production responses never emit `_debug`, even when
  `STATION_EXPOSE_AI_DEBUG=true`.
- Add minimal hostile route tests for the new private surfaces: unauthenticated
  requests fail, the owner sees their own assistant/archive summary, and another
  user's rows are absent.

DAEDALUS follow-up result, 2026-06-17:

- Added `infra/supabase/migrations/033_merge_document_discussion_forum_category.sql`
  to merge/rename `documents-and-constitutions` into
  `documents-and-codexes` and move existing threads when both categories exist.
- Made the new Studio Assistant and Global Archive layouts mobile-safe without
  viewport-scaled title type or nonzero eyebrow letter-spacing.
- Corrected `docs/ops/station-launch-core-patch-checks.md` to state production
  never emits `_debug` in this patch.
- Added hostile route tests for `/assistant/summary` and `/imports/archive`.
- Ready for ARGUS review before MIMIR/Railway deploy sequencing.

ARGUS follow-up acceptance, 2026-06-17:

- `b92d339` clears the four pre-deploy blockers recorded in the ARGUS review.
- Focused local validation is green for typecheck, Assistant,
  conversation-archive, continuity-publication, document-discussions, Developer
  Spaces, community, Studio UI, Spaces, exports, writing, and whitespace.
- No provider, billing, auth/session, persistence-shape, Developer Space
  semantics, broad product lane, or public visibility behavior was reopened.
- MIMIR should take over Railway/deploy sequencing and decide what remote proof
  is required before marking launch-core accepted.
