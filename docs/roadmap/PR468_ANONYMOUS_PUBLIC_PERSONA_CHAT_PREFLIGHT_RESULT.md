# PR468 - Anonymous Public Persona Chat Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_FOR_DAEDALUS`

## Decision

ARGUS accepts a narrow DAEDALUS implementation lane for anonymous public persona
chat, limited to one replay-safe public persona first.

The existing signed-in public persona chat path already has the important
product and safety primitives:

- public-source-only prompt construction;
- owner opt-in through `public_chat_enabled`;
- owner-paid token accounting;
- no conversation/message transcript persistence;
- aggregate-only owner interaction counters;
- fail-closed operational rate limiting;
- public context preview coverage proving private buckets stay out.

The main implementation gap is the signed-in visitor identity dependency in the
chat route and rate-limit key. DAEDALUS may remove that dependency only with the
bounded shape below.

## Required Implementation Shape

- Change only the public persona chat surface and its direct tests/copy.
- Use `optionalAuth` only for `POST /personas/public/:publicSlug/chat`.
- Keep signed-in behavior working for existing enabled public personas.
- Allow anonymous chat only when `publicSlug === "station-replay-alpha-persona"`.
- For anonymous requests to any other public persona chat route, return a stable
  auth-required response such as `public_persona_auth_required`.
- Keep owner enable/disable as the rollback switch. If `public_chat_enabled` is
  false, anonymous and signed-in requests must both remain disabled.
- Derive an anonymous rate-limit key from a minimized hash of the request
  address. Do not store or return raw IP, forwarded headers, cookies, auth
  headers, user agent, prompts, provider payloads, or visitor identity.
- Reuse the existing visitor minute/day and global minute/day operational rate
  limit checks. If the rate-limit store is unavailable, fail closed before any
  provider call.
- Keep token budget checks and token usage charged to the persona owner.
- Keep `transcriptStored:false`; do not create conversations,
  conversation_messages, raw event rows, durable visitor transcript rows, or
  durable visitor identity rows.
- Keep response sources limited to the existing public-source list. Private
  Memory, Archive, Canon, Continuity, Integrity, owner setup, provider config,
  raw event rows, credentials, source bodies, and private documents must not
  enter the prompt or response.
- Extend the public chat mode type/copy only as needed, for example
  `signed_in_alpha | anonymous_alpha`.
- Update the public persona page so the anonymous form is visible only when the
  profile readback says the enabled chat mode is `anonymous_alpha`.
- Keep public persona reporting signed-in only.

## Files For DAEDALUS

Expected files:

- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/personas.test.ts`
- `apps/web/app/personas/[publicSlug]/page.tsx`
- `apps/web/lib/public-persona-route.ts`
- `apps/web/lib/public-persona-route.test.ts`
- `packages/types/src/persona.ts`

Do not touch billing, Stripe, provider/model selection, Redis/Cloudflare/worker
setup, queues, migrations, private persona chat, private runtime context,
moderation actions, or public reporting unless a focused test proves an
unavoidable compile-only type/copy adjustment.

## Required Tests

DAEDALUS should add or update focused tests proving:

- signed-out chat succeeds only for `/personas/station-replay-alpha-persona`
  when public chat is owner-enabled;
- signed-out chat remains blocked for other public personas;
- owner disable rollback blocks anonymous and signed-in chat;
- anonymous rate limiting uses a hashed/minimized key and never includes raw IP,
  forwarded header, cookie, auth header, user agent, visitor prompt, or provider
  key material;
- rate-limit store unavailable returns `public_persona_rate_limit_unavailable`
  before provider calls;
- public-source-only provider payload excludes private Memory, Archive, Canon,
  Continuity, Integrity, owner setup, provider config, private documents, raw
  ids, route-only ids, and source bodies;
- anonymous chat does not create conversations, conversation messages, durable
  visitor identity, raw event, or transcript rows;
- owner token usage is charged to the persona owner with `chat_id: null`;
- owner/admin/public readback remains aggregate/status-only;
- public reporting remains signed-in only;
- web UI shows an anonymous chat form only for enabled `anonymous_alpha` public
  chat and continues to show a sign-in prompt for `signed_in_alpha`.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

## ARGUS Validation

ARGUS preflight validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 12 tests passed; current signed-in public chat, anonymous public readback/context preview, no transcript storage, owner-paid usage, and aggregate counters remain green. |

## Residual Risks

- The anonymous rate-limit key is the fragile boundary. It must be hashed,
  minimized, short-lived through the operational cache TTL, and never returned in
  API responses or docs.
- Anonymous public chat remains an alpha for one replay persona, not general
  public persona availability.
- Hosted browser proof is not part of this preflight. If DAEDALUS lands the
  implementation, MIMIR should decide whether ARIADNE should do a hosted
  anonymous-chat confirmation.
