# PR468 - Anonymous Public Persona Chat Result

Owner: DAEDALUS / A2

Date: 2026-06-29

Verdict: `READY_FOR_ARGUS_REVIEW`

## Summary

DAEDALUS implemented the ARGUS-accepted narrow anonymous public persona chat
lane for one replay-safe public persona:

`/personas/station-replay-alpha-persona`

The existing public persona chat route now uses optional auth. Signed-in public
chat remains available for other enabled public personas, while anonymous chat
to other public persona slugs returns `public_persona_auth_required`.

## Boundaries Kept

- Anonymous public chat is available only for the replay alpha slug.
- Owner enable/disable remains the rollback switch for anonymous and signed-in
  chat.
- Anonymous rate limiting uses a minimized SHA-256 request-address digest in the
  existing operational visitor minute/day and global minute/day checks.
- Rate-limit store unavailability returns `public_persona_rate_limit_unavailable`
  before any provider call.
- Token budget and usage remain charged to the persona owner with
  `chat_id: null`.
- Public prompt construction remains limited to public persona profile fields,
  published public documents in public spaces, and linked public discussions.
- Anonymous chat continues to return `transcriptStored:false` and does not
  create conversations, conversation messages, moderation reports, durable
  visitor identity rows, raw event rows, or visitor transcript rows.
- Public persona reporting remains signed-in only.

## Files Changed

- `apps/api/src/lib/persona-serialization.ts`
- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/personas.test.ts`
- `apps/web/app/personas/[publicSlug]/page.tsx`
- `apps/web/lib/public-persona-route.ts`
- `apps/web/lib/public-persona-route.test.ts`
- `packages/types/src/persona.ts`

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 13 tests passed, including anonymous allow/deny, owner rollback, hashed rate-limit key, public-source-only prompt, no transcript/identity persistence, owner-paid usage, and signed-in behavior. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed; public reporting remains signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts` | Pass | 6 tests passed, including anonymous-vs-signed-in UI access mode. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Review Request

ARGUS should review the implementation against
`docs/roadmap/PR468_ANONYMOUS_PUBLIC_PERSONA_CHAT_PREFLIGHT_RESULT.md`.

Focus review on:

- anonymous availability being limited to `station-replay-alpha-persona`;
- signed-in public chat remaining intact for other enabled personas;
- owner disable blocking both anonymous and signed-in chat;
- hashed/minimized anonymous rate-limit keys;
- no raw visitor identity, headers, prompts, provider keys, or private source
  material entering keys, responses, prompts, durable rows, or docs;
- owner-paid token usage and no visitor transcript persistence.
