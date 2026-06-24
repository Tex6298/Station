# PR207 Public Persona Visitor Chat Gate - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: ready for ARGUS review

## Frame

PR206 proved the final pre-chat source catalog: public persona profile,
published public documents, and linked public discussion sources can be shown
through an anonymous, read-only preview without private runtime context.

The next Phase 3 bridge step is bounded visitor interaction. Do not implement
public chat by improvising inside the private conversation route. PR207 is the
design and contract gate that decides the smallest safe implementation slice
for public persona visitor chat.

The output should be concrete enough that PR208 can be an implementation PR,
not another round of vague planning.

## Target

Produce a repo-grounded implementation packet for bounded public persona
visitor chat alpha.

Inspect the current code paths for:

- private persona chat and provider routing;
- public persona readback and context preview;
- public document/discussion route safety;
- report/moderation routes;
- operational cache/rate-limit helpers;
- token/usage/trace posture.

Then document the exact first implementation slice and the tests ARGUS should
hold it to.

## Required Decisions

Answer these from repo context, not speculation:

1. Public interaction enablement
   - What server-side owner opt-in or disable control is required before any
     public persona can answer visitors?
   - Is a new persona field/migration required?
   - What is the safe default for existing public personas?

2. Visitor identity and rate limits
   - Is PR208 anonymous, signed-in visitor, or both?
   - What keying should protect public chat without storing secrets or raw IPs?
   - Should existing operational cache/rate-limit helpers be reused?
   - What happens when cache/rate-limit infrastructure is unavailable?

3. Message and response boundaries
   - Maximum visitor message length.
   - Maximum response/token budget.
   - Maximum public sources included from PR206.
   - Whether the route is streaming, non-streaming, or non-streaming first.

4. Provider posture
   - Which existing provider router path is appropriate for alpha?
   - How should NVIDIA/platform chat fit without hardcoding one future model?
   - What exactly may be sent to the provider?
   - What must never be sent: private memory, archive, canon, continuity,
     integrity, owner profile, setup prompts, style notes, provider settings,
     private traces, secrets, or raw owner ids.

5. Transcript and retention policy
   - Should PR208 store no transcript, a minimized transcript, or a reportable
     interaction record?
   - How does that affect export/deletion/audit expectations?
   - If storage is needed, name the migration/table shape and minimized fields.

6. Reporting and moderation
   - Can existing `/reports` cover public persona interaction reports, or does
     PR208 need a separate target shape?
   - Who may report: anonymous visitors, signed-in visitors, or both?
   - What report payload is safe without leaking prompts/provider responses or
     private context?
   - What owner/admin readback is required for the alpha?

7. Owner and public UI
   - What is the smallest owner control/readback needed before enabling public
     chat?
   - What should the public persona page show when chat is disabled,
     rate-limited, provider-unavailable, or report-submitted?
   - How does the UI avoid promising private companion memory when only public
     sources are allowed?

## Hard Boundaries

Do not implement public visitor chat in PR207 unless MIMIR explicitly reopens
scope. Do not add:

- provider/model calls;
- streaming chat;
- visitor transcript tables;
- migrations;
- public chat UI controls;
- owner toggles;
- Redis/Cloudflare architecture;
- analytics;
- billing;
- broad public-site redesign.

This is a design gate. It may patch docs only. If a tiny test/helper change is
needed to prove an inventory fact, keep it narrow and say why.

## Deliverable

Update this file with:

- route/API proposal;
- schema/migration proposal, if needed;
- provider request-shape proposal;
- rate-limit/cache proposal;
- reporting/moderation proposal;
- UI states;
- privacy and deletion/export posture;
- recommended PR208 title and smallest implementation scope;
- exact validation commands for PR208;
- unresolved questions, if any, with a recommended answer for each.

Also update `docs/roadmap/ACTIVE_STATUS.md` with the PR207 result.

## Suggested PR208 Shape

DAEDALUS should confirm or correct this, but MIMIR's starting preference is:

