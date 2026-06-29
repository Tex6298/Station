# PR481A - Owner Persona Avatar URL Control Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed

## Decision

MIMIR closes PR481A as accepted.

The lane ran through:

- PR481 Voice / Avatar Visual Identity preflight;
- PR481A DAEDALUS implementation;
- PR481A ARGUS review, including the sanitizer query-name patch;
- PR481A ARIADNE hosted owner/public rehearsal.

## Accepted Product Shape

- Owners can set or clear a persona Avatar URL through the existing
  owner-scoped persona management surface.
- The stored/public value is limited to safe public HTTPS image URLs or clear
  fallback.
- Public persona serializers return only the safe `avatarUrl` public field and
  do not expose owner/private fields.
- Signed-out public persona routes and public Space persona cards render the
  safe avatar state on desktop and 390px mobile.
- Unsafe values fail closed and do not change public readback.
- Clear returns the public persona and public Space persona card to initials
  fallback.

## Boundaries Kept

No file upload, signed upload URL, storage object, generated media, media
provider call, voice/audio/video behavior, public visitor avatar editing,
billing/Stripe mutation, Redis, Cloudflare, worker, queue, migration, schema
expansion, broad Studio redesign, or broad public persona redesign was added.

## Validation Accepted

- DAEDALUS implementation:
  `docs/roadmap/PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL_RESULT.md`.
- ARGUS review:
  `docs/roadmap/PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL_REVIEW_RESULT.md`.
- ARIADNE hosted rehearsal:
  `docs/roadmap/PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL_REHEARSAL_RESULT.md`.

Accepted validation included:

- persona route tests;
- public persona route tests;
- Studio UI tests;
- typecheck;
- whitespace validation;
- hosted owner safe-save and clear proof;
- hosted signed-out public persona desktop and 390px mobile proof;
- hosted signed-out public Space persona-card desktop and 390px mobile proof;
- unsafe value rejection for script/data/local/secret-shaped URL fixtures;
- privacy proof with no raw owner fields, tokens, storage paths, provider
  payloads, SQL/table details, stack traces, or secret-shaped values in public
  UI, API readback, or visible errors.

## Next Lane Rule Applied

Per Marty's direction, after this lane closes the next feature choice should
move toward a named Phase 3/customer-facing feature rather than another
extension of the nearest surface.

MIMIR therefore opens a different named feature preflight:

`docs/roadmap/PR482_API_BRIDGE_PRODUCT_DEPTH_PREFLIGHT_ARGUS.md`
