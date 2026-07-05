# PR491A - Public Persona Second Fixture Proof Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for DAEDALUS fixture/proof implementation

## Verdict

```text
ACCEPT_PR491A_SECOND_PUBLIC_PERSONA_FIXTURE_PROOF
```

ARGUS accepts a narrow PR491A lane to create or document a safe non-production
ordinary public persona fixture and prove the signed-in-only/anonymous-deny
boundary before any owner-controlled anonymous gate.

## Decision

Do not open the owner-controlled anonymous gate yet.

Existing evidence is not enough because hosted public route discovery still
finds only:

```text
station-replay-alpha-persona
```

PR468, PR490A, and PR490B already prove the replay alpha path and local tests
prove non-replay anonymous denial, but hosted proof still lacks an ordinary
public persona fixture. Opening an owner gate without that proof would turn the
fixture gap into a product assumption.

The smallest safe unblock is therefore one boring ordinary public persona
fixture and hosted proof that it remains signed-in alpha and anonymous-denied.

## Accepted Fixture Boundary

DAEDALUS may add one narrow hosted fixture/proof path.

Fixture requirements:

- exactly one ordinary public persona fixture, not the replay alpha slug;
- preferred public slug: `station-replay-signed-in-alpha-persona`;
- safe non-UUID public slug only;
- owned by the existing non-production replay owner or an explicitly configured
  non-production proof owner;
- `visibility: "public"`;
- `public_chat_enabled: true`, so the fixture proves signed-in alpha behavior
  while anonymous visitors remain denied;
- public-safe `name` and `shortDescription` only;
- `provider: "platform"` is acceptable;
- `longDescription`, `awakeningPrompt`, `styleNotes`, private source links,
  documents, Memory, Canon, Continuity, Integrity, Archive, transcripts,
  provider payloads, prompts, credentials, storage paths, raw ids, and
  secret-shaped values must not be part of the fixture payload or proof output.

Runtime requirements:

- `publicPersonaChatMode` must remain unchanged;
- `station-replay-alpha-persona` remains the only `anonymous_alpha` slug;
- the ordinary fixture must read as `signed_in_alpha`;
- signed-out anonymous chat POSTs for the ordinary fixture must return
  `public_persona_auth_required`;
- public reporting remains signed-in only.

## Accepted Implementation Boundary

Preferred implementation is a new narrow script and proof docs:

- `scripts/staging-public-persona-fixture.mjs`
- `scripts/staging-public-persona-fixture.test.mjs`
- `docs/ops/STAGING_PUBLIC_PERSONA_FIXTURE_PROOF.md`
- roadmap/status/validation docs

The script should be idempotent and safe:

- support dry-run/validate mode without hosted writes;
- require explicit hosted seed access for writes and never print secret values;
- print only safe public labels, public slugs, booleans, counts, and pass/fail
  states;
- fail if the fixture slug is already owned by a different owner;
- avoid logging owner ids, persona ids, raw Supabase URLs, service keys,
  cookies, auth headers, IP addresses, user agents, stack traces, provider
  payloads, prompts, completions, private source bodies, or raw database rows.

If DAEDALUS finds a smaller existing safe seed path, it may use that only if the
result remains equally narrow and does not rerun or mutate the broad replay
corpus unnecessarily. Any broader staging replay seed change must be justified
in the result doc.

Allowed test-only files if needed:

- `apps/api/src/routes/personas.test.ts`
- `apps/web/lib/public-persona-route.test.ts`
- `apps/web/lib/public-persona-interaction.test.ts`

Do not change API/runtime source files unless DAEDALUS finds that the existing
runtime does not actually enforce the accepted boundary. In that case, wake
ARGUS/MIMIR with the concrete blocker instead of broadening scope.

## Forbidden Scope

PR491A must not:

- enable anonymous chat for all public personas;
- enable anonymous chat for the new ordinary fixture;
- add owner-controlled anonymous enablement;
- change `publicPersonaChatMode`;
- change public chat prompt sources, provider/model routing, rate-limit keys or
  behavior, token attribution, public reporting, or moderation behavior;
- add migrations, schema, config flags, billing, Stripe, workers, queues, Redis,
  Cloudflare, connectors, OAuth, social dispatch, public launch claims, or
  broad public persona UI work;