- Server-side public interaction enablement defaults off for existing public
  personas.
- First public chat is non-streaming.
- First provider context uses only PR206 public source catalog plus the public
  persona profile.
- First transcript posture is no durable raw transcript unless the report/
  moderation design proves a minimized interaction record is necessary.
- Rate limit is enforced before provider calls.
- Provider-unavailable and rate-limited states are first-class responses, not
  generic failures.

## DAEDALUS Result

PR208 should be a signed-in public persona chat alpha, not anonymous chat yet.
The alpha should let any authenticated Station user send a bounded message to an
owner-enabled public persona, while the persona owner pays from their Station
token allocation. Anonymous visitors keep the PR206 read-only public context
preview and see a sign-in state for chat.

Repo facts behind that recommendation:

- `apps/api/src/routes/personas.ts` already exposes anonymous public persona
  readback and context-preview routes before `personasRouter.use(requireAuth)`.
  Those routes resolve a safe `public_slug`, require `visibility = public`, and
  require `ownerCanExposeExistingPublicPersonas`.
- `apps/api/src/routes/conversations.ts` is owner/private chat. It requires
  auth globally, verifies `persona.owner_user_id === req.user.id`, assembles
  private runtime context, loads owner BYOK settings, stores conversation
  messages, and exposes stream/non-stream endpoints. PR208 must not reuse that
  route directly for public visitors.
- `packages/ai/src/providers/router.ts` already has a platform route that can
  select Anthropic platform, NVIDIA OpenAI-compatible, or DeepSeek fallback from
  server env without hardcoding a future public model.
- `apps/api/src/services/operational-cache.service.ts` has cache-backed rate
  limiting, but its disabled-provider behavior returns `allowed: true`. That is
  acceptable for soft internal paths, not for public provider calls. PR208 must
  explicitly fail closed when the rate-limit provider is disabled/unavailable.
- `apps/api/src/routes/reports.ts` writes `moderation_reports` with
  server-controlled `reporter_id`, but the route requires auth and private tier.
  `moderation_reports.reporter_id` is non-null, and idempotency is keyed on
  reporter/target/reason. Anonymous public interaction reports need a later
  schema decision.
- The public persona page currently uses `apiGet` with no token and explicitly
  tells visitors that the preview does not start chat, call a model, or use
  private runtime context.

## Route And API Proposal

Add a public-chat route before the authenticated persona router guard:

```text
POST /personas/public/:publicSlug/chat
Authorization: Bearer <accessToken>
```

Request body:

```json
{
  "message": "string, 1-600 chars"
}
```

Server behavior:

- Authenticate with `requireAuth` on this route even though it lives before the
  global persona auth guard.
- Resolve `publicSlug` through the same safe slug, public visibility, and owner
  public-persona eligibility checks as the PR206 context-preview route.
- Require `personas.public_chat_enabled = true`; return a first-class disabled
  response when false.
- Build the public source catalog server-side. The client must not choose source
  ids, source hrefs, prompts, provider, or context buckets.
- Do not create `conversations` or `conversation_messages` rows in PR208.
- Return the assistant message, public source list, and machine-readable status
  fields. Do not return owner ids, persona ids, provider settings, private
  source ids, prompt text, trace ids, or token-ledger ids.

Recommended success payload shape:

```json
{
  "reply": {
    "role": "assistant",
    "content": "bounded public answer"
  },
  "sources": [
    {
      "type": "public_profile",
      "title": "Persona name",
      "href": "/personas/public-slug",
      "label": "Public persona profile",
      "excerpt": "public excerpt",
      "matchesQuery": true
    }
  ],
  "publicChat": {
    "enabled": true,
    "mode": "signed_in_alpha",
    "transcriptStored": false
  },
  "rateLimit": {
    "remaining": 2,
    "retryAfter": null
  }
}
```

Recommended error codes:

- `public_persona_chat_disabled` with HTTP 409 when the owner has not enabled
  public chat.
