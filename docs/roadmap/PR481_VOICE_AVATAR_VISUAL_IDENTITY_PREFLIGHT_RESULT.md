# PR481 Voice / Avatar Visual Identity Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

State: ACCEPT_PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL

Source: `docs/roadmap/PR481_VOICE_AVATAR_VISUAL_IDENTITY_PREFLIGHT_ARGUS.md`

## Verdict

ARGUS accepts the smallest safe Voice / Avatar visual-identity slice:

```text
PR481A - Owner Persona Avatar URL Control
```

This is not a media feature. It is owner-controlled public-image URL metadata
for existing persona profile rendering, using the existing `personas.avatar_url`
field and public `avatarUrl` serializer path.

## Accepted Scope

DAEDALUS may implement PR481A with these files or close local equivalents:

- `apps/api/src/lib/persona-serialization.ts`
  - add an exported `sanitizePublicPersonaAvatarUrl(...)` or equivalent helper;
  - use it when returning `avatarUrl` from public persona serializers;
  - return `null` for unsafe legacy `avatar_url` rows instead of passing them
    through to public clients.
- `apps/api/src/routes/personas.ts`
  - add `avatarUrl` to owner create/update schemas;
  - store only sanitized safe URLs or `null`;
  - reject unsafe non-empty URL input with a bounded `400` response;
  - keep owner scope on existing authenticated persona create/update routes.
- `apps/web/components/studio/persona-management.tsx` or the existing
  `/studio/personas/[personaId]/edit` management surface
  - add a small owner-only Avatar URL control with Save and Clear behavior;
  - use the existing `PATCH /personas/:id` route;
  - do not add upload, generated media, public editing, or broad Studio
    redesign.
- `apps/web/app/personas/[publicSlug]/page.tsx`
  - keep initials fallback when `avatarUrl` is absent;
  - escape CSS `backgroundImage` values with the repo's existing
    `url(${JSON.stringify(value)})` pattern or a shared helper.
- `apps/web/app/space/[slug]/page.tsx`
  - apply the same CSS URL escaping for public Space persona cards that render
    persona `avatarUrl`.
- `apps/api/src/routes/personas.test.ts`
  - cover safe set, clear, unsafe reject, owner scope, and public serializer
    nulling of unsafe legacy rows.
- `apps/web/lib/public-persona-route.test.ts` or an equivalent focused web
  helper/source test
  - cover CSS escaping and source assertions that public avatar renderers do
    not interpolate raw CSS URL strings.

No database migration, schema expansion, storage bucket, signed upload URL, or
new public serializer field is accepted because `personas.avatar_url` and
`avatarUrl` already exist.

## URL Safety Rules

Accepted avatar input:

- omitted `avatarUrl`: no change;
- `null`, empty string, or whitespace-only string: clear to `null`;
- absolute `https://` public image URL, normalized with `new URL(...)`.

Rejected avatar input:

- `javascript:`, `data:`, `file:`, `blob:`, `ftp:`, `http:`, protocol-relative,
  relative, or malformed URLs;
- localhost, loopback, `0.0.0.0`, private/link-local IPv4, private/link-local
  IPv6, `.local`, and single-label internal hostnames;
- URLs with username or password components;
- Station/Supabase/Railway storage or signed-download URLs unless MIMIR later
  accepts a storage/privacy policy;
- query strings with secret-shaped names or values such as `token`, `secret`,
  `key`, `signature`, `sig`, `access_token`, `auth`, `jwt`, `cookie`, or
  `x-amz-*`;
- values longer than a conservative URL length cap.

Unsafe non-empty input must fail closed with a bounded message. It must not be
logged with the raw URL, echoed to public UI, silently stored, or silently
treated as success.

## Serialization Rules

- Owner create/update may write only the sanitized URL or `null`.
- Owner `GET /personas/:id` may return `avatarUrl`, but it must be the same
  safe normalized URL or `null`.
- Public and non-owner serializers remain limited to existing public persona
  fields: `name`, `shortDescription`, `visibility`, safe `avatarUrl`, safe
  `publicSlug`, and `publicChat`.
- Public persona, public Space persona cards, and roulette payloads must never
  include raw owner ID, persona ID, provider payload, storage path, token,
  cookie, signed URL, SQL/table detail, stack trace, or secret-shaped avatar
  value.

## Non-Goals

Do not add voice calls, WebRTC, microphone input, audio recording,
speech-to-text, text-to-speech, voice cloning, avatar likeness generation,
image generation, camera capture, video, uploaded files, generated media files,
signed upload URLs, storage changes, provider media calls, provider/model
routing, BYOK media setup, token-credit deduction, media rate limits, cost
metering, public anonymous avatar editing, public visitor media controls,
billing, Stripe, Redis, Cloudflare, queues, workers, migrations, broad Studio
redesign, or broad public persona redesign.

## Validation Run

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 14 tests passed against the current persona route baseline. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 171 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from cache. |

Expected DAEDALUS validation after implementation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

DAEDALUS should also run a diff-only scan for `javascript:`, `data:`, `file:`,
`blob:`, `localhost`, `127.0.0.1`, `192.168.`, `10.`, `172.16.`, `token`,
`secret`, `signature`, `x-amz`, `supabase`, `storage`, `upload`, `voice`,
`audio`, `webrtc`, `microphone`, `provider`, `billing`, `Stripe`, `Redis`,
`Cloudflare`, `worker`, and `queue`, then document why any matches are expected
test fixtures or guardrail strings.

## ARIADNE Requirement

If ARGUS accepts the implementation, MIMIR should route ARIADNE hosted proof:

- signed-in owner can set a safe HTTPS avatar URL on the existing private
  persona management/edit surface;
- signed-out public `/personas/:publicSlug` desktop and 390px mobile render the
  avatar or initials fallback without layout breakage;
- a public Space route that includes the persona renders the same safe avatar
  behavior;
- signed-in owner can clear the URL and public routes return to initials
  fallback;
- unsafe values fail closed and never appear in public UI, logs, errors, or
  serialized public payloads;
- no upload, storage, provider/media call, voice/audio/video behavior, billing,
  Stripe, Redis, Cloudflare, worker, queue, migration, or broad redesign is
  exercised.

## Handoff

```text
WAKEUP A2:
Codename: DAEDALUS
```

Task: implement `PR481A - Owner Persona Avatar URL Control` exactly within the
accepted scope above.
