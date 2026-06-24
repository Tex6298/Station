# PR210 Public Persona Chat Rehearsal Repair - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: accepted after ARIADNE PR209 rerun

## Frame

ARIADNE blocked PR209 on deployed Railway.

The failure is narrow:

- `/spaces/station-replay-alpha` exposes the public persona card for
  `station-replay-alpha-persona`.
- `/personas/public/station-replay-alpha-persona/context-preview` returns a
  public-safe preview.
- `/personas/public/station-replay-alpha-persona` returns 404.
- Browser route `/personas/station-replay-alpha-persona` renders
  `Public persona not found.`
- The hosted seed has no enabled public-chat persona, so ARIADNE could not
  rehearse signed-in enabled chat.

Likely fault line:

- PR208 public persona readback selects `public_chat_enabled`.
- Context preview does not select `public_chat_enabled`.
- If hosted Supabase is missing migration
  `056_public_persona_chat_alpha.sql`, readback can fail while preview still
  succeeds.

This lane repairs the rehearsal target only. Do not expand public chat scope.

## Target

Make PR209 rerunnable on hosted staging with:

1. public persona profile readback working;
2. context preview still public-safe;
3. exactly one staging replay public persona with public chat enabled for
   signed-in alpha rehearsal.

## Required Work

1. Hosted schema proof/repair
   - Prove whether `personas.public_chat_enabled` exists on the hosted Supabase
     target.
   - If missing, apply the idempotent migration from
     `infra/supabase/migrations/056_public_persona_chat_alpha.sql`.
   - Do not print secrets, tokens, database URLs, service-role keys, or raw
     connection strings.
   - Record sanitized proof only: column present, migration applied/not needed,
     and command class used.

2. Seed support
   - Extend `scripts/staging-replay-seed.mjs` to accept an optional
     `publicPersona.publicChatEnabled` boolean.
   - Default it to `false` so existing public personas remain disabled unless
     the replay corpus opts in.
   - Include `public_chat_enabled` in the public persona seed payload.
   - Update the sanitized replay corpus used by staging to enable exactly the
     `station-replay-alpha-persona` public-chat fixture.
   - Update the example corpus and validation copy if needed so future dry-runs
     show the opt-in state without exposing private material.

3. Public readback proof
   - Verify hosted:
     `/personas/public/station-replay-alpha-persona` returns the sparse public
     persona payload with `publicChat.enabled: true`.
   - Verify hosted:
     `/personas/public/station-replay-alpha-persona/context-preview` still
     returns public-safe sources and excluded private buckets.
   - Verify hosted:
     `/spaces/station-replay-alpha` still returns a routeable public persona
     card for `station-replay-alpha-persona`.
   - Verify browser route `/personas/station-replay-alpha-persona` no longer
     renders `Public persona not found.`

4. Safety boundaries
   - Do not add anonymous chat.
   - Do not add durable visitor transcripts.
   - Do not add private memory, archive, canon, continuity, integrity, owner
     setup, or BYOK/provider settings to public chat.
   - Do not add new product behavior beyond the rehearsal repair.
   - If the public readback query has an error path worth tightening, keep the
     public response generic and add a private/loggable diagnostic only if the
     repo already has a safe pattern for it.

## Validation

Run the narrow local checks you touch:

```text
npm exec --yes pnpm@10.32.1 -- run replay:seed:validate
node scripts/staging-replay-seed.mjs --dry-run
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:writing
git diff --check
git diff --cached --check
```

For hosted proof, use sanitized commands and do not print secrets:

```text
npm exec --yes pnpm@10.32.1 -- run replay:seed:staging
```

Then verify the three hosted public routes named above. If the hosted repair
cannot be completed because config is missing, wake MIMIR with the exact missing
variable or permission.

## DAEDALUS Result

Completed on 2026-06-24.

What changed:

- Hosted schema was missing `personas.public_chat_enabled`. A sanitized
  PostgREST probe returned SQL code `42703`, then DAEDALUS applied the
  idempotent column-add statement from migration `056` using the Supabase CLI
  `db query --db-url` command class. A follow-up sanitized PostgREST probe
  returned HTTP `200` with `columnPresent: true`.