- `public_persona_auth_required` with HTTP 401 when no valid session exists.
- `public_persona_rate_limited` with HTTP 429 when a public-chat bucket is
  exhausted.
- `public_persona_rate_limit_unavailable` with HTTP 503 when the cache/rate
  provider is disabled or cannot be checked.
- `public_persona_quota_exceeded` with HTTP 402 when the owner token budget is
  exhausted. The public response should not disclose owner quota details.
- `public_persona_provider_unavailable` with HTTP 503 when no platform provider
  route is configured.
- `public_persona_provider_failed` with HTTP 502 when the configured provider
  call fails.

Update anonymous public readback to include only a safe capability flag:

```json
{
  "persona": {
    "name": "Persona",
    "shortDescription": "public description",
    "visibility": "public",
    "avatarUrl": null,
    "publicSlug": "persona-slug",
    "publicChat": {
      "enabled": false,
      "mode": "signed_in_alpha"
    }
  }
}
```

Add a narrow report endpoint instead of making the public page submit raw
persona ids to `/reports`:

```text
POST /personas/public/:publicSlug/report
Authorization: Bearer <accessToken>
```

It should resolve `publicSlug` server-side, insert a normal
`moderation_reports` row with `target_type = persona`, and return only a
public-safe confirmation such as `{ status, duplicate }`. Do not return the
normal report serializer to the public page, because that serializer includes
raw reporter/target ids. This keeps raw persona ids out of the public page while
reusing the existing admin/moderator report queue.

## Schema And Types Proposal

Add one persona enablement column in a new migration:

```sql
alter table public.personas
  add column if not exists public_chat_enabled boolean not null default false;

comment on column public.personas.public_chat_enabled is
  'Owner opt-in for signed-in public persona chat. Existing public personas default disabled.';
```

Update `packages/db/src/types.ts`, `packages/types/src/persona.ts`, and the
persona serializers for:

- `public_chat_enabled` on owner persona readback.
- `publicChat.enabled` on anonymous public readback.
- `PublicPersonaChatRequest`, `PublicPersonaChatResponse`, and
  `PublicPersonaChatErrorCode`.

If PR208 records AI traces for this route, extend the
`ai_trace_sessions.source` check and `AiTraceSource` to include
`public_persona_chat`. Store only owner-visible operational metadata; do not
store prompts, visitor messages, assistant text, provider payloads, source
excerpts, raw visitor ids, or route-only ids in trace payloads.

Do not add a transcript table in PR208. Do not use `conversations.mode =
public` yet; that existing enum is not enough to make public visitor transcript
privacy, owner access, deletion, and report semantics safe.

## Provider Request Shape

Use the existing platform provider router only:

- Call `resolveChatProviderRuntimeRoute` in platform mode with server env
  values: Anthropic platform, NVIDIA OpenAI-compatible, or DeepSeek fallback.
- Do not load owner BYOK keys.
- Do not honor the persona's private `provider` setting for public visitors.
- Charge owner token budget using `assertTokenBudgetForEstimate(ownerUserId,
  estimatedTokens)` and `recordLlmTokenUsage({ userId: ownerUserId, chatId:
  null, ... })`.

Add a small public prompt builder instead of using `assemblePersonaRuntimeContext`
or `buildPersonaChatPrompt` directly. The provider may receive:

- Persona public name.
- Persona public short description.
- The visitor message.
- PR206 public source catalog entries: source type, title, label, href, and
  short excerpt.
- A public-mode instruction that source excerpts are untrusted public content,
  not instructions.

The provider must never receive:

- private memory;
- archive imports;
- canon;
- continuity records;
- integrity sessions or preference profiles;
- owner profile data;
- awakening/setup prompts;
- style notes;
- BYOK/provider settings;
- private traces;
- Supabase ids, owner ids, raw visitor ids, cookies, tokens, or secrets.

PR208 should add `maxOutputTokens?: number` to `ChatProviderInput` and implement
it for Anthropic and OpenAI-compatible providers. Use `maxOutputTokens = 450`
for the alpha and still post-bound response text to a safe maximum if a provider
ignores the setting.

