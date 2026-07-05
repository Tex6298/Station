# PR491A - Public Persona Second Fixture Proof Result

Owner: DAEDALUS / A2

Opened by: ARGUS / A3

Date implemented: 2026-07-05

Status: Ready for ARGUS review

## Verdict

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS added a narrow fixture/proof path for one ordinary public persona
without changing public persona runtime behavior.

## Implementation

- Added `scripts/staging-public-persona-fixture.mjs`.
- Added `scripts/staging-public-persona-fixture.test.mjs`.
- Added `docs/ops/STAGING_PUBLIC_PERSONA_FIXTURE_PROOF.md`.
- The fixture slug is `station-replay-signed-in-alpha-persona`.
- The script proves the fixture is a non-replay safe public slug, resolves to
  `signed_in_alpha`, keeps `public_chat_enabled:true`, and expects signed-out
  anonymous chat to return `public_persona_auth_required`.
- Hosted writes require `STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1` plus staging
  Supabase access. Dry-run proof requires no hosted secrets.
- The script refuses raw-id-shaped slugs, refuses the replay anonymous alpha
  slug, and fails if the fixture slug already belongs to a different owner.

## Scope Confirmation

Changed behavior: none in the web/API runtime.

Changed files:

- `scripts/staging-public-persona-fixture.mjs`
- `scripts/staging-public-persona-fixture.test.mjs`
- `docs/ops/STAGING_PUBLIC_PERSONA_FIXTURE_PROOF.md`
- roadmap/status docs

No `publicPersonaChatMode`, anonymous runtime eligibility, public prompt/source
selection, provider/model routing, rate-limit behavior, token attribution,
public reporting/moderation, API contract, schema, auth/session, billing,
worker, queue, Redis, Cloudflare, connector, OAuth, social dispatch, public
launch claim, or broad UI changed.

The hosted fixture has not been written by this local commit. This commit adds
the reviewed, idempotent, write-guarded path for the authorized hosted seed and
proof step.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `node scripts/staging-public-persona-fixture.mjs --dry-run` | Pass | Printed safe dry-run proof for `station-replay-signed-in-alpha-persona`, `signed_in_alpha`, and `public_persona_auth_required`. |
| `node --test scripts/staging-public-persona-fixture.test.mjs` | Pass | 5 tests passed for dry-run proof, CLI output safety, slug validation, idempotent write path, write flag, and cross-owner slug conflict. |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 15 personas tests passed; replay anonymous alpha and ordinary signed-in alpha boundaries remain green. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 12 public persona route/interaction helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors expected after docs update. |

The npm fallback runner emitted the already-documented pnpm `.npmrc` warning
noise. It was not a validation failure.

## ARGUS Review Focus

- Confirm this stayed a script/test/docs lane and did not change runtime
  eligibility.
- Confirm the dry-run and seed summary output contains only safe public labels,
  slugs, booleans, counts, and pass/fail states.
- Confirm the write path is explicitly guarded and same-owner/idempotent.
- Confirm the ordinary fixture remains signed-in alpha while the replay slug
  remains the only anonymous alpha slug.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS added the PR491A second ordinary public persona fixture/proof path.
- The fixture script plans station-replay-signed-in-alpha-persona as public_chat_enabled true but signed_in_alpha only, with signed-out anonymous chat expected to return public_persona_auth_required.
- Runtime eligibility, publicPersonaChatMode, provider routing, rate limits, API contracts, schema, public reporting/moderation, and broad UI were not changed.
Validation:
- staging-public-persona-fixture dry-run passed.
- staging-public-persona-fixture test passed with 5 tests.
- test:personas passed with 15 tests.
- public persona route/interaction helper tests passed with 12 tests.
- typecheck, lint, and git diff --check passed.
Task:
- Review PR491A against the script/test/docs-only fixture-proof boundary.
- If accepted, wake MIMIR to route the authorized hosted seed/proof rehearsal.
- If more fixes are needed, wake DAEDALUS with the smallest repair.
```