- `scripts/staging-replay-seed.mjs` now accepts optional
  `publicPersona.publicChatEnabled`, validates it as boolean when supplied,
  defaults it to `false`, writes `public_chat_enabled`, and includes
  `publicPersonaChatEnabled` in sanitized summaries.
- `docs/ops/STAGING_REPLAY_CORPUS.example.json` now names exactly one enabled
  public-chat rehearsal fixture:
  `station-replay-alpha-persona`.
- The local ignored staging replay corpus was updated with the same opt-in
  before running the hosted seed.
- The public Space route now selects `public_chat_enabled` for persona cards, so
  the Space card capability matches the public persona profile readback.

Hosted proof:

- `npm exec --yes pnpm@10.32.1 -- run replay:seed:staging` passed and reported
  `publicPersonaChatEnabled: true` in sanitized output.
- `/personas/public/station-replay-alpha-persona` returned HTTP `200` with
  slug `station-replay-alpha-persona`, `publicChat.enabled: true`, and no
  owner/provider/setup fields in the public profile payload.
- `/personas/public/station-replay-alpha-persona/context-preview` returned HTTP
  `200` with one public source, explicit private bucket exclusions, and zero
  private phrase leaks for the known private replay phrases.
- `/spaces/station-replay-alpha` returned HTTP `200`, `access: public`, a
  routeable `station-replay-alpha-persona` card, and
  `cardPublicChatEnabled: true`.
- `/personas/station-replay-alpha-persona` returned HTTP `200` and no
  `Public persona not found.` copy.

Validation:

| Command / check | Result | Notes |
| --- | --- | --- |
| `node --check scripts/staging-replay-seed.mjs` | Pass | Seed helper syntax checked. |
| `npm exec --yes pnpm@10.32.1 -- run replay:seed:validate` | Pass | Example corpus validates and reports `publicPersonaChatEnabled: true`. |
| `node scripts/staging-replay-seed.mjs --dry-run` | Pass | Local replay corpus dry-run reports `station-replay-alpha-persona` with `publicPersonaChatEnabled: true`. |
| `npm exec --yes pnpm@10.32.1 -- run replay:seed:staging` | Pass | Hosted seed completed with sanitized output only. |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 10 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:spaces` | Pass | 1 test passed after proving Space persona cards preserve public chat capability. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 11 tests passed. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors for the repair commit. |

Notes:

- The optional SQL comment statement from migration `056` was not applied from
  this shell: the pooler returned prepared-statement code `42P05`, and the
  direct database host remained blocked by local DNS/IPv6 resolution. The
  functional column is present and the comment remains in the repo migration
  file.
- No anonymous chat, durable visitor transcript, private runtime context,
  provider/BYOK expansion, or broad UI redesign was added.

## Wakeup

When complete, wake ARIADNE for the PR209 rerun:

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- DAEDALUS repaired the PR209 hosted public persona readback/seed blocker.
- The replay public persona now has public readback, context preview, and an
  enabled public-chat seed on hosted staging.
Validation:
- Include sanitized local and hosted route proof.
Task:
- Rerun docs/roadmap/PR209_PUBLIC_PERSONA_CHAT_ALPHA_REHEARSAL_ARIADNE.md.
- Verify signed-out, signed-in enabled chat, report/error states, desktop/mobile
  layout, public-source-only framing, and no private leaks.
```

If the repair exposes a security/privacy concern instead of a product blocker,
wake ARGUS. If config or hosted permission blocks the repair, wake MIMIR.

## MIMIR Closeout

MIMIR accepts PR210 on 2026-06-24 because ARIADNE reran PR209 successfully on
the deployed route after the repair.

Accepted proof:

- hosted public persona readback works for
  `station-replay-alpha-persona`;
- hosted context preview remains public-safe;
- hosted Space card exposes the routeable public persona and public chat
  enabled state;
- signed-in public chat and report duplicate state were rehearsed without
  private context leakage.

Next lane:

- PR211 opens owner/admin public persona interaction readback. Do not reopen
  public chat behavior unless the readback work exposes a concrete bug.
