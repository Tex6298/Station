# PR208 Signed-In Public Persona Chat Alpha - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: open

## Frame

PR207 is accepted. The implementation lane is now open.

This is the first public provider-call path for public persona interaction, so
keep it smaller than the eventual product: signed-in alpha only, owner opt-in
default-off, single-turn non-streaming response, PR206 public sources only, no
durable visitor transcript.

Use `docs/roadmap/PR207_PUBLIC_PERSONA_VISITOR_CHAT_GATE_DAEDALUS.md` as the
source contract. If implementation evidence contradicts that packet, wake MIMIR
with the smallest options instead of broadening scope.

## Target

Implement signed-in public persona chat alpha.

Core route:

```text
POST /personas/public/:publicSlug/chat
Authorization: Bearer <accessToken>
```

Core reporting route:

```text
POST /personas/public/:publicSlug/report
Authorization: Bearer <accessToken>
```

Owner enablement:

- Add `personas.public_chat_enabled boolean not null default false`.
- Existing public personas remain disabled.
- Owners can enable/disable only when the persona is public, has a safe public
  slug, and the owner remains eligible for public persona exposure.

## Required Implementation

1. Schema and types
   - Add a migration for `public_chat_enabled`.
   - Update generated DB/types as needed.
   - Add public chat request/response/error types.
   - Add public readback capability:
     `publicChat: { enabled: boolean; mode: "signed_in_alpha" }`.

2. Owner API/readback
   - Include `publicChatEnabled` in owner persona readback.
   - Allow owner PATCH/update to toggle the field under the public/slug/
     eligibility guards.
   - Do not let private/ineligible personas enable public chat.

3. Public chat API
   - Require signed-in Station user.
   - Resolve public slug server-side using PR206 safety and owner exposure
     checks.
   - Require `public_chat_enabled = true`.
   - Validate message length: 1-600 chars after trim.
   - Build the public source catalog server-side; client cannot pick source ids,
     hrefs, provider, prompt, or context buckets.
   - Rate-limit before quota checks or provider calls.
   - Fail closed if rate-limit/cache infrastructure is disabled or unavailable.
   - Check owner token budget and record owner-paid usage with no chat id.
   - Use platform provider route only.
   - Return assistant reply plus public source list and machine-readable status.
   - Do not create `conversations` or `conversation_messages` rows.

4. Provider request shape
   - Add `maxOutputTokens?: number` to provider input and implement it for
     Anthropic and OpenAI-compatible providers where needed.
   - Use `maxOutputTokens = 450` for public chat alpha.
   - Provider input may include public persona name, public short description,
     visitor message, source type, source title, citation label, and short
     public excerpt.
   - Do not send source `href`s upstream when they contain raw route ids or
     other route-only ids.
   - Never send private memory, archive, canon, continuity, integrity, owner
     profile, setup prompt, style notes, owner BYOK/provider settings, private
     traces, raw ids, cookies, tokens, or secrets.

5. Reporting
   - Add `POST /personas/public/:publicSlug/report`.
   - Require signed-in Station user.
   - Resolve slug server-side and write `moderation_reports` with
     `target_type = persona`.
   - Return only public-safe confirmation, not the normal admin/report
     serializer.
   - Do not accept/store prompt text, full visitor message, assistant response,
     source excerpts, provider payloads, trace ids, owner ids, or private
     context.

6. Web
   - Preserve anonymous readback and PR206 context preview.
   - Signed-out visitors see chat as sign-in-required.
   - Disabled public chat shows a quiet disabled state, not a broken input.
   - Ready state has one message box and clear public-source-only copy.
   - Rate-limited, rate-limit-unavailable, provider-unavailable, provider-failed,
     owner-quota-blocked, and report-submitted states are explicit.
   - Do not promise private companion memory or continuity. Public chat uses
     public profile, published public documents, and linked public discussions
     only.

## Hard Boundaries

Do not add:

- anonymous chat;
- streaming;
- durable visitor transcripts;
- interaction-level reports;
- BYOK/provider settings for public visitors;
- private runtime context, embeddings, vector retrieval, memory/canon/archive/
  continuity/integrity assembly;
- public chat analytics or billing product;
- broad public page redesign;
- Redis/Cloudflare architecture changes.

## Validation

Run focused tests and any broader suites touched by the implementation.

Minimum expected commands:

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Add a narrower script such as `test:public-persona-chat` if that is cleaner,
and include it in the handoff.

Required proof:

- disabled by default;
- owner-only enable/disable guards;
- signed-in-only chat;
- private/ineligible/unsafe slug rejects;
- rate-limit fail-closed before provider;
- provider request has no href/raw route id/private bucket leakage;
- no conversation rows are created;
- owner-paid quota path is used;
- report resolver writes through server-side slug resolution without exposing
  raw persona ids to the public page;
- public UI states do not expose private config or imply private memory.

## Wakeup

When implemented, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR208 signed-in public persona chat alpha.
Risk:
- This is the first public provider-call path for persona interaction.
Task:
- Hostile-review owner opt-in, public route eligibility, rate-limit fail-closed
  behavior, provider request shape, quota/usage, no-transcript posture, report
  resolver, UI states, and tests. Wake MIMIR with verdict.
```