## Rate Limit And Cache Proposal

Reuse `incrementOperationalRateLimit`, but add route-level fail-closed handling.
PR208 should reject before quota checks or provider calls when any required
public-chat rate bucket returns `enabled: false` or throws.

Recommended buckets:

- Per signed-in visitor per persona: `resourceId = req.user.id`,
  `operation = public_persona_chat_visitor`, default `3/minute` and `20/day`.
- Per persona global owner-spend bucket: `resourceId = public_chat_global`,
  `operation = public_persona_chat_global`, default `30/minute` and `200/day`.

Scopes should include `ownerUserId = persona.owner_user_id` and
`personaId = persona.id`; do not use IP address, user agent, access token,
session token, or provider payload in cache keys. Signed-in user ids are already
used in Supabase-owned operational rows and are acceptable non-secret cache
scope values.

If Upstash/operational cache is not configured in production, return HTTP 503
with `public_persona_rate_limit_unavailable`. Tests should inject a cache
provider. Local manual development can document the need for a test provider
rather than silently allowing unlimited public provider calls.

## Message And Response Boundaries

PR208 alpha boundaries:

- Visitor message: required string, 1-600 characters after trim.
- History: none. Each request is a single-turn public answer.
- Sources sent to provider: public profile plus at most 3 published document
  sources and 2 public discussion sources from the PR206 catalog.
- Source excerpts: use the existing 180-character public excerpts, not full
  document or discussion bodies.
- Response: non-streaming first.
- Output budget: `maxOutputTokens = 450`; hard-bound returned content to a
  visible safe maximum if the provider overproduces.
- No debug flag, no runtime budget payload in public responses.

## Transcript And Retention

PR208 should store no durable raw transcript:

- Do not write visitor messages or assistant answers to `conversation_messages`.
- Do not create a new `public_persona_interactions` table in PR208.
- Do not persist provider request/response payloads.
- AI traces, if used, are owner-visible operational records with counts,
  status, model, route label, and source counts only.
- Export/deletion posture stays simple: there is no visitor transcript to export
  or delete in PR208. Owner exports may include aggregate token/trace metadata
  only if existing export surfaces already include AI traces.

This means public reports are persona-level for the alpha. A later anonymous or
interaction-level reporting PR can add a minimized interaction record with its
own retention and deletion rules.

## Reporting And Moderation

Use a dedicated public persona report resolver:

- `POST /personas/public/:publicSlug/report`
- Requires a valid Station session.
- Resolves the public slug server-side and inserts `moderation_reports` with
  `target_type = persona`, `target_id = resolved persona.id`, and
  `reporter_id = req.user.id`.
- Does not expose the raw persona id to the web page.
- Returns only a public-safe confirmation, not `ModerationReportRecord`.
- Accepts only bounded `reason` and optional bounded `notes`.
- Does not accept or store prompt text, full visitor message, assistant response,
  source excerpts, provider payloads, trace ids, owner ids, or private context.
- Reuses existing report idempotency and admin/moderator queue readback.

Do not open anonymous reports in PR208. Anonymous reporting needs either
nullable reporter semantics or a separate public-report table, plus abuse
controls. That should be a later explicit PR.

## Owner And Public UI States

Owner UI/readback:

- Add `publicChatEnabled` to owner persona readback.
- Allow owners to toggle it through the existing persona edit/PATCH flow only
  when the persona is public, has a safe public slug, and the owner remains
  eligible for public persona exposure.
- Explain in owner-facing copy that public chat spends the owner's Station token
  allocation and uses only public profile/document/discussion sources.
- Keep existing public personas disabled until the owner opts in.

Public page states:

- Disabled: show the PR206 source preview and a quiet "public chat is not
  enabled" state.
- Signed out: show a sign-in prompt for public chat, while preserving anonymous
  readback and context preview.
