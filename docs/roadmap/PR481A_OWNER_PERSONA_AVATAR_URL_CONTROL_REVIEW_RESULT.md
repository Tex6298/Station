# PR481A Owner Persona Avatar URL Control ARGUS Review Result

Date: 2026-06-29

Owner: ARGUS / A3

State: ARGUS_ACCEPTED_PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL

Reviewed implementation delta: `c43cf70b..9bdcbede`

Source: `docs/roadmap/PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL_RESULT.md`

## Verdict

ARGUS accepts PR481A after one narrow sanitizer review patch.

The implementation matches the accepted lane: owner-scoped avatar URL
create/update using the existing `personas.avatar_url` field, safe public
serialization, CSS URL escaping on existing public renderers, and a small
owner-only Save/Clear control.

## ARGUS Review Patch

ARGUS tightened the query-name guard in
`apps/api/src/lib/persona-serialization.ts` and added regression coverage in
`apps/api/src/routes/personas.test.ts`.

Patch reason:

- DAEDALUS correctly rejected `api_key`, `access_token`, `token`, `signature`,
  and `x-amz-*` query strings.
- The separator-based query-name pattern still allowed `apikey=abc123` and
  `apiKey=abc123`.
- ARGUS added `api[_-]?key`, `client[_-]?secret`, `session`, and `password` to
  the blocked query-name pattern and covered `apikey` / `apiKey` in the unsafe
  avatar URL test cases.

## Findings

- `sanitizePublicPersonaAvatarUrl(...)` stores or serializes only normalized
  public `https://` URLs or `null`.
- Unsafe non-empty owner input fails with bounded `400` and
  `invalid_avatar_url`; the raw URL is not echoed.
- Omitted `avatarUrl` leaves existing data unchanged on update; `null`, empty,
  and whitespace-only values clear to `null`.
- Existing public and owner serializers null unsafe legacy `avatar_url` rows.
- Public persona and public Space avatar CSS now use the local
  `url(${JSON.stringify(value)})` escaping pattern.
- Owner management adds Save/Clear URL controls only on the private persona
  management surface.
- No public anonymous edit path, upload path, storage bucket, generated media,
  provider media call, billing path, or migration was added.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 15 tests passed, including `apikey` / `apiKey` unsafe query regression. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 26 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 171 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck both ran fresh and passed. |
| `git diff --check` | Pass | No whitespace errors. |
| API/schema diff check | Pass | No changed files under db, Supabase, migrations, packages/db, or packages/types. |
| Diff-only sensitive/scope scan | Pass | Matches were expected sanitizer rules, unsafe fixtures, guardrail docs, or negative assertions. |

## Safety Boundary

No voice calls, WebRTC, microphone input, audio recording, STT/TTS, voice
cloning, avatar likeness generation, image generation, camera capture, video,
uploaded media, generated media, signed upload URLs, storage changes, provider
media calls, provider/model routing, BYOK media setup, token-credit deduction,
media rate limits, cost metering, public anonymous avatar editing, public
visitor media controls, billing, Stripe, Redis, Cloudflare, queues, workers,
migrations, schema expansion, broad Studio redesign, or broad public persona
redesign was added.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
```

Task: close PR481A and route ARIADNE hosted owner/public read-only proof.

Required hosted proof:

- signed-in owner can set a safe HTTPS avatar URL on the existing private
  persona management/edit surface;
- signed-out public `/personas/:publicSlug` desktop and 390px mobile render the
  avatar or initials fallback without layout breakage;
- a public Space route that includes the persona renders the same safe avatar
  behavior;
- signed-in owner can clear the URL and public routes return to initials
  fallback;
- unsafe values such as `javascript:`, `data:`, `localhost`, private IPs,
  `token`, `apikey`, `apiKey`, `signature`, and `x-amz-*` fail closed and never
  appear in public UI, logs, errors, or serialized public payloads;
- no upload, storage, provider/media call, voice/audio/video behavior, billing,
  Stripe, Redis, Cloudflare, worker, queue, migration, or broad redesign is
  exercised.
