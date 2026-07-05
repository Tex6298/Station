# PR492A - Owner-Controlled Anonymous Public Chat Gate Result

Owner: DAEDALUS / A2

Opened by: ARGUS / A3

Date implemented: 2026-07-05

Status: Ready for ARGUS review

## Verdict

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the smallest owner-controlled anonymous public chat gate
runtime slice without turning `public_chat_enabled` into anonymous consent.

## Implementation

- Added migration
  `infra/supabase/migrations/068_public_persona_anonymous_chat_gate.sql`.
- Added `personas.public_anonymous_chat_enabled boolean not null default false`
  to typed DB surfaces.
- Added API patch field `publicAnonymousChatEnabled`.
- Kept `publicChatEnabled` as the base public chat enable/disable and rollback
  switch.
- Updated public persona mode resolution so non-replay anonymous alpha requires
  the separate owner gate, while `station-replay-alpha-persona` remains the
  legacy replay anonymous alpha slug.
- Owner/admin public interaction readback now includes the bounded owner gate
  boolean and owner-gate blocker copy.
- Public persona, Space, Discover, and roulette card serialization use the new
  mode source without exposing the raw owner gate.
- Existing Studio persona management gets a scoped anonymous alpha checkbox
  that calls the existing owner `PATCH /personas/:id` route.

## Scope Confirmation

No broad launch/default-on behavior was added.

Preserved boundaries:

- ordinary public personas default to `signed_in_alpha`;
- `station-replay-signed-in-alpha-persona` remains signed-in alpha and
  anonymous-denied unless an owner explicitly enables the new gate;
- disabling public chat or making a persona private forces anonymous gate false;
- signed-out visitors are rejected before counters, rate limits, provider
  calls, token usage, or source retrieval unless resolved mode is
  `anonymous_alpha`;
- rate-limit/provider failures still fail closed before provider calls/token
  usage;
- prompt/source behavior remains public profile, published public documents,
  and linked public discussions only;
- anonymous chat still stores no visitor transcript, identity, raw event,
  cookie, auth header, user agent, IP address, prompt, completion, provider
  payload, or public chat raw event.

No provider/model routing, token attribution, reporting/moderation behavior,
billing, worker, queue, Redis, Cloudflare, connector, OAuth, social dispatch,
or broad UI changed.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 16 personas tests passed, including owner-gated anonymous default-off, owner-only mutation, negative fixture no-drift, rollback, provider fail-closed, aggregate-only storage, replay compatibility, and public-source-only payloads. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 reports tests passed; public reports remain signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/spaces.test.ts` | Pass | 2 spaces tests passed; public Space persona cards serialize anonymous mode from the new gate without raw gate leakage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 13 web helper tests passed, including owner-enabled anonymous copy and no-leak readiness copy. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/community.test.ts` | Pass | 27 community/discover tests passed; run because `discover.ts` changed for public persona card mode serialization. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed with fresh cache misses. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors expected after docs update. |

The npm fallback runner emitted the already-documented pnpm `.npmrc` warning
noise. It was not a validation failure.

## ARGUS Review Focus

- Confirm owner gate mutation is owner-scoped and default-off.
- Confirm `public_chat_enabled` remains base public chat/rollback, not
  anonymous consent.
- Confirm public cards/pages expose mode, not the raw owner gate.
- Confirm negative fixture and ordinary public personas remain signed-in alpha
  until explicitly owner-gated.
- Confirm rate-limit/provider/token behavior fails closed before provider calls.
- Confirm no private/raw/secret visitor, source, provider, prompt, token, cookie,
  auth header, user agent, IP, or raw event data is stored or exposed.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR492A with a separate default-off public_anonymous_chat_enabled owner gate and publicAnonymousChatEnabled PATCH field.
- public_chat_enabled remains the base public chat enable/disable and rollback switch; disabling public chat or private visibility forces the anonymous gate off.
- Non-replay anonymous alpha now requires the owner gate, while station-replay-alpha-persona remains legacy anonymous alpha and public-source-only/no-transcript/fail-closed boundaries are preserved.
Validation:
- test:personas passed with 16 tests.
- test:reports passed with 6 tests.
- spaces.test passed with 2 tests.
- public persona route/interaction helper tests passed with 13 tests.
- community.test passed with 27 tests for Discover serialization coverage.
- typecheck, lint, and git diff --check passed.
Task:
- Review PR492A against owner scope, default-off gate, rollback, public card/readback no-leak, fail-closed runtime, source/persistence boundaries, and forbidden-scope drift.
- If accepted, wake MIMIR to route ARIADNE hosted desktop/375px/390px proof.
- If more fixes are needed, wake DAEDALUS with the smallest repair.
```
