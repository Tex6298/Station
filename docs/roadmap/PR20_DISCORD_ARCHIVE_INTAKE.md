# PR20 - Discord Archive Intake

Date: 2026-06-17
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS implementation, ARGUS review, ARIADNE only if a visible import
journey changes materially.

## Why This Lane Is Next

The import pipeline now handles ChatGPT, Claude, and narrow Reddit archive
sources. The remaining no-config launch-core intake source named in the patch
plan is Discord. This should be manual archive intake only: uploaded or pasted
exports become private archive source material and review candidates when the
shape is clearly Discord.

This lane must not become a Discord bot, OAuth integration, server crawler,
webhook listener, or public community bridge.

## Goal

Add safe Discord-sourced archive intake so a user can upload a Discord export
or pasted channel/thread source and Station can preserve it as private archive
material, create owner-reviewable candidates when the parser recognizes the
shape, and fail safely when the shape is unknown.

The replay proof should be:

> Station can ingest a recognized Discord channel/thread export as private
> archive source material, preserve source metadata, keep it out of runtime
> context before review, create pending owner-scoped candidates, and reject
> unknown Discord-like JSON without archiving raw private payloads.

## Current Baseline

- Parser routing supports ChatGPT, Claude, Reddit, explicit legacy
  role/content arrays, text, and Markdown.
- Unknown JSON fails before archive memory creation.
- Parsed imports create private archive chunks through `processUploadedFile`.
- Parsed ChatGPT, Claude, and Reddit imports create pending import-backed
  Memory/Canon candidates through `continuity_candidates`.
- Imported archive chunks are private/quarantined and fail closed out of runtime
  context unless explicitly active.
- Active import jobs are quota-guarded.

## Scope

Parser boundary:

- Add a `discord` parser under `apps/api/src/services/imports/parsers/`.
- Extend `ParsedImportFormat` and parser routing so recognized Discord JSON is
  parsed explicitly.
- Keep `.json` extension authority over misleading text MIME types.
- Recognize only narrow, test-backed Discord shapes. Suggested first shapes:
  - DiscordChatExporter-style JSON with `messages` plus channel/guild metadata;
  - thread/channel objects with `messages` arrays whose rows include Discord
    markers such as author/user objects, timestamp, id, channel/guild/server
    names or IDs, attachments, embeds, or message type fields.
- Do not accept a generic top-level array just because it has `content`, `text`,
  `author`, or `timestamp`.
- Preserve chronological/channel order deterministically.
- Include source metadata such as parser, source name, message count, server or
  guild name, channel name, and export timestamp when present.
- Keep text/Markdown fallback for non-JSON source files, but do not call
  unrecognized JSON "discord" or archive it as raw text.

Import and candidate behavior:

- Update import candidate generation so parsed Discord imports can create
  pending owner-scoped candidates with `persona_files` provenance.
- Keep raw Discord source bodies private. Candidate summaries should be
  excerpts or review prompts, not full dumps.
- Imported Discord chunks must remain quarantined/private before owner review,
  preserving PR17 fail-closed behavior.
- Accept/reject behavior should reuse existing import-backed candidate
  machinery without changing archived-chat behavior.
- Duplicate file registration and active-job quota behavior must remain intact.

Live Discord/API posture:

- Do not require Discord bot tokens, OAuth credentials, webhooks, gateway
  subscriptions, or live Discord API calls for this lane.
- If DAEDALUS identifies exact future Discord OAuth/bot scopes, rate limits, or
  data APIs needed for live pull/recurring intake, document them as a follow-up
  section only. Do not implement live Discord integration here.

## Out Of Scope

- Discord bot, OAuth, webhook, gateway, or server crawler.
- Recurring Discord pulls or scheduled imports.
- Public community/forum bridge.
- Reddit live API/OAuth.
- BullMQ/Redis worker deployment.
- Export worker redesign.
- Full import review workspace UI.
- Cloudflare retrieval, vector reindexing, Redis memory truth, public
  publishing, billing/pricing changes, social posting, or UI reskin.

## Validation

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add `test:community` only if forum/public discussion behavior is touched.
Add `test:auth` only if OAuth/session behavior is touched; this lane should not
need it.

## Required Tests

- Discord parser extracts recognized channel/thread content with stable labels
  and deterministic order.
- Discord parser preserves safe source metadata without leaking raw private
  payloads into errors.
- Generic arrays or arbitrary JSON with only content/text/author/timestamp fail
  before archive memory creation.
- Malformed JSON remains sanitized and owner-visible through import-job failure.
- Parsed Discord file import creates private archive chunks plus pending
  import-backed candidates.
- Parsed Discord archive chunks stay out of runtime context before owner review.
- Existing ChatGPT, Claude, Reddit, legacy array, text, Markdown, and
  unknown-JSON tests still pass.
- Active import-job quota and duplicate exact file registration still pass.
- Other owners cannot read, claim, accept, reject, or infer another owner's
  Discord import/candidates.

## Handoff To ARGUS

Wake A3 / ARGUS with:

- parser files changed and exact Discord shapes supported;
- routing behavior for `.json`, misleading MIME, text, and Markdown;
- import candidate behavior and source provenance;
- runtime quarantine/fail-closed evidence;
- owner-scope and non-owner rejection evidence;
- quota/idempotency preservation evidence;
- validation commands and results;
- documented future live Discord OAuth/bot/API needs, if any;
- caveats about deferred live Discord integration, recurring pulls, workers,
  Reddit OAuth, Cloudflare, vectors, Redis memory truth, publishing, billing,
  social posting, and UI.

ARGUS should review parser overclaiming, memory poisoning, owner/private
boundaries, sanitized failures, source metadata leakage, Discord credential
scope creep, quota bypasses, and accidental product expansion.