- persist anonymous visitor transcripts, visitor identity analytics, cookies,
  raw request events, auth headers, user agents, IPs, prompts, completions,
  provider payloads, or public chat raw events;
- expose raw owner/persona/document/thread/source ids, private source text,
  storage paths, signed URLs, database URLs, tokens, cookies, API keys,
  webhook secrets, bearer/JWT-shaped values, or secret-shaped values.

## Required Validation

DAEDALUS should run:

```powershell
node scripts/staging-public-persona-fixture.mjs --dry-run
node --test scripts/staging-public-persona-fixture.test.mjs
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If DAEDALUS chooses an existing script path instead of adding
`staging-public-persona-fixture.mjs`, replace the first two commands with the
exact dry-run/validation command and focused test for that path.

## Required Hosted Proof

After ARGUS accepts the implementation, MIMIR should route ARIADNE hosted
desktop/`375px`/`390px` rehearsal.

ARIADNE should verify:

- hosted web/API health and deployed commit freshness;
- the second ordinary public persona route exists using a safe public slug;
- owner/admin Studio public-interaction readback for the second fixture says
  signed-in alpha only, not anonymous alpha;
- signed-out public page for the second fixture does not show anonymous chat
  controls;
- signed-out anonymous chat POST for the second fixture returns
  `public_persona_auth_required` before provider calls/token usage;
- replay alpha remains anonymous alpha and no-drift;
- no private/raw/secret/provider/token/cookie/header/IP/user-agent readback,
  public Salon chat-source overclaim, broad anonymous/runtime-expansion claim,
  live connector/OAuth claim, worker/queue claim, billing claim, or placeholder
  control appears.

If hosted seed access is unavailable, DAEDALUS should wake MIMIR with
`BLOCKED_NEEDS_HOSTED_SEED_ACCESS` and the exact missing access/tooling
condition. Do not request or print secret values.

## Preflight Validation Performed

ARGUS reviewed PR491 handoff, PR490B closeout/rerun evidence, PR490A preflight,
PR468 closeout, current public persona route tests, current mode resolver, and
the staging replay seed/corpus shape.

Validation run on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Existing hosted proof is not enough for an owner gate; current script/corpus shape plans exactly one public persona, the replay alpha slug. |
| `node scripts/staging-replay-seed.mjs --validate-corpus docs/ops/STAGING_REPLAY_CORPUS.example.json` | Pass | Committed example corpus validates and reports `publicPersonas: 1` with `publicPersonaSlug: station-replay-alpha-persona`. |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 15 personas tests passed, including replay anonymous mode, non-replay signed-in-only/default anonymous denial, owner rollback, public-source-only provider payloads, and no transcript/identity persistence. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 report tests passed; public reporting remains signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 12 public persona route/interaction helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR491A as a second ordinary public persona fixture/proof lane.
- Existing hosted evidence is not enough for an owner-controlled anonymous gate because public route discovery still finds only station-replay-alpha-persona.
- Implement the smallest safe non-production fixture path for one ordinary public persona, preferably slug station-replay-signed-in-alpha-persona, with public_chat_enabled true but signed-in alpha only.
- Do not change anonymous runtime eligibility, publicPersonaChatMode, prompt sources, provider routing, rate limits, API contracts, public reporting/moderation, billing, workers, queues, Redis, Cloudflare, connectors, OAuth, social dispatch, public launch claims, or broad UI.
Task:
- Add a narrow idempotent fixture/proof script and docs, or justify an equally narrow existing seed path.
- Ensure dry-run/validation output contains only safe public labels, slugs, booleans, counts, and pass/fail states; never print secrets, raw ids, private source bodies, prompts, completions, provider payloads, storage paths, auth headers, cookies, IPs, or user agents.
- Prove the ordinary fixture remains signed_in_alpha and anonymous chat returns public_persona_auth_required while replay alpha remains the only anonymous_alpha slug.
Validation:
- node scripts/staging-public-persona-fixture.mjs --dry-run
- node --test scripts/staging-public-persona-fixture.test.mjs
- npm exec --yes pnpm@10.32.1 -- run test:personas
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
Hosted:
- After ARGUS accepts implementation, ARIADNE must rehearse hosted desktop/375px/390px proof for the second fixture route, owner signed-in-only readback, signed-out anonymous-deny behavior, replay no-drift, mobile fit, privacy/scope, and no runtime expansion claims.
```