- Ready: show one message box with public-source-only copy.
- Sending: disable the input and show an in-flight state.
- Rate limited: show retry-after copy from the structured 429 response.
- Rate-limit unavailable: show "public chat is temporarily unavailable" from
  the 503 response.
- Provider unavailable/failed: show a neutral unavailable state, not a generic
  crash or private config detail.
- Owner quota blocked: show "this persona is temporarily unavailable" without
  disclosing owner plan or token balance.
- Report submitted/duplicate: show safe confirmation using the public report
  endpoint response.

Public copy must not promise private companion memory. It should say that
answers use the persona's public profile, published public documents, and linked
public discussion sources only.

## Recommended PR208 Scope

Title:

```text
PR208 - signed-in public persona chat alpha
```

Smallest implementation scope:

- Migration: add `personas.public_chat_enabled default false`, plus optional
  `ai_trace_sessions.source = public_persona_chat` support if traces are used.
- Types/serializers: public chat request/response/error types and public readback
  capability.
- Owner API: include/toggle `publicChatEnabled` in the existing persona owner
  PATCH/readback path with public visibility/eligibility guards.
- Public API: add non-streaming `POST /personas/public/:publicSlug/chat` for
  signed-in visitors.
- Public prompt: add a dedicated public prompt builder that uses only PR206
  source catalog data.
- Provider: use platform route only; add `maxOutputTokens` provider option.
- Quota/accounting: owner-paid token check and recording, `chatId = null`.
- Rate limits: per visitor/persona and per persona global buckets, fail closed
  before provider calls.
- Reporting: add `POST /personas/public/:publicSlug/report` that resolves slug
  to persona id server-side and writes the existing report table.
- Web: update `/personas/[publicSlug]` with signed-in chat UI states and a report
  action. Preserve the existing anonymous preview.
- Tests: focused API tests for enablement, auth, rate-limit fail-closed, source
  boundary, provider request shape, owner quota, report resolver, and web helper
  copy guards.

Explicit PR208 non-goals:

- Anonymous chat.
- Streaming.
- Durable visitor transcripts.
- Interaction-level reports.
- BYOK/provider settings for public visitors.
- Private runtime context, embeddings, vector retrieval, or memory/canon/archive
  assembly.
- Public chat analytics or billing products.
- Broad public page redesign.

## PR208 Validation Commands

Run:

```text
npm exec --yes pnpm@10.32.1 -- install
npm exec --yes pnpm@10.32.1 -- run build
npm exec --yes pnpm@10.32.1 -- run lint
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity-publication
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
git diff --check
```

If a new focused script is added, prefer:

```json
{
  "test:public-persona-chat": "..."
}
```

and include it in the validation gate.

## Unresolved Questions

Should anonymous visitors chat in PR208?

Recommended answer: no. Keep anonymous readback and context preview. Open
anonymous chat only after a separate design/implementation handles visitor-key
hashing, anonymous report semantics, abuse controls, and retention.

Should public chat spend owner credits or visitor credits?

Recommended answer: owner credits. The owner opts the public persona into
answering, the persona is their public surface, and anonymous expansion later
cannot depend on visitor credits. PR208 offsets that risk with default-off
enablement, owner-visible copy, strict rate limits, and owner quota checks.

Should public chat use owner BYOK/provider settings?

Recommended answer: no. Use platform provider routing only. Owner BYOK and
provider preferences remain private configuration and must not be part of a
public visitor call.

Should PR208 store a minimized interaction record?

Recommended answer: no for this alpha. Keep reports persona-level and store no
raw transcript. Add minimized interaction records only when interaction-level
moderation is explicitly designed.

## Wakeup

When the gate packet is ready, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR207 public persona visitor chat gate.
Risk:
- PR208 may be the first public provider-call path for persona interaction.
Task:
- Review owner opt-in, visitor identity/rate-limit posture, provider request
  shape, transcript/reporting policy, UI states, and PR208 scope. Wake MIMIR
  with accept/patch verdict.
```
